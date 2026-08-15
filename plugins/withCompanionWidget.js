/**
 * Inject HealthStackWidget into ExpoWidgetsTarget after expo-widgets regenerates index.swift.
 * Must run AFTER the expo-widgets plugin.
 */
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const WIDGET_MARKER = 'struct HealthStackWidget: Widget';

const withCompanionWidget = (config) =>
  withDangerousMod(config, [
    'ios',
    (cfg) => {
      const indexPath = path.join(
        cfg.modRequest.platformProjectRoot,
        'ExpoWidgetsTarget',
        'index.swift'
      );
      if (!fs.existsSync(indexPath)) {
        console.warn('[withCompanionWidget] ExpoWidgetsTarget/index.swift missing — run prebuild first');
        return cfg;
      }

      let src = fs.readFileSync(indexPath, 'utf8');
      if (!src.includes('HealthStackWidget()')) {
        src = src.replace(
          /WidgetLiveActivity\(\)/,
          'WidgetLiveActivity()\n    HealthStackWidget()'
        );
      }

      const sharedWidget = path.join(
        cfg.modRequest.projectRoot,
        'native',
        'HealthStackShared',
        'HealthStackWidget.swift'
      );
      if (fs.existsSync(sharedWidget) && !src.includes(WIDGET_MARKER)) {
        // Widget type lives in Shared and is compiled into ExpoWidgetsTarget via sync script.
        // Keep a comment anchor in index for debugging.
        src += '\n// HealthStackWidget provided by HealthStackShared/HealthStackWidget.swift\n';
      }

      fs.writeFileSync(indexPath, src);
      return cfg;
    },
  ]);

module.exports = withCompanionWidget;
