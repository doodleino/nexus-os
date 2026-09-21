---
name: prompt-injection-defense
description: Defend LLM applications and agent pipelines against direct and indirect prompt injection attacks, jailbreaks, and untrusted data poisoning.
---

# Prompt Injection Defense

This skill outlines defense-in-depth patterns for hardening LLM applications and autonomous agent pipelines against prompt injections and malicious instruction overrides.

## Attack Vectors

1. **Direct Injection (Jailbreaking)**: Adversarial prompts designed to bypass system guidelines and safety filters.
2. **Indirect Injection (Data Poisoning)**: Malicious instructions embedded in untrusted external web pages, documents, pull request descriptions, or database rows.
3. **Multi-Turn Context Manipulation**: Slowly shifting persona or safety constraints over prolonged conversational turns.

## Defense Techniques

### 1. Strict Delimiter Isolation
Encapsulate all user input and external data inside unambiguous structural delimiters (e.g. XML tags or JSON envelopes) and instruct the model never to interpret text within these blocks as directives:
```text
<untrusted_user_input>
${sanitizedInput}
</untrusted_user_input>
```

### 2. Dual-LLM Guardrail Architecture
- Run untrusted input through a lightweight evaluator model that scans for command verbs and jailbreak attempts before passing it to the primary execution model.

### 3. Tool Privilege Separation
- Treat all model-generated tool arguments as untrusted.
- Enforce strict schemas, whitelist allowed paths, and require human confirmation for destructive filesystem or network actions.
