---
description: Run automated agent task benchmarks with assertion suites and LLM-as-a-judge scoring.
agent: agent-evaluator
subtask: true
---

# Agentic Evaluation Benchmark Command

Run structured evaluation benchmarks against AI agent workflows, tools, and prompts using deterministic assertion suites, task completion rubrics, and LLM-as-a-judge pairwise scoring.

## Usage

`/eval-benchmark [suite-name] [--dataset path] [--judge-model claude|gpt4|deepseek] [--concurrency N] [--output report.json]`

- `suite-name` (optional): Benchmark test suite identifier (e.g., `code-editing`, `tool-reliability`, `refactoring`, `all`).
- `--dataset`: Path to evaluation dataset containing tasks, reference solutions, and test assertions.
- `--judge-model`: Evaluator model used for qualitative rubric scoring (defaults to `claude`).
- `--concurrency`: Number of concurrent evaluation runs (defaults to `3`).
- `--output`: File destination for the machine-readable evaluation results.

## When to Use

- When modifying system prompts, tool schemas, or subagent routing logic.
- When benchmarking different foundation models (Claude, OpenAI, Gemini, DeepSeek, Local Qwen) on real repo tasks.
- To detect subtle regressions in agent capability before releasing new agent versions.
- Guided by benchmark evaluation architectures in `skills/agentic-eval-benchmarks/`.

## Execution Workflow

1. **Taskset Ingestion & Environment Setup**:
   - Load evaluation task items: task prompt, input context, expected artifact changes, and validation tests.
   - Provision isolated scratch or git worktree environments for each benchmark execution.

2. **Autonomous Run Execution**:
   - Execute the target agent harness with bounded turns and tool budgets.
   - Record comprehensive trace logs: prompt tokens, completion tokens, tool calls, tool responses, latency, and costs.

3. **Multi-Layer Evaluation**:
   - **Deterministic Layer**: Run unit tests, lint checks, and AST assertions on generated code.
   - **Rubric Layer**: Score adherence to architectural constraints, error handling, and zero hallucination.
   - **Pairwise Judge Layer**: Compare candidate output with baseline reference using a blind LLM judge.

4. **Score Compilation & Statistical Aggregation**:
   - Calculate pass rate (accuracy %), tool call error rate, token efficiency, and completion latency.
   - Generate confusion matrices and categorize primary failure modes (infinite loop, syntax error, hallucinated API).

## Review Checklist

- [ ] Evaluation tasks executed in completely clean, isolated environments.
- [ ] Deterministic tests executed and verified independently of model output.
- [ ] Token usage and monetary cost recorded per task.
- [ ] Pairwise judge prompts tested for position bias and verbosity bias.
- [ ] Comprehensive pass/fail scorecard generated with actionable regression flags.

## Output Contract

Return a structured markdown report:
- **Benchmark Summary**: Total tasks, passed count, pass rate (%), median latency, and total tokens.
- **Detailed Task Matrix**: Task name, status (PASS/FAIL), failure classification, and judge feedback.
- **Comparison Delta**: Performance comparison against previous baseline run.
- **Handoff**: Delegated to `agent-evaluator` for regression root-cause analysis.
