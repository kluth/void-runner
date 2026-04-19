const fs = require('fs');
const file = 'src/app/core/services/game.service.ts';
let code = fs.readFileSync(file, 'utf8');

// Add Factions and News
code = code.replace("activeTeam = signal<Team | null>(null);", "activeTeam = signal<Team | null>(null);\n  newsFeed = signal<{timestamp: string, headline: string}[]>([]);\n  faction = signal<'NONE' | 'FIXERS' | 'ANARCHISTS'>('NONE');\n  reputationFixers = signal(0);\n  reputationAnarchists = signal(0);\n  syndicateCredits = signal(0);");

// Add crafting
const craftingCode = `
  craftArtifacts() {
    const analyzed = this.artifacts().filter(a => a.analyzed);
    if (analyzed.length >= 3) {
      const used = analyzed.slice(0, 3);
      this.artifacts.update(arts => arts.filter(a => !used.includes(a)));
      this.zeroDays.update(z => z + 1);
      this.log('CRAFTING SUCCESS: Synthesized 1 Zero-Day Exploit from artifacts.');
      this.updateRemoteScore();
      return true;
    }
    this.log('CRAFTING FAILED: Need 3 analyzed artifacts.');
    return false;
  }

  depositToSyndicate(amount: number) {
    if (this.credits() >= amount) {
      this.credits.update(c => c - amount);
      this.syndicateCredits.update(s => s + amount);
      this.log(\`SYNDICATE: Deposited \${amount}cr. Total: \${this.syndicateCredits()}cr\`);
      this.updateRemoteScore();
      return true;
    }
    return false;
  }
`;
code = code.replace("  launchDDoS() {", craftingCode + "\n  launchDDoS() {");

// Add News generation to completeMission
code = code.replace("this.botnetSize.update(b => b + Math.floor(Math.random() * (mission.difficulty * 2)) + 1);", "this.botnetSize.update(b => b + Math.floor(Math.random() * (mission.difficulty * 2)) + 1);\n    \n    if (Math.random() > 0.8) {\n      const headlines = [\n        `Data breach at ${mission.target.split('_')[0]} reported.`,\n        `Unknown operative linked to recent ${mission.type} attack.`,\n        `Stock plummets for corp associated with ${mission.target}.`\n      ];\n      this.newsFeed.update(n => [{timestamp: new Date().toLocaleTimeString(), headline: headlines[Math.floor(Math.random() * headlines.length)]}, ...n].slice(0, 20));\n    }");

// Add The Singularity event trigger
code = code.replace("if (this.eventTimer() > 0) {", "if (this.eventTimer() > 0) {\n      this.eventTimer.update(t => Math.max(0, t - 1));\n    }\n\n    if (this.globalEvent() === 'NONE' && Math.random() > 0.9999 && this.reputation() > 5000) {\n      this.globalEvent.set('SINGULARITY');\n      this.eventTimer.set(300);\n      this.log('<span style=\"color: #ff00ff\">!!! THE SINGULARITY HAS BEGUN !!! AI OVERRIDE DETECTED !!!</span>');\n    }\n\n    // dummy replacement for event timer to avoid breaking next block");
code = code.replace("if (this.eventTimer() > 0) {\n      this.eventTimer.update(t => Math.max(0, t - 1));\n    }\n\n    // dummy replacement for event timer to avoid breaking next block", "");

// Update Retaliation with new types
code = code.replace("const types = ['RANSOM', 'GLITCH', 'LOCK', 'DATA_WIPE', 'REP_SABOTAGE', 'SWAT_RAID', 'ACCOUNT_FREEZE'] as const;", "const types = ['RANSOM', 'GLITCH', 'LOCK', 'DATA_WIPE', 'REP_SABOTAGE', 'SWAT_RAID', 'ACCOUNT_FREEZE', 'NEURAL_FEEDBACK', 'BLACK_LISTED'] as const;");

const retalCode = `
      case 'ACCOUNT_FREEZE':
        this.activeDebuffs.update(d => [...d, { id, name: 'FINANCIAL_ASSETS_FROZEN', type: 'FREEZE', expiresAt: Date.now() + duration }]);
        this.isAccountFrozen.set(true);
        this.log('!!! COUNTER-ATTACK: CRYPTO_ASSETS_FROZEN BY FEDS !!!');
        break;
      case 'NEURAL_FEEDBACK':
        this.activeDebuffs.update(d => [...d, { id, name: 'NEURAL_FEEDBACK_LOOP', type: 'GLITCH', expiresAt: Date.now() + duration }]);
        this.log('!!! COUNTER-ATTACK: SEVERE NEURAL FEEDBACK DISTORTION !!!');
        this.isDistorted.set(true);
        setTimeout(() => this.isDistorted.set(false), duration);
        break;
      case 'BLACK_LISTED':
        this.activeDebuffs.update(d => [...d, { id, name: 'SOCIAL_BLACKLIST', type: 'LOCK', expiresAt: Date.now() + duration }]);
        this.log('!!! COUNTER-ATTACK: BLACKLISTED FROM COMMS !!!');
        break;
`;
code = code.replace("case 'ACCOUNT_FREEZE':\n        this.activeDebuffs.update(d => [...d, { id, name: 'FINANCIAL_ASSETS_FROZEN', type: 'FREEZE', expiresAt: Date.now() + duration }]);\n        this.isAccountFrozen.set(true);\n        this.log('!!! COUNTER-ATTACK: CRYPTO_ASSETS_FROZEN BY FEDS !!!');\n        break;", retalCode);

// Add missing globalEvent states
code = code.replace("globalEvent = signal<'NONE' | 'CTF_ACTIVE' | 'PATCH_TUESDAY' | 'ZERO_DAY_PANIC'>('NONE');", "globalEvent = signal<'NONE' | 'CTF_ACTIVE' | 'PATCH_TUESDAY' | 'ZERO_DAY_PANIC' | 'SINGULARITY'>('NONE');");


fs.writeFileSync(file, code);
