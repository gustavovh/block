const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../artifacts/admin-dashboard/out');
const destOut = path.join(__dirname, '../out');
const destDist = path.join(__dirname, '../dist');

function copyRecursiveSync(srcDir, destDir) {
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.mkdirSync(destDir, { recursive: true });
  
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    
    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(src)) {
  console.log(`Copying build from ${src} to root-level out and dist...`);
  copyRecursiveSync(src, destOut);
  copyRecursiveSync(src, destDist);
  console.log('✅ Build files copied successfully to root directories.');
} else {
  console.error(`❌ Source directory ${src} does not exist! Make sure to run next build first.`);
  process.exit(1);
}
