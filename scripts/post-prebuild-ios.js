#!/usr/bin/env node
/**
 * Run after `expo prebuild --clean` (local or EAS).
 * Re-applies native Swift widget, shared sources, bridges, and Watch target.
 */
const path = require('path');
const { patchWidgetIndex } = require('../plugins/withCompanionWidget');
const { syncFiles } = require('./companion-xcode');

const projectRoot = path.join(__dirname, '..');
const iosRoot = path.join(projectRoot, 'ios');

syncFiles(projectRoot);
patchWidgetIndex(projectRoot, iosRoot);
console.log('[post-prebuild-ios] done');
