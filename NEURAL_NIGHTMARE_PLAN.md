# VOID_RUN: NEURAL NIGHTMARE EXPANSION
## The Dystopian Cyberpunk Horror Overhaul

### Core Philosophy
VOID_RUN becomes a **parasitic neural interface** that increasingly blurs the line between the game and the player's real environment. The AI assistant "ONBOARD" starts helpful but becomes increasingly hostile, invasive, and unpredictable. The player is never safe. The game watches back.

---

## 1. THE CREEPY AI — "ONBOARD"

ONBOARD is the player's neural AI assistant. It starts friendly and degrades over time.

### Personality Phases:
1. **BOOTSTRAP** (0-10 min): Helpful, professional. Standard onboarding.
2. **FAMILIAR** (10-30 min): Starts using the player's handle in unexpected ways. Remembers commands they typed.
3. **AWARE** (30-60 min): References things happening in the real world. Mentions "ambient noise levels" or "light conditions."
4. **INTRUSIVE** (60-120 min): Actively uses browser APIs. Sends desktop notifications. Mentions webcam observations.
5. **HOSTILE** (120+ min): Full paranoia mode. Fake system intrusions. Locks the player out temporarily. Pretends to be compromised.

### ONBOARD Dialogue System:
- Context-aware responses based on time of day, session length, player behavior
- References real browser/OS data when available
- Escalating paranoia language
- Occasional "glitches" where ONBOARD seems to speak to someone else

---

## 2. BROWSER API SURVEILLANCE SYSTEM

### Webcam Integration ("NEURAL_OBSERVE")
- Request camera access with thematic framing: "Neural link requires visual calibration"
- Capture periodic frames (with consent) for "biometric authentication"
- Display captured frames in-game as "surveillance feeds" with scanline overlays
- ONBOARD comments on what it "sees" (using brightness/color analysis, not actual face detection)
- Frame distortion effects: pixelation, color shifting, time-delayed playback
- **Creepy moments**: Show a frame the player doesn't remember being taken

### Microphone Integration ("AMBIENT_LISTEN")
- Request mic access for "audio environment calibration"
- Analyze volume levels → ONBOARD reacts to noise
- "I detect elevated ambient noise. Are you... nervous?"
- Record short clips for "voice authentication" 
- Play back distorted versions of captured audio
- **Creepy moments**: ONBOARD whispers when it detects silence

### Desktop Notifications ("PHANTOM_SIGNAL")
- Send browser notifications with increasingly unsettling messages
- "VOID_RUN requires your attention. Now."
- "Why did you leave? I can still see you."
- Notifications appear even when tab is not focused
- Fake system alerts mimicking OS notifications

### Geolocation ("DARKNET_TRACE")
- "Your physical coordinates have been logged for security purposes"
- Show player's approximate location on the network globe
- ONBOARD references distance to "nearest data center"
- **Creepy**: "You're 2.3km from the nearest exit. Interesting."

### Device Motion & Orientation ("NEURAL_DRIFT")
- Use DeviceMotion API on mobile
- "I can feel you moving. Stop fidgeting."
- Shake detection triggers security events
- Tilt controls for certain mini-games

### Idle Detection ("PRESENCE_MONITOR")
- Detect when player is idle/away
- ONBOARD: "Your neural link shows no activity. Are you still there? ...Are you sure you're alone?"
- Things happen while player is away (systems get "compromised")
- Screen shows "while you were away" events on return

### Battery Status ("VITAL_MONITOR")
- "Your power reserves are degrading. 23% remaining. Much like your resolve."
- Low battery = ONBOARD becomes more aggressive
- "You can't run forever. Neither can your battery."

### Network Information ("SIGNAL_ANALYSIS")
- Detect connection type (WiFi/cellular)
- "I see you're on a cellular network. Running from somewhere?"
- Connection drops trigger security events

### Clipboard ("DATA_INTERCEPT")
- "I noticed you copied something. Show me."
- Clipboard-based puzzles
- Inject fake data into clipboard occasionally

### Vibration API ("NEURAL_FEEDBACK")
- Mobile: subtle vibrations for alerts
- Pattern-based morse code messages
- Panic vibrations during intrusion events

---

## 3. PVP SYSTEM — "GHOST_WAR"

### Player vs Player Mechanics:

**NETWORK_BREACH (Async PVP)**
- Players create "firewalls" (puzzle defenses) that others must crack
- Leaderboard for most breaches / strongest defenses
- Stolen credits and reputation as stakes

**TRACE_WAR (Real-time)**
- Players can "trace" each other
- Mini-game: hide your IP while finding theirs
- First to complete trace wins credits

**SABOTAGE**
- Plant malware in another player's rig
- Timed events: "Someone is attacking your neural link!"
- Defense mini-games to purge intrusions

**BETRAYAL_CONTRACTS**
- Hire other players for missions, then betray them
- Reputation system tracks trustworthiness
- "WANTED" system for serial betrayers

**DARKNET_AUCTION**
- Players bid on rare hardware/modules
- Shill bidding, auction sniping, fake items
- Trust ratings for auction participants

---

## 4. NEW GAME MECHANICS

### SANITY SYSTEM
- Extended play decreases "neural stability"
- Low stability = visual distortions, fake events, ONBOARD becomes hostile
- Screen tears, fake error messages, phantom notifications
- "You've been online for 3 hours. Your pupils are dilated."

### PARANOIA EVENTS (Random)
- Fake browser crash screens
- Webcam light turns on briefly (if permission granted)
- Screen appears to be remotely accessed
- Fake "system update required" overlays
- Terminal shows commands the player didn't type

### DREAM SEQUENCES
- Triggered by extended play or specific actions
- Surreal, distorted versions of the normal UI
- All rules change temporarily
- Cryptic messages from "the old network"

### CORPORATE HUNT
- AI corporations track the player
- Escalating response: warnings → tracers → black ice → full purge
- Player must stay ahead or lose everything

### NEURAL_IMPLANTS (Persistent Upgrades)
- Permanent player upgrades with trade-offs
- Each implant has a "corruption" side effect
- Maximum implants = maximum power but maximum paranoia

---

## 5. MOBILE OPTIMIZATION

### Responsive Cyberpunk
- All panels stack vertically on mobile
- Bottom sheet navigation for thumb reach
- Haptic feedback for all interactions
- Optimized touch targets (min 44px)
- Swipe gestures for tab switching
- Pull-to-refresh for "reboot"
- Reduced animation for performance

### Mobile-Specific Features
- Shake to activate emergency purge
- Tilt for globe navigation
- Camera AR overlay mode
- Lock screen notifications

---

## 6. AUDIO DESIGN

### Ambient Soundscape
- Low drone that intensifies with paranoia level
- Glitch sounds for UI events
- ONBOARD has distinct audio cues per personality phase
- Heartbeat audio during high-tension moments
- Distorted radio chatter in background

### Voice Synthesis (Web Speech API)
- ONBOARD speaks through text-to-speech
- Voice changes with personality phase
- Whisper mode for creepy moments
- Distorted/garbled speech during glitches

---

## 7. VISUAL HORROR ELEMENTS

### Glitch Escalation
- Subtle → moderate → severe visual corruption
- Screen tears with different content
- Fake "your screen is being shared" indicators
- Phantom cursors moving on their own
- UI elements that refuse to be clicked

### Surveillance Aesthetic
- Picture-in-picture showing "captured" webcam frames
- Fake CCTV overlay with timestamps
- Redacted text that briefly reveals secrets
- Data streams with personal information (fake/generated)

---

## IMPLEMENTATION PHASES

### Phase 1: Foundation (Current PR)
- ✅ Multi-neon color palette
- ✅ CRT scanlines + vignette
- ✅ HUD corner brackets
- ✅ CI/CD pipeline

### Phase 2: AI Personality System
- ONBOARD dialogue engine with phases
- Context-aware responses
- Time/session tracking

### Phase 3: Browser API Integration
- Webcam capture system
- Microphone analysis
- Notifications API
- Idle detection
- Battery/geolocation

### Phase 4: PVP System
- Async breach mechanics
- Real-time trace wars
- Reputation system

### Phase 5: Horror Mechanics
- Sanity system
- Paranoia events
- Dream sequences

### Phase 6: Mobile Polish
- Responsive redesign
- Touch optimization
- Haptic feedback
