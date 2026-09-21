---
name: llm-finetuning-lora
description: Parameter-efficient fine-tuning (PEFT/LoRA/QLoRA) with HuggingFace, Unsloth, and PyTorch for custom task adapters and code models.
metadata:
  origin: NEXUS-OS
---

# LLM Fine-Tuning with LoRA and QLoRA

Use this skill when adapting open-weight foundation models (Llama 3, Qwen 2.5, DeepSeek) for proprietary domain schemas, specialized DSLs, or custom coding formats.

## Key Principles

- **Dataset Quality Over Quantity**: 1,000 highly curated, verified instruction-response pairs yield better performance than 50,000 noisy samples.
- **QLoRA 4-bit Quantization**: Train 32B models on consumer hardware (single 24GB VRAM GPU) using bitsandbytes NF4.

## Training Configuration (Unsloth / PyTorch)

```python
from unsloth import FastLanguageModel
import torch

max_seq_length = 4096
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Qwen2.5-Coder-14B-Instruct",
    max_seq_length=max_seq_length,
    load_in_4bit=True,
)

model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing=True,
    random_state=3407,
)
```

## Evaluation & Overfitting Gates

1. Run benchmark validation every 50 steps on a hold-out test set.
2. Halt training if validation loss diverges from training loss (early stopping).
3. Export merged 16-bit GGUF adapters for local deployment via Ollama/llama.cpp.
