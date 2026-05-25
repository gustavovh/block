const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./artifacts/admin-dashboard/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    let newContent = content
      .replace(/bg-blue-600 hover:bg-blue-700 text-white/g, 'bg-primary hover:bg-primary/90 text-primary-foreground')
      .replace(/bg-blue-600 text-white/g, 'bg-primary text-primary-foreground')
      .replace(/bg-blue-600/g, 'bg-primary')
      .replace(/hover:bg-blue-600/g, 'hover:bg-primary')
      .replace(/group-hover:bg-blue-600/g, 'group-hover:bg-primary')
      .replace(/text-blue-400/g, 'text-primary')
      .replace(/text-blue-500/g, 'text-primary')
      .replace(/text-blue-600/g, 'text-primary')
      .replace(/hover:text-blue-400/g, 'hover:text-primary')
      .replace(/hover:text-blue-500/g, 'hover:text-primary')
      .replace(/group-hover:text-white/g, 'group-hover:text-primary-foreground')
      .replace(/group-hover:text-blue-400/g, 'group-hover:text-primary')
      .replace(/border-blue-500/g, 'border-primary')
      .replace(/group-hover:border-blue-500/g, 'group-hover:border-primary')
      .replace(/ring-blue-500/g, 'ring-primary')
      .replace(/shadow-blue-900\/20/g, 'shadow-primary/20')
      .replace(/from-blue-600 to-indigo-700/g, 'from-primary to-accent');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated ' + filePath);
    }
  }
});
