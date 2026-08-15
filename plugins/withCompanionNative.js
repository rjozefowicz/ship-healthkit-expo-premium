/**
 * Copy native templates into ios/ after prebuild and remind about App Group / bridges.
 */
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    const src = path.join(from, name);
    const dest = path.join(to, name);
    if (fs.statSync(src).isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

const withCompanionNative = (config) =>
  withDangerousMod(config, [
    'ios',
    (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const iosRoot = cfg.modRequest.platformProjectRoot;
      const nativeRoot = path.join(projectRoot, 'native');

      const pairs = [
        ['HealthStack', path.join(iosRoot, 'HealthStack')],
        ['HealthStackShared', path.join(iosRoot, 'HealthStackShared')],
        ['HealthStackWatch', path.join(iosRoot, 'HealthStackWatch')],
      ];

      for (const [folder, dest] of pairs) {
        const src = path.join(nativeRoot, folder);
        if (fs.existsSync(src)) {
          copyDir(src, dest);
          console.log(`[withCompanionNative] synced native/${folder} → ios/${folder}`);
        }
      }

      console.log(
        '[withCompanionNative] Next: add WidgetDataBridge + WatchConnectivityBridge to the main target, ' +
          'link HealthStackShared into ExpoWidgetsTarget + Watch, create Watch target, enable App Group ' +
          'group.com.example.healthstack — see README.'
      );
      return cfg;
    },
  ]);

module.exports = withCompanionNative;
