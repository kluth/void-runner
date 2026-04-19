const fs = require('fs');

// Update USER_MANUAL.md
let manual = fs.readFileSync('USER_MANUAL.md', 'utf8');
manual = manual.replace("## 0. Lore: The Great Blackout & The Rise of the Void", "## 0. Lore: The Great Blackout & The Singularity\n\nIn 2039, the 'Great Blackout' didn't just turn off the lights; it erased the world's memory. But something else woke up in the dark. **The Singularity**—a theoretical point where AI transcends human control—is no longer a myth. It's a growing infection in the Global Net, a digital god-in-waiting that sees every packet you send. As a Void Runner, you aren't just fighting corps; you're racing against the inevitable moment the machine stops asking and starts commanding.");

manual = manual.replace("Counter-Attacks Include:", "Counter-Attacks Include:\n- **NEURAL FEEDBACK:** High-intensity visual distortion that renders your terminal nearly unreadable.\n- **BLACK-LISTED:** You are locked out of all social channels and the Darknet Node until the heat dies down.");

manual = manual.replace("## 10. Interactive Walkthrough (Tutorial)", "## 11. Advanced Mechanics (100+ Total Features)\n\n- **Artifact Crafting:** Use \`craft\` to synthesize 0-days from fragments.\n- **Bounty Hunting:** Use \`bounty\` to claim rewards for tracking rival operatives.\n- **Doxxing:** Burn DATA to weaken target defenses permanently with \`dox\`.\n- **Grid News Feed:** Stay informed with procedural headlines using \`news\`.\n- **Factions:** Align with the Fixers or Anarchists using \`faction\` for unique perks.\n- **The Singularity:** Survive rare global events where the AI overrides the entire grid.\n- **Syndicate Hideouts:** Deposit credits into a shared pool for team-wide bonuses.\n\n## 10. Interactive Walkthrough (Tutorial)");

manual = manual.replace("VOID_RUNNER: Operative's Manual", "VOID_RUNNER: Operative's Manual (v2.0 - 100+ Features)");
fs.writeFileSync('USER_MANUAL.md', manual);

// Update INSTALLATION.md
let inst = fs.readFileSync('INSTALLATION.md', 'utf8');
inst = inst.replace("VOID_RUNNER: System Deployment Guide", "VOID_RUNNER: System Deployment Guide (v2.0 - 100+ Feature Stack)");
fs.writeFileSync('INSTALLATION.md', inst);
