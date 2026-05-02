## Domain: Security / Web3 / Progression

### Concept
Replace the simulated mining engine with a **Real Web3 Proof-of-Work Data Vault**. Players can optionally opt-in to 'Secure Web3 Mode', which spends actual browser computing power (SHA-256 PoW) synced to real Ethereum nodes to generate uncrackable, decentralized encryption keys for their local save data.

### User Story
As a Void-Runner, I want to use real computing power and Web3 technologies to securely encrypt my game data, so that I can protect my progress while earning exclusive cosmetic rewards (VOID_CRED) for securing the network.

### Technical Implementation
• **Real Node Connection:** Use ethers.js to connect to a public Ethereum RPC endpoint and fetch the latest block hash as a real entropy source.
• **Real Proof of Work:** Implement a non-blocking SHA-256 mining loop in the browser that searches for a nonce satisfying a dynamic difficulty threshold.
• **Real Data Encryption:** Use the Web Crypto API (window.crypto.subtle) to derive an AES-GCM key from the mined PoW hash and encrypt the user's local save state before it persists to disk or server.
• **Cosmetic Rewards:** Earning VOID_CRED is strictly tied to real PoW hashes calculated, ensuring the currency is backed by computational effort, but rewards remain 100% cosmetic (no pay-to-win elements).
