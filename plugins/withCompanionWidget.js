/**
 * Expo config plugin: inject native HealthStackWidget into ExpoWidgetsTarget.
 *
 * expo-widgets (Live Activity shell) deletes and recreates ExpoWidgetsTarget on
 * every prebuild. This plugin runs AFTER expo-widgets and:
 *   1. Adds HealthStackWidget() to the WidgetBundle
 *   2. Appends native/HealthStackShared/HealthStackWidget.swift into index.swift
 *
 * CompanionData.swift / CompanionTheme.swift are compiled into the widget target
 * by scripts/companion-xcode.js — do not also add HealthStackWidget.swift to that
 * target or you will get a duplicate Widget type.
 */
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

function widgetSwiftBody(projectRoot) {
  const srcPath = path.join(
    projectRoot,
    'native',
    'HealthStackShared',
    'HealthStackWidget.swift'
  );
  if (!fs.existsSync(srcPath)) {
    throw new Error(`[withCompanionWidget] missing ${srcPath}`);
  }
  return fs
    .readFileSync(srcPath, 'utf8')
    .replace(/^import .*\n/gm, '')
    .trim();
}

function patchWidgetIndex(projectRoot, iosRoot) {
  const indexPath = path.join(iosRoot, 'ExpoWidgetsTarget', 'index.swift');
  if (!fs.existsSync(indexPath)) {
    console.warn('[withCompanionWidget] ExpoWidgetsTarget/index.swift missing — run prebuild first');
    return false;
  }

  let src = fs.readFileSync(indexPath, 'utf8');
  if (src.includes('struct HealthStackWidget')) {
    return true;
  }

  if (!src.includes('HealthStackWidget()')) {
    src = src.replace('WidgetLiveActivity()', 'HealthStackWidget()\n    WidgetLiveActivity()');
  }

  src += `\n\n// MARK: - HealthStack home-screen widget (native Swift)\n${widgetSwiftBody(projectRoot)}\n`;
  fs.writeFileSync(indexPath, src);
  console.log('[withCompanionWidget] Patched ExpoWidgetsTarget/index.swift');
  return true;
}

const withCompanionWidget = (config) =>
  withDangerousMod(config, [
    'ios',
    (cfg) => {
      patchWidgetIndex(cfg.modRequest.projectRoot, cfg.modRequest.platformProjectRoot);
      return cfg;
    },
  ]);

module.exports = withCompanionWidget;
module.exports.patchWidgetIndex = patchWidgetIndex;

if (require.main === module) {
  const projectRoot = path.join(__dirname, '..');
  patchWidgetIndex(projectRoot, path.join(projectRoot, 'ios'));
}
