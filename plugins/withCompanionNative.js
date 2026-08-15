/**
 * Copy native templates into ios/ after prebuild, then add them to Xcode targets.
 * Must run AFTER expo-widgets so ExpoWidgetsTarget exists in the pbxproj.
 */
const path = require('path');
const { withDangerousMod, withXcodeProject } = require('expo/config-plugins');
const { copyNativeFiles, applyXcodeLinks, findMainAppDir } = require('../scripts/companion-xcode');

const withCompanionNative = (config) => {
  config = withDangerousMod(config, [
    'ios',
    (cfg) => {
      copyNativeFiles(cfg.modRequest.projectRoot);
      return cfg;
    },
  ]);

  config = withXcodeProject(config, (cfg) => {
    const mainAppDir = findMainAppDir(cfg.modRequest.platformProjectRoot);
    if (!mainAppDir) return cfg;
    applyXcodeLinks(cfg.modResults, path.basename(mainAppDir), cfg.modRequest.platformProjectRoot);
    return cfg;
  });

  return config;
};

module.exports = withCompanionNative;
