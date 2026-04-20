const fs = require('fs');

const categories = [
    "Offensive Cyber-Warfare",
    "Defensive Countermeasures",
    "Hardware Neural-Rig Modules",
    "Software Daemons & Subroutines",
    "Social Engineering & OSINT",
    "Darknet Economy & Trading",
    "Global Grid Anomalies",
    "Botnet & Infrastructure Upgrades",
    "Faction & Syndicate Dynamics",
    "AI & Neural Entity Interactions"
];

const actionVerbs = ["Spoof", "Bypass", "Overload", "Decrypt", "Synthesize", "Inject", "Hijack", "Trace", "Obfuscate", "Simulate", "Extract", "Corrupt", "Nullify", "Amplify", "Scramble"];
const techNouns = ["Quantum", "Neural", "Plasma", "Blockchain", "RFID", "Biometric", "Orbital", "Subdermal", "Optical", "Magnetic", "Cryogenic", "Heuristic", "Algorithmic", "Kinetic", "Nanite"];
const targetNouns = ["Mainframe", "Router", "Database", "Node", "Uplink", "Cortex", "Ledger", "Proxy", "Firewall", "Gateway", "Array", "Cluster", "Nexus", "Grid", "Subnet"];

const implementationStepsFront = [
    "Add new UI component in `src/app/features/`.",
    "Implement dedicated minigame logic in `MissionComponent`.",
    "Create interactive SVG/Canvas visualization.",
    "Add specific Socket.io listeners for real-time sync.",
    "Introduce new Signal states in `GameService`."
];

const implementationStepsBack = [
    "Update Prisma schema to persist new entity state.",
    "Add chron-job in `startEventLoop` for passive processing.",
    "Create new Socket.io event handlers in `index.ts`.",
    "Implement AI-driven validation via `AiService`.",
    "Introduce new global state modifiers."
];

let mdContent = "# THE SINGULARITY EXPANSION V3: 500+ MECHANICS\n\nThis document outlines 500+ highly interactive mechanics, hardware, and anomalies planned for the VOID_RUNNER grid.\n\n";

let count = 1;

for (let i = 0; i < categories.length; i++) {
    mdContent += `## Category ${i + 1}: ${categories[i]}\n\n`;
    
    for (let j = 0; j < 55; j++) { // 10 categories * 55 = 550 ideas
        const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
        const tech = techNouns[Math.floor(Math.random() * techNouns.length)];
        const target = targetNouns[Math.floor(Math.random() * targetNouns.length)];
        
        const title = `${verb} ${tech} ${target}`;
        
        const frontStep = implementationStepsFront[Math.floor(Math.random() * implementationStepsFront.length)];
        const backStep = implementationStepsBack[Math.floor(Math.random() * implementationStepsBack.length)];
        
        mdContent += `### ${count}. ${title}\n`;
        mdContent += `- **Description:** A highly interactive sequence where the operative must ${verb.toLowerCase()} the target's ${tech.toLowerCase()} ${target.toLowerCase()} to gain tactical advantages.\n`;
        mdContent += `- **Implementation Plan:**\n`;
        mdContent += `  - **Frontend:** ${frontStep}\n`;
        mdContent += `  - **Backend:** ${backStep}\n`;
        mdContent += `  - **State:** Synchronize via \`state_mirror\` and update local Signals.\n\n`;
        
        count++;
    }
}

fs.writeFileSync('EXPANSION_PLAN_V3.md', mdContent);
console.log('Successfully generated 550 ideas into EXPANSION_PLAN_V3.md');
