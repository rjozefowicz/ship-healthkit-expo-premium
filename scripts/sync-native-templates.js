/**
 * Optional helper after manual prebuild — mirrors withCompanionNative copy step.
 */
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

const root = path.join(__dirname, '..');
const ios = path.join(root, 'ios');
if (!fs.existsSync(ios)) {
  console.log('No ios/ yet — run npx expo prebuild first');
  process.exit(0);
}

for (const folder of ['HealthStack', 'HealthStackShared', 'HealthStackWatch']) {
  const src = path.join(root, 'native', folder);
  const dest = path.join(ios, folder);
  if (fs.existsSync(src)) {
    copyDir(src, dest);
    console.log(`synced ${folder}`);
  }
}
