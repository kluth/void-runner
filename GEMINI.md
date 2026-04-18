# FOUNDATIONAL MANDATES

## TDD Mandate (TEST-DRIVEN DEVELOPMENT)
- **CRITICAL:** You MUST write comprehensive tests BEFORE implementing any new functionality.
- EACH AND EVERY part of new features must be verified via failing tests first, then implemented to pass.

## Validation Protocol
- **CRITICAL:** You MUST perform a comprehensive diagnostic check (TypeScript compiler, build logs, and runtime process audit) BEFORE stating that any task or sub-task is complete.
- Never settle for "it should work." Verify behavioral and structural integrity empirically.

## Type Safety Mandate
- **CRITICAL:** Absolute type safety is crucial and may NOT be skipped through unstrictly "any" usage.
- All interfaces, signals, and data structures must be strictly typed.
- **INDEX SIGNATURES:** When `noPropertyAccessFromIndexSignature` is active, you MUST use bracket notation (`obj['key']`) instead of dot notation (`obj.key`) for types with index signatures (like `Record<string, T>`).
- Use of "any" is permitted ONLY for external 3rd-party profiles where a type is genuinely unavailable, and even then, it should be narrowly scoped.

## Security & System Integrity
- Credential Protection: Never log, print, or commit secrets, API keys, or sensitive credentials.
- Protect \`.env\`, \`.git\`, and system configuration folders rigorously.

## Engineering Standards
- Adhere strictly to existing workspace conventions and architectural patterns.
- Prioritize explicit composition and type safety over complex inheritance or hacks.
- Always search for and update related tests after code changes.
