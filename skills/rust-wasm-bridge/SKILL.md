---
name: rust-wasm-bridge
description: Build high-performance WebAssembly modules using Rust and wasm-bindgen for integration into Node.js and browser runtimes.
---

# Rust WASM Bridge

This skill covers the development, optimization, and binding generation for executing high-performance Rust algorithms in WebAssembly (WASM) environments.

## Toolchain & Setup

- Target: `wasm32-unknown-unknown`
- Tools: `wasm-bindgen`, `wasm-pack`, `wasm-opt`

## Core Patterns

### 1. Zero-Copy Memory Sharing
- Pass large typed arrays (e.g. `Uint8Array`, `Float32Array`) via direct memory views into the WASM linear memory rather than serializing through JSON.

### 2. Exporting Functions & Structs
```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fast_compute_hash(data: &[u8]) -> Vec<u8> {
    // High performance cryptographic or hashing routine
}
```

### 3. Binary Size Optimization
Configure `Cargo.toml` release profile:
```toml
[profile.release]
opt-level = "z"
lto = true
codegen-units = 1
panic = "abort"
```
Run `wasm-opt -Oz` to shave unnecessary metadata and achieve minimal bundle size.
