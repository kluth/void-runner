const io = require('socket.io-client');
const readline = require('readline');

// The Terminal UI (TUI) client for VOID_RUNNER
const URL = process.env.URL || 'https://void.kluth.cloud';
const socket = io(URL, { transports: ['websocket'] });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '\x1b[32mVOID_RUNNER_TUI@void:~$\x1b[0m '
});

const log = (msg) => {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  console.log(`\x1b[90m[${new Date().toLocaleTimeString()}]\x1b[0m ${msg}`);
  rl.prompt(true);
};

let authToken = null;
let state = {
  credits: 500,
  reputation: 0,
  botnetSize: 0,
  detectionLevel: 0,
  campaignLevel: 1,
  missions: [],
  hardware: [],
  software: [],
};

// Colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  yellow: "\x1b[33m"
};

log(`${colors.green}INITIALIZING VOID_OS TUI...${colors.reset}`);
log(`Connecting to ${URL}...`);

socket.on('connect', () => {
  log(`${colors.cyan}[NETWORK] UPLINK ESTABLISHED.${colors.reset}`);
  log(`Type 'help' for commands, or 'login <username> <pass>' / 'register <username> <pass>' to sync.`);
  
  // Create some default missions if not logged in
  for(let i = 0; i < 3; i++) {
    state.missions.push({
      id: Math.random().toString(36).substring(7),
      type: ['port-scan', 'brute-force', 'sql-injection'][Math.floor(Math.random() * 3)],
      target: `CORP_NODE_${Math.floor(Math.random() * 999)}`,
      reward: 150 + Math.floor(Math.random() * 100),
      difficulty: 1
    });
  }
  rl.prompt(true);
});

socket.on('auth_complete', (data) => {
  authToken = data.token;
  log(`${colors.green}Authentication successful. Syncing state...${colors.reset}`);
  socket.emit('session_resume', { token: authToken });
});

socket.on('init_state', (data) => {
  log(`${colors.green}State synchronized. Welcome back, ${data.player.name}.${colors.reset}`);
  state.credits = data.player.credits || 0;
  state.reputation = data.player.reputation || 0;
  state.botnetSize = data.player.botnetSize || 0;
  state.detectionLevel = data.player.detectionLevel || 0;
  try { state.hardware = JSON.parse(data.player.inventory || '[]'); } catch(e){}
  try { state.software = JSON.parse(data.player.software || '[]'); } catch(e){}
});

socket.on('new_message', (msg) => {
  log(`${colors.cyan}[COMMS] ${msg.sender}: ${msg.text}${colors.reset}`);
});

socket.on('error_msg', (msg) => {
  log(`${colors.red}ERR: ${msg}${colors.reset}`);
});

socket.on('disconnect', () => {
  log(`${colors.red}[NETWORK] UPLINK LOST.${colors.reset}`);
});

const updateRemote = () => {
  if (authToken) {
    socket.emit('update_score', {
      token: authToken,
      score: state.credits,
      reputation: state.reputation,
      credits: state.credits,
      botnetSize: state.botnetSize,
      detectionLevel: state.detectionLevel,
      inventory: JSON.stringify(state.hardware),
      software: JSON.stringify(state.software)
    });
  }
};

rl.on('line', (line) => {
  const rawCmd = line.trim();
  const cmd = rawCmd.toLowerCase();
  
  if (!cmd) {
    rl.prompt();
    return;
  }

  log(`sh: ${rawCmd}`);

  const parts = cmd.split(' ');

  if (cmd === 'help') {
    log('--- AVAILABLE BINARIES (TUI) ---');
    log('ls       - List active missions');
    log('hack     - Execute a mission (e.g. hack <id>)');
    log('whoami   - Display operative profile');
    log('chat     - Send global message (requires login)');
    log('login    - login <user> <pass>');
    log('register - register <user> <pass>');
    log('exit     - Close TUI');
  } 
  else if (parts[0] === 'login' && parts.length === 3) {
    socket.emit('auth_login', { username: parts[1], password: parts[2] });
  }
  else if (parts[0] === 'register' && parts.length === 3) {
    socket.emit('auth_register', { username: parts[1], password: parts[2] });
  }
  else if (parts[0] === 'chat' && parts.length > 1) {
    if (!authToken) log('ERR: Must be logged in to use comms.');
    else socket.emit('send_message', { token: authToken, text: rawCmd.substring(5) });
  }
  else if (cmd === 'ls') {
    log('--- ACTIVE_MISSIONS ---');
    state.missions.forEach(m => {
      log(`[${m.type.toUpperCase()}] ID: ${m.id} | target: ${m.target} | reward: ${m.reward}cr`);
    });
    if (state.missions.length === 0) log('No missions available. Generating...');
  }
  else if (parts[0] === 'hack' && parts.length === 2) {
    const targetId = parts[1];
    const mission = state.missions.find(m => m.id === targetId);
    if (!mission) {
      log('ERR: Mission ID not found.');
    } else {
      log(`Initiating breach on ${mission.target}...`);
      setTimeout(() => {
        if (Math.random() > 0.2) {
          state.credits += mission.reward;
          state.reputation += mission.difficulty * 2;
          log(`${colors.green}MISSION SUCCESS. +${mission.reward}cr, +${mission.difficulty * 2} REP.${colors.reset}`);
          state.missions = state.missions.filter(m => m.id !== targetId);
          updateRemote();
        } else {
          state.detectionLevel += 15;
          log(`${colors.red}MISSION FAILED. Trace increased to ${state.detectionLevel}%.${colors.reset}`);
          state.missions = state.missions.filter(m => m.id !== targetId);
          updateRemote();
        }
      }, 1500);
    }
  }
  else if (cmd === 'whoami') {
    log(`USER: ${authToken ? 'VERIFIED_OPERATIVE' : 'GHOST'}`);
    log(`REP:  ${state.reputation}`);
    log(`CREDITS: ${state.credits}cr`);
    log(`BOTNET: ${state.botnetSize} nodes`);
    log(`TRACE: ${state.detectionLevel}%`);
  }
  else if (cmd === 'exit') {
    log('TERMINATING NEURAL LINK...');
    process.exit(0);
  }
  else {
    log(`ERR: command not found: ${parts[0]}`);
  }
  
  rl.prompt();
}).on('close', () => {
  log('Terminal closed.');
  process.exit(0);
});
