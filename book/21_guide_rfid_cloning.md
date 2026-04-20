# Guide: RFID Cloning & Physical Infiltration

In the world of VOID_RUN, the digital and physical are two sides of the same rusted coin. While your mind navigates the glowing lattices of the VOID, your physical presence must occasionally breach the cold concrete of the Meatspace. RFID (Radio Frequency Identification) is the invisible glue holding physical security together. To master the clone is to walk through walls.

## The Invisible Keys
Every security badge, key fob, and access card emits a faint, silent pulse. This is their identity. In the brutalist architecture of corporate monoliths, these pulses are the only thing keeping the heavy steel doors locked. As a runner, you do not pick locks; you duplicate the frequency of authority. In the VOID, identity is a string of bits; in the Meatspace, it is a wave of radiation.

## Low Frequency (LF) - 125kHz
The relics of the old world still use 125kHz LF systems. These are the "dumb" keys. They broadcast their ID to any reader that asks, without encryption, without challenge. Using a standard induction cloner, you can sniff these IDs from several centimeters away. Once captured, the ID can be burned onto a T5577 writable chip, creating a perfect twin. To the door controller, you are the janitor, the guard, or the executive. It is a primitive trust that is easily betrayed.

## High Frequency (HF) - 13.56MHz / NFC
The newer sectors use HF systems, primarily ISO14443 (MIFARE). These are smarter, capable of two-way cryptographic handshakes. However, intelligence breeds complexity, and complexity breeds holes. Early MIFARE Classic chips suffer from the "Hardnested" vulnerability—if you can sniff a single successful exchange between a card and a reader, you can mathematically derive the sector keys. With the keys, the data is yours. You don't just clone the card; you own its memory.

## Tools of the Meatspace
To bridge the gap, you need specialized hardware. The **'Pulse-Link'** (the runner's Proxmark) is the gold standard. It allows for advanced sniffing, simulation, and brute-forcing of card keys. For quick, silent work, the **'Ghost-Fob'** provides a portable interface for emulating captured signals on the fly. Hold it near a reader, and the machine will believe the lie you've prepared. These tools are the lockpicks of the electronic age.

## The Art of the Tailgate
Technology is only half the bridge. The most advanced RFID cloner is useless if you are spotted by a kinetic sentry. Physical infiltration requires "Tailgating"—the act of following an authorized person through a secured door before it closes. This requires the "Janitor's Confidence": dress like you belong, carry something heavy, and look like you're in a hurry. Humans are the weakest links in the security chain; their politeness is your backdoor.

## The Physical Risk
Unlike the VOID, where a trace might only burn a neural link, physical detection in the Meatspace has permanent consequences. If a reader detects a "Clone Collision" (two identical IDs in different zones simultaneously), the facility goes into lockdown. In VOID_RUN, a physical alert is a death sentence. Be silent. Be invisible. Be someone else.
