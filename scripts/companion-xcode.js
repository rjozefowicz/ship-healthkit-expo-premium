#!/usr/bin/env node
/**
 * Copy native templates into ios/ and wire Xcode targets.
 * Used from config plugins (in-memory pbx) and from post-prebuild (on disk).
 */
const fs = require('fs');
const path = require('path');
const xcode = require('xcode');

const WATCH_NAME = 'HealthStackWatch';
const WIDGET_TARGET = 'ExpoWidgetsTarget';
const WATCH_BUNDLE_ID = 'com.example.healthstack.watchkitapp';

const SHARED_SWIFT = ['CompanionData.swift', 'CompanionTheme.swift'];
const MAIN_BRIDGES = [
  'WidgetDataBridge.swift',
  'WidgetDataBridge.m',
  'WatchConnectivityBridge.swift',
  'WatchConnectivityBridge.m',
];
const WATCH_SWIFT = [
  'HealthStackWatchApp.swift',
  'ContentView.swift',
  'WatchSessionManager.swift',
  'Views/TodayView.swift',
  'Views/ActiveSessionView.swift',
];

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    const src = path.join(from, name);
    const dest = path.join(to, name);
    if (fs.statSync(src).isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

function findMainAppDir(iosRoot) {
  if (!fs.existsSync(iosRoot)) return null;
  for (const name of fs.readdirSync(iosRoot)) {
    const dir = path.join(iosRoot, name);
    if (fs.existsSync(path.join(dir, 'AppDelegate.swift'))) return dir;
  }
  return null;
}

function findPbxPath(iosRoot) {
  const proj = fs.readdirSync(iosRoot).find((f) => f.endsWith('.xcodeproj'));
  return proj ? path.join(iosRoot, proj, 'project.pbxproj') : null;
}

function unquote(value) {
  return String(value || '').replace(/^"+|"+$/g, '');
}

function findTargetUuid(project, name) {
  const section = project.pbxNativeTargetSection();
  for (const key of Object.keys(section)) {
    if (key.endsWith('_comment')) continue;
    const n = unquote(section[key].name || section[key].productName);
    if (n === name) return key;
  }
  return null;
}

function findGroupKey(project, pathOrName) {
  const groups = project.hash.project.objects.PBXGroup;
  for (const key of Object.keys(groups)) {
    if (key.endsWith('_comment')) continue;
    const g = groups[key];
    if (unquote(g.path) === pathOrName || unquote(g.name) === pathOrName) return key;
  }
  return null;
}

function hasFileRef(project, relPath) {
  const basename = path.basename(relPath);
  const refs = project.pbxFileReferenceSection();
  for (const key of Object.keys(refs)) {
    if (key.endsWith('_comment')) continue;
    const p = unquote(refs[key].path);
    if (p === relPath || p === basename || p.endsWith(`/${basename}`)) return key;
  }
  return null;
}

function getSourcesPhase(project, targetUuid) {
  const target = project.pbxNativeTargetSection()[targetUuid];
  const phases = project.hash.project.objects.PBXSourcesBuildPhase || {};
  for (const entry of target.buildPhases || []) {
    if (phases[entry.value]) return phases[entry.value];
  }
  return null;
}

function sourceAlreadyInTarget(project, basename, targetUuid) {
  const phase = getSourcesPhase(project, targetUuid);
  if (!phase || !phase.files) return false;
  return phase.files.some((f) => String(f.comment || '').includes(basename));
}

function addToSourcesPhase(project, targetUuid, file) {
  const phase = getSourcesPhase(project, targetUuid);
  if (phase) {
    phase.files.push({ value: file.uuid, comment: `${file.basename} in Sources` });
    return;
  }
  file.target = targetUuid;
  project.addToPbxSourcesBuildPhase(file);
}

function addSourceToTarget(project, relPath, groupKey, targetUuid) {
  const basename = path.basename(relPath);
  const existing = hasFileRef(project, relPath);
  if (existing) {
    const refs = project.pbxFileReferenceSection()[existing];
    if (relPath.includes('/') && unquote(refs.path) === basename) {
      refs.path = `"${relPath}"`;
    }
  }
  if (sourceAlreadyInTarget(project, basename, targetUuid)) return;
  if (existing) {
    const refs = project.pbxFileReferenceSection()[existing];
    if (relPath.includes('/') && unquote(refs.path) === basename) {
      refs.path = `"${relPath}"`;
    }
    const file = {
      uuid: project.generateUuid(),
      fileRef: existing,
      basename,
      group: 'Sources',
      target: targetUuid,
    };
    project.addToPbxBuildFileSection(file);
    addToSourcesPhase(project, targetUuid, file);
    return;
  }

  const created = project.addFile(relPath, groupKey);
  if (!created) return;
  created.uuid = project.generateUuid();
  created.basename = basename;
  created.group = 'Sources';
  created.target = targetUuid;
  project.addToPbxBuildFileSection(created);
  addToSourcesPhase(project, targetUuid, created);
}

function ensureGroup(project, name, relPath, parentKey) {
  let key = findGroupKey(project, name) || findGroupKey(project, relPath);
  if (!key) {
    const group = project.addPbxGroup([], name, relPath);
    key = group.uuid;
    if (parentKey) project.addToPbxGroup(key, parentKey);
  }
  return key;
}

function patchWatchBuildSettings(project, watchUuid) {
  const target = project.pbxNativeTargetSection()[watchUuid];
  target.productType = '"com.apple.product-type.application"';
  const list = project.pbxXCConfigurationList()[target.buildConfigurationList];
  const configs = project.pbxXCBuildConfigurationSection();
  for (const entry of list.buildConfigurations) {
    const conf = configs[entry.value];
    if (!conf?.buildSettings) continue;
    Object.assign(conf.buildSettings, {
      SDKROOT: 'watchos',
      WATCHOS_DEPLOYMENT_TARGET: '"10.0"',
      TARGETED_DEVICE_FAMILY: '"4"',
      SWIFT_VERSION: '"5.0"',
      GENERATE_INFOPLIST_FILE: '"NO"',
      INFOPLIST_FILE: `"${WATCH_NAME}/Info.plist"`,
      CODE_SIGN_ENTITLEMENTS: `"${WATCH_NAME}/${WATCH_NAME}.entitlements"`,
      PRODUCT_BUNDLE_IDENTIFIER: `"${WATCH_BUNDLE_ID}"`,
      INFOPLIST_KEY_CFBundleDisplayName: '"Health Stack"',
      SKIP_INSTALL: '"YES"',
      ENABLE_PREVIEWS: '"YES"',
      ASSETCATALOG_COMPILER_APPICON_NAME: 'AppIcon',
    });
  }
}

function copyNativeFiles(projectRoot) {
  const iosRoot = path.join(projectRoot, 'ios');
  if (!fs.existsSync(iosRoot)) {
    console.warn('[companion-xcode] no ios/ — run expo prebuild first');
    return null;
  }

  const nativeRoot = path.join(projectRoot, 'native');
  const mainAppDir = findMainAppDir(iosRoot);
  if (!mainAppDir) {
    console.warn('[companion-xcode] AppDelegate.swift not found');
    return null;
  }

  const mainAppName = path.basename(mainAppDir);
  const bridgeSrc = path.join(nativeRoot, 'HealthStack');
  if (fs.existsSync(bridgeSrc)) {
    for (const file of fs.readdirSync(bridgeSrc)) {
      fs.copyFileSync(path.join(bridgeSrc, file), path.join(mainAppDir, file));
    }
    console.log(`[companion-xcode] copied bridges → ios/${mainAppName}/`);
  }

  for (const folder of ['HealthStackShared', 'HealthStackWatch']) {
    const src = path.join(nativeRoot, folder);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(iosRoot, folder));
      console.log(`[companion-xcode] synced native/${folder}`);
    }
  }

  return { iosRoot, mainAppName };
}

function relativizeAbsolutePaths(project, iosRoot) {
  const prefix = iosRoot.replace(/\/$/, '');
  const refs = project.pbxFileReferenceSection();
  for (const key of Object.keys(refs)) {
    if (key.endsWith('_comment')) continue;
    const p = unquote(refs[key].path);
    if (!p.startsWith(prefix)) continue;
    const rel = p.slice(prefix.length).replace(/^\//, '');
    const dir = path.dirname(rel);
    const base = path.basename(rel);
    refs[key].path = dir === 'ExpoWidgetsTarget' ? base : rel;
  }
}

function applyXcodeLinks(project, mainAppName, iosRoot) {
  if (iosRoot) relativizeAbsolutePaths(project, iosRoot);
  const mainUuid = project.getFirstTarget().uuid;
  const widgetUuid = findTargetUuid(project, WIDGET_TARGET);
  const mainGroup = project.getFirstProject().firstProject.mainGroup;
  const appGroupKey = findGroupKey(project, mainAppName) || mainGroup;
  const sharedGroupKey = ensureGroup(project, 'HealthStackShared', 'HealthStackShared', mainGroup);

  if (widgetUuid) {
    for (const name of SHARED_SWIFT) {
      addSourceToTarget(project, name, sharedGroupKey, widgetUuid);
    }
    console.log('[companion-xcode] linked HealthStackShared → ExpoWidgetsTarget');
  } else {
    console.warn('[companion-xcode] ExpoWidgetsTarget not found yet');
  }

  for (const name of MAIN_BRIDGES) {
    addSourceToTarget(project, `${mainAppName}/${name}`, appGroupKey, mainUuid);
  }
  console.log('[companion-xcode] linked bridges → main target');

  let watchUuid = findTargetUuid(project, WATCH_NAME);
  if (!watchUuid) {
    const created = project.addTarget(WATCH_NAME, 'watch2_app', WATCH_NAME, WATCH_BUNDLE_ID);
    watchUuid = created.uuid;
    project.addBuildPhase([], 'PBXSourcesBuildPhase', 'Sources', watchUuid);
    project.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', watchUuid);
    project.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', watchUuid);
    patchWatchBuildSettings(project, watchUuid);
    console.log('[companion-xcode] added HealthStackWatch target');
  }

  const watchGroupKey = ensureGroup(project, WATCH_NAME, WATCH_NAME, mainGroup);
  for (const rel of WATCH_SWIFT) {
    addSourceToTarget(project, rel, watchGroupKey, watchUuid);
  }
  for (const name of SHARED_SWIFT) {
    addSourceToTarget(project, name, sharedGroupKey, watchUuid);
  }

  try {
    project.addTargetDependency(mainUuid, [watchUuid]);
  } catch {
    // already linked
  }
}

function syncFiles(projectRoot) {
  const copied = copyNativeFiles(projectRoot);
  if (!copied) return;
  const pbxPath = findPbxPath(copied.iosRoot);
  if (!pbxPath) return;
  const project = xcode.project(pbxPath);
  project.parseSync();
    applyXcodeLinks(project, copied.mainAppName, copied.iosRoot);
  fs.writeFileSync(pbxPath, project.writeSync());
  console.log('[companion-xcode] project.pbxproj updated');
}

module.exports = {
  copyNativeFiles,
  applyXcodeLinks,
  syncFiles,
  findMainAppDir,
};

if (require.main === module) {
  syncFiles(path.join(__dirname, '..'));
}
