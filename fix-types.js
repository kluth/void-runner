const fs = require('fs');
const file = 'src/app/core/services/game.service.ts';
let code = fs.readFileSync(file, 'utf8');

// Update applyRetaliation signature
code = code.replace(
    "private applyRetaliation(type: 'RANSOM' | 'GLITCH' | 'LOCK' | 'DATA_WIPE' | 'REP_SABOTAGE' | 'SWAT_RAID' | 'ACCOUNT_FREEZE', duration: number, critical = false)",
    "private applyRetaliation(type: 'RANSOM' | 'GLITCH' | 'LOCK' | 'DATA_WIPE' | 'REP_SABOTAGE' | 'SWAT_RAID' | 'ACCOUNT_FREEZE' | 'NEURAL_FEEDBACK' | 'BLACK_LISTED', duration: number, critical = false)"
);

// Update activeDebuffs signal type
code = code.replace(
    "activeDebuffs = signal<{id: string, name: string, type: 'RANSOM' | 'GLITCH' | 'LOCK' | 'SWAT' | 'FREEZE', expiresAt: number}[]>([]);",
    "activeDebuffs = signal<{id: string, name: string, type: 'RANSOM' | 'GLITCH' | 'LOCK' | 'SWAT' | 'FREEZE' | 'NEURAL_FEEDBACK' | 'BLACK_LISTED', expiresAt: number}[]>([]);"
);

fs.writeFileSync(file, code);
