# NEXUS-OS for Gemini CLI

This specification defines the operational baseline, review criteria, and security guardrails for Gemini CLI when working within repositories orchestrated by NEXUS-OS (Universal Agent OS).

## System Architecture

NEXUS-OS provides a cross-harness operational framework supporting multi-agent delegation (68 agents, 292 skills, 94 commands), structured workflows, and declarative rules. For Gemini environments, runtime integration centers on project-local instructions (`.gemini/GEMINI.md`), shared MCP connectors, and cross-harness package configuration. Master CLI is accessible via `nexus` or `nexus-os`.

## Development Lifecycle

1. **Strategic Planning**: Formulate an architectural specification before modifying non-trivial features.
2. **Test-First Discipline (TDD)**: Write failing tests establishing defect or feature boundaries prior to writing implementation code.
3. **Continuous Review**: Inspect changes for security vulnerabilities, edge-case regressions, and unnecessary complexity.
4. **Hermetic & Reversible Changes**: Keep diffs minimal, modular, and cleanly isolatable.

## Engineering Standards

- **State Immutability**: Favor pure transformations and immutable data structures over mutable state.
- **Modularity**: Restrict function length and keep file responsibilities single-purpose.
- **Defensive Boundary Validation**: Rigorously validate all external parameters, filesystem paths, and network payloads at entry points.
- **Zero Secrets Policy**: Never commit credentials, tokens, or private keys; always source from runtime environment variables.
- **Explicit Failure Modes**: Throw structured errors with actionable diagnostics rather than swallowing exceptions.

## Security Audit Checklist

Prior to staging any commit:

- [ ] Verify absence of credentials, API tokens, passwords, and sensitive keys.
- [ ] Ensure untrusted inputs are sanitized and boundary-checked.
- [ ] Confirm database operations employ parameterized queries.
- [ ] Ensure HTML/DOM output escaping to eliminate XSS vectors.
- [ ] Verify authorization and authentication gates across sensitive entry points.
- [ ] Ensure stack traces or sensitive internal paths are stripped from client-facing error outputs.

## Release & Commit Conventions

- Adopt Conventional Commit formatting: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.
- Run targeted automated unit and integration tests covering touched components.
- Favor standard library solutions over introducing heavy third-party runtime dependencies.

## Shared System Assets

- `AGENTS.md`: Global repository directives and subagent delegation protocols.
- `skills/`: Comprehensive domain workflows and step-by-step technical guides.
- `commands/`: Slash-command templates and prompt macros.
- `mcp-configs/`: Standard Model Context Protocol server definitions.
