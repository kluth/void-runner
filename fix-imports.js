const fs = require('fs');
const path = require('path');

const srcAppDir = path.join(__dirname, 'src', 'app');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles(srcAppDir).filter(f => f.endsWith('.ts'));

// A map to find the new directory for any file
const fileMap = {};
for (const file of allFiles) {
  fileMap[path.basename(file)] = file;
}

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  // Regex to find relative imports (e.g. './services/game.service' or '../services/game.service')
  content = content.replace(/from\s+['"]([^'"]+)['"]/g, (match, p1) => {
    if (!p1.startsWith('.')) return match; // Not a relative import

    const importedBasename = path.basename(p1) + '.ts';
    if (fileMap[importedBasename]) {
      const targetPath = fileMap[importedBasename];
      let relPath = path.relative(path.dirname(file), targetPath);
      // Ensure leading ./
      if (!relPath.startsWith('.')) {
        relPath = './' + relPath;
      }
      // Remove .ts extension
      relPath = relPath.replace(/\.ts$/, '');
      
      if (p1 !== relPath) {
        changed = true;
        return `from '${relPath}'`;
      }
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf-8');
  }
}
console.log("Imports updated.");
