/**
 * NEXUS-OS Plugin for OpenCode
 *
 * This package provides the published NEXUS-OS OpenCode plugin module:
 * - Plugin hooks (auto-format, TypeScript check, console.log warning, env injection, etc.)
 * - Custom tools (run-tests, check-coverage, security-audit, format-code, lint-check, git-summary)
 * - Bundled reference config/assets for the wider NEXUS-OS OpenCode setup
 *
 * Usage:
 *
 * Option 1: Install via npm
 * ```bash
 * npm install nexus-os
 * ```
 *
 * Then add to your opencode.json:
 * ```json
 * {
 *   "plugin": ["nexus-os"]
 * }
 * ```
 *
 * That enables the published plugin module only. For NEXUS-OS commands, agents,
 * prompts, and instructions, use this repository's `.opencode/opencode.json`
 * as a base or copy the bundled `.opencode/` assets into your project.
 *
 * Option 2: Clone and use directly
 * ```bash
 * git clone https://github.com/nexus-os/nexus-os
 * cd nexus-os
 * opencode
 * ```
 *
 * @packageDocumentation
 */

// Export the main plugin
// opencode's legacy plugin loader iterates every module export and throws if
// any is not a plugin function, so only the plugin function may be exported.
export { default } from "./plugins/index.js"
