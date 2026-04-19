const fs = require('fs');
const file = 'src/app/features/terminal/terminal.component.ts';
let code = fs.readFileSync(file, 'utf8');

const additionalManPages = `
    'bounty': [
        'NAME: bounty - claim headhunter rewards',
        'DESCRIPTION: Exchange high detection trace logs of rivals for credits.'
    ],
    'dox': [
        'NAME: dox - reveal target identity',
        'DESCRIPTION: Burn 500 DATA to permanently lower the defense of a specific target.'
    ],
    'auction': [
        'NAME: auction - bid on rare zero-days',
        'DESCRIPTION: Access the Darknet 0-day auction house.'
    ],
    'news': [
        'NAME: news - display procedural grid events',
        'DESCRIPTION: Lists recent headlines affecting global corp stocks and security.'
    ],
    'craft': [
        'NAME: craft - synthesize artifacts',
        'DESCRIPTION: Combine 3 analyzed artifacts into a Zero-Day Exploit.'
    ],
    'faction': [
        'NAME: faction - manage syndicate standing',
        'SYNOPSIS: faction [join|leave] [fixers|anarchists]',
        'DESCRIPTION: Align with underworld factions for unique perks.'
    ],
`;
code = code.replace("'help': [", additionalManPages + "\n    'help': [");

const additionalCommands = `
      case 'bounty':
        if (this.gameService.reputation() > 100) {
          this.gameService.credits.update(c => c + 300);
          this.gameService.reputation.update(r => r - 50);
          this.gameService.log('BOUNTY CLAIMED: +300cr, -50 REP');
          this.audioService.playSuccess();
        } else {
          this.gameService.log('ERR: Insufficient street cred to claim bounties.');
        }
        break;

      case 'dox':
        if (this.gameService.experience() >= 500) {
          this.gameService.experience.update(e => e - 500);
          this.gameService.log('DOX SUCCESSFUL: Target network defenses weakened.');
          this.audioService.playSuccess();
        } else {
          this.gameService.log('ERR: Insufficient DATA (need 500).');
        }
        break;

      case 'auction':
        this.gameService.log('--- DARKNET AUCTION HOUSE ---');
        this.gameService.log('1. [0-DAY] ROOT_EXPLOIT_V4 - 5000cr');
        this.gameService.log('2. [DATA] 10TB KERNEL DUMP - 2000cr');
        this.gameService.log('ERR: Bidding module offline for maintenance.');
        break;

      case 'news':
        this.gameService.log('--- GRID NEWS FEED ---');
        const news = this.gameService.newsFeed();
        if (news.length === 0) {
          this.gameService.log('No recent news.');
        } else {
          news.forEach(n => this.gameService.log(\`[\${n.timestamp}] \${n.headline}\`));
        }
        break;

      case 'craft':
        this.gameService.craftArtifacts();
        break;

      case 'faction':
        this.gameService.log(\`CURRENT FACTION: \${this.gameService.faction()}\`);
        this.gameService.log(\`FIXERS REP: \${this.gameService.reputationFixers()}\`);
        this.gameService.log(\`ANARCHISTS REP: \${this.gameService.reputationAnarchists()}\`);
        this.gameService.log('Use "faction join [name]" to align.');
        break;

      case 'faction join fixers':
        this.gameService.faction.set('FIXERS');
        this.gameService.log('ALIGNED WITH THE FIXERS.');
        this.audioService.playSuccess();
        break;

      case 'faction join anarchists':
        this.gameService.faction.set('ANARCHISTS');
        this.gameService.log('ALIGNED WITH THE ANARCHISTS.');
        this.audioService.playSuccess();
        break;
`;

code = code.replace("case 'help':", additionalCommands + "\n      case 'help':");

// Add help entries
const extraHelp = `
        this.gameService.log('bounty      - Claim headhunter rewards');
        this.gameService.log('dox         - Reveal target identity for debuffs');
        this.gameService.log('auction     - Access Darknet auction house');
        this.gameService.log('news        - Read procedural grid news');
        this.gameService.log('craft       - Synthesize zero-days from artifacts');
        this.gameService.log('faction     - Manage syndicate standing');
`;
code = code.replace("this.gameService.log('ls          - List active mission parameters');", "this.gameService.log('ls          - List active mission parameters');\n" + extraHelp);


fs.writeFileSync(file, code);
