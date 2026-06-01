const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const siteType = process.env.NETLIFY_SITE || 'dashboard';
console.log(`Building Netlify site for type: ${siteType}`);

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

try {
  const dest = path.join(__dirname, '../out');

  if (siteType === 'app') {
    console.log('Compiling Expo Mobile Web mockup...');
    execSync('pnpm --filter @workspace/blockfit run build:web', { stdio: 'inherit' });
    
    const src = path.join(__dirname, '../artifacts/blockfit-app/dist');
    
    console.log(`Copying Expo build from ${src} to root /out directory...`);
    copyRecursiveSync(src, dest);
    
    // Generate _redirects for Netlify SPA routing
    console.log('Generating Netlify _redirects file for SPA routing...');
    fs.writeFileSync(
      path.join(dest, '_redirects'),
      `/* /index.html 200\n`,
      'utf8'
    );
    
    // Generate _headers for asset caching
    console.log('Generating Netlify _headers file for asset caching...');
    fs.writeFileSync(
      path.join(dest, '_headers'),
      `/*.ttf\n  Cache-Control: public, max-age=31536000, immutable\n` +
      `/assets/**/*.ttf\n  Cache-Control: public, max-age=31536000, immutable\n` +
      `/assets/**/*.woff\n  Cache-Control: public, max-age=31536000, immutable\n` +
      `/assets/**/*.woff2\n  Cache-Control: public, max-age=31536000, immutable\n` +
      `/_expo/static/**\n  Cache-Control: public, max-age=31536000, immutable\n`,
      'utf8'
    );
    
    console.log('✅ Mobile App mockup built and prepared in root /out folder with redirects & headers.');
  } else {
    console.log('Compiling Next.js Admin Dashboard...');
    execSync('pnpm --filter @workspace/admin-dashboard run build', { stdio: 'inherit' });
    
    const src = path.join(__dirname, '../artifacts/admin-dashboard/out');
    
    console.log(`Copying Admin Dashboard build from ${src} to root /out directory...`);
    copyRecursiveSync(src, dest);
    console.log('✅ Admin Dashboard built and prepared in root /out folder.');
  }
} catch (error) {
  console.error('❌ Build failed during Netlify compilation step:', error);
  process.exit(1);
}
