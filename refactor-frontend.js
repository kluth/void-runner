const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const appDir = path.join(__dirname, 'src/app');

// Define new structure
const structure = {
  'core': {
    'services': ['audio.service.ts', 'game.service.ts', 'network.service.ts', 'neural.service.ts']
  },
  'features': {
    'terminal': ['terminal.component.ts'],
    'missions': ['missions.component.ts', 'malware-sandbox.component.ts', 'internal-network.component.ts'],
    'hardware': ['hardware-shop.component.ts'],
    'network': ['network.component.ts', 'globe.component.ts'],
    'social': ['team.component.ts', 'live-events.component.ts'],
    'system': ['system-integrity.component.ts', 'intrusion-overlay.component.ts', 'matrix-rain.component.ts']
  },
  'shared': {
    'ui': [] // future shared components
  }
};

// Create directories
for (const [topLevel, subLevels] of Object.entries(structure)) {
  const topPath = path.join(appDir, topLevel);
  if (!fs.existsSync(topPath)) fs.mkdirSync(topPath, { recursive: true });
  
  if (Array.isArray(subLevels)) continue;

  for (const [feature, files] of Object.entries(subLevels)) {
    const featurePath = path.join(topPath, feature);
    if (!fs.existsSync(featurePath)) fs.mkdirSync(featurePath, { recursive: true });

    // Move files
    for (const file of files) {
      const oldPath = path.join(appDir, 'components', file) 
        || path.join(appDir, 'services', file);
      
      const possiblePaths = [
        path.join(appDir, 'components', file),
        path.join(appDir, 'services', file)
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          fs.renameSync(p, path.join(featurePath, file));
          break;
        }
      }
    }
  }
}

console.log("Frontend directories created and files moved.");
