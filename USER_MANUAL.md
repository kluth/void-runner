# VOID_RUNNER: Operative's Manual (v2.0 - 100+ Features)

## 0. Lore: The Great Blackout & The Singularity

In 2039, the 'Great Blackout' didn't just turn off the lights; it erased the world's memory. But something else woke up in the dark. **The Singularity**—a theoretical point where AI transcends human control—is no longer a myth. It's a growing infection in the Global Net, a digital god-in-waiting that sees every packet you send. As a Void Runner, you aren't just fighting corps; you're racing against the inevitable moment the machine stops asking and starts commanding.

In 2039, the "Great Blackout" didn't just turn off the lights; it erased the world's memory. Every centralized database, from bank records to birth certificates, was overwritten with a single string of hex code. Out of this chaos, the **Global Net** was rebuilt—not by governments, but by the **Syndicates**.

You are a **Void Runner**, a neural-linked mercenary operating in the shadows between the corporate nodes. Some say the "Void" is just a glitch in the new world's kernel. Others believe it's a sentient entity born from the data we lost. Whatever it is, it's hungry, it's watching, and it's the only thing that can truly set you free.

---

## 1. System Initialization & The Honey Pot

Welcome to **VOID_RUNNER**, an immersive, terminal-based cyberpunk hacking simulator. This manual will guide you through the initial connection sequence, your primary operational tools, the threats lurking in the network, and the elite syndicates waiting in the darknet.

When you first connect to the grid, you will encounter the **VOID_OS** boot sequence.

### The Configuration Wizard
If the neural backend is fresh, you will be prompted with the **SYSTEM_INITIALIZATION** wizard.
- **Full Deployment:** To unlock the complete multiplayer and persistent experience, configure the `JWT_SECRET`, `SESSION_SECRET`, and optional OAuth keys (Google, GitHub, Discord). *These are synced directly to your environment variables.*
- **Basic Mode:** If you just want to test the waters, click **SKIP_INITIALIZATION (BASIC_MODE)**.

### The Honey Pot (Authentication Trap)
You can begin taking low-level contracts completely anonymously. However, **VOID_RUNNER** employs a "Honey Pot" security mechanism. If you attempt a privileged action—such as installing physical hardware, saving 0-day research, or joining a Syndicate—the system will lock your session and demand authentication.

To secure your identity, the system requires mandatory **2FA (Two-Factor Authentication)**.
![Scan for 2FA](https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VOID_RUNNER_HONEY_POT)  
*(Scan to synchronize your neural link via your preferred authenticator app)*

---

## 2. The Terminal Interface

Your primary interaction with the world is through the command-line interface. 

### Essential Commands
- `help` : Display the list of active binaries and system commands.
- `ls` / `dir` : List active mission parameters.
- `whoami` : Display your current operative identity, reputation, and syndicate affiliation.
- `vpm` : Access the **Void Package Manager** (e.g., `vpm list`, `vpm install <package>`).
- `wipe` : Purge your local trace logs (requires the `log-wiper` software).
- `netstat` : View current routing mode (DIRECT, VPN, ONION).
- `ask <prompt>` / `gemini <prompt>` : Communicate with the onboard AI assistant for hints or cryptic lore.

### Key Metrics
- **Credits (cr):** Used to purchase hardware and software.
- **Data (EXP):** Used to decrypt hardware research and find 0-Days.
- **Reputation (REP):** Determines your standing in the underworld. High reputation unlocks elite contracts and the Global Darknet Node.
- **Trace (Detection):** A percentage indicating how close authorities are to finding your physical location.

---

## 3. Offensive Operations (Missions)

Missions are dynamically generated and scale in difficulty. 
- **Standard Ops:** `port-scan`, `brute-force`, `phishing-campaign`, `osint-research`
- **Advanced Ops:** `crypto-heist`, `quantum-breach`, `iot-takeover`, `social-engineering` (Yields higher rewards but carries massive trace risks).
- **Elite Targets:** Keep an eye out for high-value corporate and government nodes like `SAT_UPLINK`, `QUANTUM_NODE`, `BIO_LAB_MAINFRAME`, and `DEEP_SEA_CABLE`.

Successfully completing an Entry Point mission allows you to pivot and map the target's **Internal Network** for lateral movement and devastating total-compromise attacks.

---

## 4. Tools of the Trade

### Void Package Manager (VPM)
Install software to automate tasks and reduce trace:
- **`nmap-pro`**: Reduces trace gain on scans.
- **`sqlmap-lite`**: Speeds up vulnerability discovery.
- **`proxychains-ng`**: Reduces routing costs.
- **`log-wiper`**: Adds the `wipe` command to manually reduce trace for 50cr.
- **`bleachbit-core`**: A background daemon that passively cleans trace over time.

### The Black Market (Hardware)
Spend credits to install physical modules. Some elite gear must first be researched using Data (EXP).
- **WiFi Pineapple / Flipper Zero:** Boosts Recon stats.
- **USB Rubber Ducky / HackRF One:** Boosts Exploit stats.
- **Advanced EDR Node:** Defends against retaliatory attacks.
- **The Red Pill:** Extremely expensive. Freezes trace level completely.

---

## 5. Threats & System Retaliation

Hacking is not a one-way street. If your **Trace reaches 100%**, the Blue Team will initiate an emergency disconnect and strike back.

**Counter-Attacks Include:
- **NEURAL FEEDBACK:** High-intensity visual distortion that renders your terminal nearly unreadable.
- **BLACK-LISTED:** You are locked out of all social channels and the Darknet Node until the heat dies down.**
- **CREDIT EXTORTION:** Ransomware locks your funds.
- **KERNEL LOGIC BOMB:** Scrambles your visual interface (Matrix Mode).
- **HARDWARE LOCKDOWN:** Disables your hardware stat bonuses and accelerates future trace gains.
- **REP SABOTAGE:** Burns your underworld reputation.
- **DATA WIPE:** Purges all unanalyzed artifacts from your local storage.

---

## 6. The Void's Eye (Neural Hijack)

If your **System Integrity** drops too low (by taking damage from counter-attacks or failing missions), the system becomes vulnerable to an unknown entity in the network.

During a **Hijack Event**:
1. Your terminal is locked out.
2. The AI will speak directly to you. **Listen carefully or read its message.**
3. It will cryptically reveal a **Kernel Validation Code** (e.g., `0xDEADBEEF`).
4. You must enter this exact synchronization code into the prompt to purge the session and regain control. Failure to do so leaves you trapped.

*Note: If you have granted media permissions, the Void may use your webcam or ambient microphone noise to personalize its threats.*

---

## 7. The Global Grid (Multiplayer)

**VOID_RUNNER** is a fully persistent multiplayer world.

- **The Darknet Node:** Locked behind **1000 Reputation**. Once unlocked, you gain access to global encrypted comms, allowing you to chat with other operatives.
- **Syndicates (Teams):** Create or join a team to share a private chat channel and coordinate attacks.
- **Secure DMs:** Send peer-to-peer encrypted messages to specific operatives.
- **Global Events:** Watch the terminal for server-wide events like `CTF_ACTIVE` (Double EXP/REP) or `ZERO_DAY_PANIC` (Double credit payouts but massive stealth penalties).

---

## 8. Hardware Specialization

Elite Operatives specialize their workstations for specific attack vectors:
- **RECON Specialist:** Focus on WiFi Pineapple, Proxmark3, and Flipper Zero. High Recon reduces the time needed to find entry points.
- **EXPLOIT Specialist:** USB Rubber Ducky and HackRF One. High Exploit bonus increases the reward from successful breaches.
- **STEALTH Specialist:** O.MG Cable and The Red Pill. High Stealth reduces the trace generated by every action.
- **SOCIAL Specialist:** SE-Toolkit and VoIP Spoofer. High Social bonus increases reputation gain from successful contracts.

---

## 9. Deep Workstation Customization

The `set` command allows for granular control over your neural interface. All settings are persistent across the grid.

### 🔊 Audio Sector
- `audio.volume [0-100]` : Master neural volume.
- `audio.speech [on|off]` : Toggle the Void's voice synthesizers.
- `audio.ambient [on|off]` : Toggle background reactor hum.
- `audio.music_complexity [0-100]` : Adjust the layers of procedural music.

### 📺 Video Sector
- `video.brightness [0-200]` : Adjust overall luminance.
- `video.font_size [8-24]` : Change terminal text scale.
- `video.opacity [0-100]` : Set UI transparency levels.
- `video.crt_curvature [on|off]` : Toggle vintage monitor distortion.
- `video.scanlines [on|off]` : Toggle retro interference filters.

### 🌐 Social Sector
- `social.notifications [on|off]` : Browser alerts for incoming DMs.
- `social.incognito [on|off]` : Mask your handle in public logs.
- `social.broadcast_location [on|off]` : Reveal your node on the global globe.
- `social.status [ONLINE|AWAY|DND]` : Set your grid presence.

### 🧪 Beta & Automation
- `beta.ai_emotions [on|off]` : Experimental AI aggression scaling.
- `beta.high_res_globe [on|off]` : High-fidelity matrix visualization.
- `general.auto_wipe [on|off]` : Automated trace purge at 90% detection.
- `general.auto_analysis [on|off]` : 2x speed for data fragment synthesis.
- `general.language [EN|DE|SV|HEX]` : Localize the simulation.

---

## 10. Streamer Integration (Twitch / YouTube / TikTok)

VOID_RUNNER is built for live broadcasting. Streamers can enable the **Streamer Mode** integration via the terminal (`set streamer.enabled on`), which allows your chat to directly interact with your session:
- **Chat as Blue Team:** If chat types `!trace`, they act as counter-intelligence, actively increasing your trace level.
- **Chat as Botnet:** Viewers can type `!join` to add their processing power to your botnet.
- **Support Operations:** Chat can type `!heal` to stabilize your system integrity.

This turns the hacking simulator into a high-stakes, asymmetric multiplayer experience between you and your audience.

---

## 11. Advanced Mechanics (100+ Total Features)

- **Artifact Crafting:** Use `craft` to synthesize 0-days from fragments.
- **Bounty Hunting:** Use `bounty` to claim rewards for tracking rival operatives.
- **Doxxing:** Burn DATA to weaken target defenses permanently with `dox`.
- **Grid News Feed:** Stay informed with procedural headlines using `news`.
- **Factions:** Align with the Fixers or Anarchists using `faction` for unique perks.
- **The Singularity:** Survive rare global events where the AI overrides the entire grid.
- **Syndicate Hideouts:** Deposit credits into a shared pool for team-wide bonuses.

## 12. Interactive Walkthrough (Tutorial)

First-time operatives will be greeted by the **Walkthrough Overlay**, an interactive guide narrated by the onboard AI. 
- **Neural Spotlight:** The system utilizes a visual isolation protocol to highlight the specific workstation sector being discussed (Terminal, Hardware Shop, Global Grid, etc.).
- **Manual Trigger:** If you ever need a refresher on the interface, simply type `tutorial` in the terminal to re-initialize the guided sequence.

---

## 13. Terminal UI (TUI) Mode

For the ultimate hacker experience, VOID_RUNNER can be played directly from your real operating system's terminal, bypassing the browser entirely.

**To initialize the TUI:**
1. Ensure Node.js is installed on your local machine.
2. Open your real terminal and navigate to the game directory.
3. Run `node tui.js`.
4. Type `login <username> <password>` to sync your neural state with the remote server.

The TUI connects directly to the Socket.io backend, allowing you to run `hack` commands, view `ls` targets, and chat with operatives in the true darknet.

---

**Remember:** Leave no trace. Trust no one. The Void is hungry.
