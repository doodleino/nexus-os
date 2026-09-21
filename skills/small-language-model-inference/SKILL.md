---
name: small-language-model-inference
description: Edge and on-device SLM orchestration (Phi-4, Qwen 2.5 3B/7B, Gemma 2) using llama.cpp and ONNX Runtime for zero-cost offline tasks.
metadata:
  origin: NEXUS-OS
---

# Small Language Model (SLM) Inference

Use this skill when deploying 1B–7B parameter models for offline, low-latency, or zero-cost local tasks such as commit message generation, AST linting, or classification.

## Recommended Edge Model Selection

| Model | Size | Best For | Target VRAM |
| :--- | :--- | :--- | :--- |
| **Qwen 2.5 Coder 1.5B** | 1.5B | Fast inline autocomplete, single-function fixes | ~1.5 GB |
| **Qwen 2.5 Coder 7B** | 7B | Local unit test generation, commit summarization | ~5 GB |
| **Phi-4** | 14B | Complex local reasoning and mathematics | ~9 GB |

## llama.cpp Server Execution

```bash
# Launch OpenAI-compatible local endpoint on port 8080 with 4-bit quantization
./llama-server   -m models/qwen2.5-coder-7b-instruct-q4_k_m.gguf   --ctx-size 8192   --n-gpu-layers 33   --port 8080
```
