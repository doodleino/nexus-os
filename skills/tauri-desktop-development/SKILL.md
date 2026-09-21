---
name: tauri-desktop-development
description: Build lightweight, memory-efficient native desktop applications using Rust backends and modern web frontends with Tauri.
---

# Tauri Desktop Development

This skill provides architecture and implementation guidelines for creating lightweight cross-platform desktop applications using Tauri v2.

## Why Tauri

- **Minimal Resource Footprint**: Uses the operating system's native webview (WebKit on macOS/Linux, WebView2 on Windows) instead of bundling a heavy Chromium instance.
- **Memory Safety & Speed**: Core logic, OS interactions, and heavy computational tasks execute in native Rust.
- **IPC Security**: Granular capability systems and command scoping prevent frontend vulnerabilities from compromising the host OS.

## Core Architecture

1. **Frontend Layer**: Built with any web framework (React, Vue, Svelte, Solid) communicating via typed IPC invoke handlers.
2. **Backend Commands**:
   ```rust
   #[tauri::command]
   fn perform_secure_action(payload: String) -> Result<String, String> {
       // Native operations with strict sandboxing
   }
   ```
3. **Security Scopes**: Explicitly declare filesystem access bounds and allowed network endpoints in `tauri.conf.json`.
