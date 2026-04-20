# Guide: Port Scanning Optimization

In the high-latency graveyard of the VOID_RUN infrastructure, information is the only currency that doesn't depreciate. However, the act of acquisition is inherently noisy. Port scanning—the foundational step of any intrusion—is a delicate dance between exhaustive discovery and terminal exposure. To survive the Deep Grid, you must master the art of the invisible probe.

### The Mechanics of `v_scan`

The standard `v_scan` utility operates by injecting malformed TCP SYN packets into the target's networking stack. In a brutalist architecture, these stacks are often rigid and unforgiving. Optimization begins with understanding the **Fragmentation Threshold**. By breaking your probes into 8-byte segments, you can often slip beneath the detection window of legacy Intrusion Detection Systems (IDS) that expect contiguous headers.

### Timing Templates: The Speed-Noise Tradeoff

VOID_RUN utilizes five distinct timing templates. Choosing the wrong one is the most common cause of premature disconnection:

1.  **T1 (Paranoid):** Probes are spaced by minutes. Essential for high-security nodes where even a single unexpected packet triggers a purge.
2.  **T2 (Sneaky):** Use this for corporate backbone relays. It’s slow enough to blend with background jitter.
3.  **T3 (Standard):** The default. Use only on unmonitored subnets.
4.  **T4 (Aggressive):** Only for use during active combat or when the node's admin is already suppressed.
5.  **T5 (Insane):** Floods the stack. Useful for DDoS-adjacent tactics, but expect an immediate trace.

### Advanced Stealth: Decoy Routing

Never scan from your primary node. Use the `--decoy` flag to spoof return addresses from localized ghost-nodes. By interleaving your real probes with twelve identical packets from randomized IP addresses within the same subnet, the target's logs become a chaotic mess of false positives. This forces the automated response systems to expend CPU cycles filtering noise while you identify the vulnerable service on port 8443.

### Protocol-Specific Tuning

TCP scanning is standard, but **UDP Discovery** is where the real secrets are hidden. Because UDP is connectionless, `v_scan` must wait for an ICMP "Port Unreachable" message to confirm a closed port. Optimization here requires aggressive timeout management. Reduce your `max-rtt-timeout` to 200ms when scanning internal VoIP or DNS relays to shave minutes off your discovery phase.

### The Brutalist Philosophy

In VOID_RUN, "optimization" doesn't always mean silence. Sometimes, it means being so loud that the system crashes before it can report you. If you are operating within a timed purge window, set your probes to T5, ignore the decoys, and focus exclusively on the **Top 100 Common Ports**. Speed is its own form of stealth.

*Scan fast. Stay dark. Run the VOID.*
