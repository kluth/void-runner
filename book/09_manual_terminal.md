# Manual: Terminal Basics

The Terminal is not merely a tool; it is your central nervous system within the VOID. In VOID_RUN, we eschew the decorative abstractions of modern operating systems. There are no icons to click, no windows to drag, and no safety nets to catch your fall. There is only the prompt, and your ability to command it.

## The Interface
The interface is a high-contrast, monochrome buffer. Every character rendered is a data point you must process. The cursor blinks at a steady 60Hz—a rhythmic reminder of the hardware clock that governs your existence. If the screen flickers or the characters shift, you are likely experiencing signal degradation or an active intrusion.

### Command Structure
Commands follow a strict brutalist syntax: `[COMMAND] [FLAGS] [TARGET]`.
*   **COMMAND**: The verb. What you intend to do to the system.
*   **FLAGS**: Modifiers. How you intend to bypass security or optimize throughput.
*   **TARGET**: The object. Usually a file path, a network node, or a process ID.

## Essential Commands
To survive your first run, you must internalize these primitives:

1.  **`ls` (List)**: Scans the current directory buffer. It reveals the skeletal structure of the local file system. Use `ls -a` to reveal hidden system configuration files and `.sh` scripts left behind by previous operators.
2.  **`cat` (Concatenate)**: Dumps file contents directly into the terminal buffer. Use this to read intercepted logs, encrypted manifests, or system core dumps. Warning: Reading binary files directly may cause buffer desynchronization or visual artifacts.
3.  **`ssh` (Secure Shell)**: The primary tool for lateral movement. Establishing an SSH connection to a remote node is the first step in any breach. Syntax: `ssh [USER]@[NODE_IP]`.
4.  **`crack`**: A specialized VOID_RUN utility. It initiates a brute-force or cryptographic attack on the target's authentication layer. It is resource-intensive and will trigger local IDS (Intrusion Detection Systems) if not masked properly.
5.  **`purge`**: The ultimate fallback. Deletes local logs and clears the terminal history. In a brutalist environment, leaving a footprint is a death sentence.

## Philosophy of the Prompt
Efficiency is the only metric of success. A skilled operator does not type; they execute. Utilize **Tab-Completion** to minimize keystrokes and reduce the window of detection. The terminal remembers your history (accessible via the `history` command), but so does the enemy.

Remember: The terminal does not interpret your intent; it executes your input. A single misplaced character in a `rm -rf` command can terminate your run instantly. In the VOID, there are no "Undo" operations. There is only the next command.
