---
name: mcp-server-builder
description: Scaffold, test, and publish production-grade Model Context Protocol (MCP) servers with stdio and SSE transport protocols.
---

# MCP Server Builder

This skill provides patterns, architecture, and validation workflows for creating Model Context Protocol (MCP) servers that connect LLMs to local developer tools, databases, and APIs.

## Architecture

An MCP server exposes:
1. **Tools**: Executable functions callable by the client (LLM).
2. **Resources**: Read-only structured or unstructured data sources.
3. **Prompts**: Reusable prompt templates with parameter substitution.

## Transport Modes

### 1. Stdio Transport (Local Tools)
- Standard input/output communication for command-line and local desktop tools.
- Never write debug logs to `stdout`; all logging must go to `stderr`.
- Handle clean SIGINT/SIGTERM process teardown.

### 2. SSE Transport (Remote / HTTP)
- Server-Sent Events for streaming updates with HTTP POST endpoints for incoming client messages.
- Implement token authentication, session timeouts, and CORS protection.

## Core Best Practices

- Validate every input tool argument using strict JSON Schema or Zod schemas.
- Set conservative execution timeouts and payload size limits on tool outputs.
- Redact credentials, API keys, and sensitive tokens from error responses.
- Write automated integration tests using simulated JSON-RPC 2.0 messages.
