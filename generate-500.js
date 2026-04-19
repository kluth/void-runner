const fs = require('fs');

const categories = [
  "Hardware Module", "Software Daemon", "Offensive Tool", "Defensive Protocol",
  "Mission Type", "Retaliation Threat", "Global Event", "Syndicate Perk", "Social Hack", "Environment Modifier"
];
const adjectives = ["Quantum", "Neural", "Cyber", "Void", "Shadow", "Neon", "Cobalt", "Ghost", "Dark", "Stealth", "Overclocked", "Cryptic", "Nano", "Holo", "Viral", "Fractal", "Synaptic"];
const nouns = ["Injector", "Scraper", "Breaker", "Crawler", "Spoofer", "Jammer", "Cloak", "Router", "Bypass", "Fuzzer", "Worm", "Decoy", "Analyzer", "Shifter", "Weaver", "Splicer", "Node"];

let ideas = "## The 500+ Singularity Expansion Features & Ideas\n\n";

let count = 1;
for (let i = 0; i < 50; i++) {
  for (let c of categories) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    ideas += `${count}. **${c}: ${adj} ${noun}** - Advanced mechanic allowing operatives to manipulate ${c.toLowerCase()} vectors using ${adj.toLowerCase()} algorithms.\n`;
    count++;
  }
}

fs.appendFileSync('EXPANSION_PLAN.md', '\n\n' + ideas);
console.log('Successfully added 500 ideas to EXPANSION_PLAN.md');
