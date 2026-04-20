# VOID_RUN ARCHIVE: [19] DATABASE INFILTRATION & SQL INJECTION

### THE COLD STORAGE OF CIVILIZATION
In the logic-gated architecture of the VOID, databases are more than just repositories; they are the collective memory of the systems we prey upon. Every credential, every transaction, and every hidden directive is etched into structured tables. To the uninitiated, these are fortresses of order. To a Runner, they are brittle constructs waiting for the right linguistic fracture. To control the database is to control the past, present, and future of the target node.

### THE ART OF THE INJECTION
SQL Injection (SQLi) is the ultimate subversion of intent. It is the process of whispering a command into a query field that was designed only for data. By manipulating the syntax of the Structured Query Language, you bypass the logic of the application layer and speak directly to the engine—the raw, unfeeling heart of the target's memory. You are not breaking the rules; you are rewriting them in real-time.

#### 1. TAUTOLOGY ATTACKS: THE "1=1" BREACH
The most basic, yet most devastating, entry point. When a system asks for a password, it is essentially asking: *“Is the input equal to the record?”* By appending `' OR 1=1--`, you force the system to evaluate a mathematical truth that cannot be denied. The logical check resolves to `TRUE` regardless of the password. The gate opens not because you have the key, but because you have convinced the gate that the concept of "wrong" no longer exists in its universe.

#### 2. UNION-BASED EXTRACTION
When the breach is established, you must drain the data. The `UNION` operator allows you to stitch your own malicious queries onto the legitimate ones. This is surgical extraction. You map the columns, identify the data types, and then bleed the tables dry. In VOID_RUN, this is how we uncover the "High-Value Targets" (HVTs) and encrypted hashes hidden beneath layers of administrative obfuscation. It is the digital equivalent of a bank heist where the vault door simply vanishes.

#### 3. BLIND INFILTRATION: THE ECHO IN THE DARK
Advanced systems may not return error messages or data directly. Here, we use Blind SQLi. We ask the database a series of Boolean (Yes/No) questions. *“Is the first letter of the admin password 'A'?”* If the page takes five seconds to load (triggered by a `SLEEP` command), the answer is Yes. It is slow, methodical, and silent—a digital interrogation in a soundproof room. Every second of delay is a character stolen from the enemy.

### WARNING: THE IDS REACTION
Do not be reckless. Databases are heavily monitored by Intrusion Detection Systems (IDS). Repeated syntax errors or massive `UNION` dumps will trigger a hard-lock. In the VOID, a failed injection doesn't just mean a closed door; it means a trace-route is already screaming toward your terminal. If the target detects a `WAITFOR DELAY` or an unexpected `'`, your window of opportunity closes permanently.

**ERASE YOUR LOGS. PURGE THE TEMP TABLES. LEAVE NO SYNTAX BEHIND.**

---
*VOID_RUN: BRUTALITY IN LOGIC*
