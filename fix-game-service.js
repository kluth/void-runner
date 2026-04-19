const fs = require('fs');
const file = 'src/app/core/services/game.service.ts';
let code = fs.readFileSync(file, 'utf8');

// Fix the corrupted section around the Singularity logic
const corrupted = `
    if (this.eventTimer() > 0) {
      this.eventTimer.update(t => Math.max(0, t - 1));
    }

    if (this.globalEvent() === 'NONE' && Math.random() > 0.9999 && this.reputation() > 5000) {
      this.globalEvent.set('SINGULARITY');
      this.eventTimer.set(300);
      this.log('<span style="color: #ff00ff">!!! THE SINGULARITY HAS BEGUN !!! AI OVERRIDE DETECTED !!!</span>');
    }

    // dummy replacement for event timer to avoid breaking next block
      this.eventTimer.update(t => Math.max(0, t - 1));
    }
`;

const fixed = `
    if (this.eventTimer() > 0) {
      this.eventTimer.update(t => Math.max(0, t - 1));
    }

    if (this.globalEvent() === 'NONE' && Math.random() > 0.9999 && this.reputation() > 5000) {
      this.globalEvent.set('SINGULARITY');
      this.eventTimer.set(300);
      this.log('<span style="color: #ff00ff">!!! THE SINGULARITY HAS BEGUN !!! AI OVERRIDE DETECTED !!!</span>');
    }
`;

// Also fix the duplication of news feed generation if any
// (I should check the completeMission too)

code = code.replace(corrupted, fixed);

fs.writeFileSync(file, code);
