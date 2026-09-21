/**
 * NEXUS Plugins for OpenCode
 *
 * This module exports all NEXUS plugins for OpenCode integration.
 * Plugins provide hook-based automation that mirrors Claude Code's hook system
 * while taking advantage of OpenCode's more sophisticated 20+ event types.
 */

export { NexusHooksPlugin, default } from "./nexus-hooks.js"

// Re-export for named imports
export * from "./nexus-hooks.js"
