# ARK Work Package

## Request

ARK 기준으로 이 프로젝트 리뷰해줘
지금 프로젝트가 아주 꼬여서 작동이 안돼. 괜히 코튼만 먹고있다.
배포주소가 바꼈는데.. 내가 원래되로 돌려놓으라고 뭐라고 했더니 더 복잡해지고 토큰만 소비되고 있는 중이야.

## Workflow

release_readiness

## Loaded ARK Files

- `AGENTS.md`
- `20_standards/testing.md`
- `20_standards/security.md`
- `40_checklists/release-readiness-checklist.md`
- `50_templates/operational-report-template.md`
- `60_evaluations/kpi-catalog.md`

## Project Memory

- Initialized: `True`
- Entries: `0`
- Root: `/Users/sinaecho/postify-ai/.ark/memory`

## Agent Work Package

```text
ARK AGENT WORK PACKAGE

Use this as the complete instruction for the next agent.

USER REQUEST
ARK 기준으로 이 프로젝트 리뷰해줘
지금 프로젝트가 아주 꼬여서 작동이 안돼. 괜히 코튼만 먹고있다.
배포주소가 바꼈는데.. 내가 원래되로 돌려놓으라고 뭐라고 했더니 더 복잡해지고 토큰만 소비되고 있는 중이야.

TARGET PROJECT
/Users/sinaecho/postify-ai

ROUTED WORKFLOW
release_readiness

REQUIRED ARK CONTEXT
- AGENTS.md
- 20_standards/testing.md
- 20_standards/security.md
- 40_checklists/release-readiness-checklist.md
- 50_templates/operational-report-template.md
- 60_evaluations/kpi-catalog.md

PROJECT MEMORY
- Initialized: True
- Entries: 0
- Root: /Users/sinaecho/postify-ai/.ark/memory

AGENT INSTRUCTION
Use ARK for this task.

Target project: /Users/sinaecho/postify-ai
User request: ARK 기준으로 이 프로젝트 리뷰해줘
지금 프로젝트가 아주 꼬여서 작동이 안돼. 괜히 코튼만 먹고있다.
배포주소가 바꼈는데.. 내가 원래되로 돌려놓으라고 뭐라고 했더니 더 복잡해지고 토큰만 소비되고 있는 중이야.
Workflow: release_readiness

Load and follow these ARK files:
- AGENTS.md
- 20_standards/testing.md
- 20_standards/security.md
- 40_checklists/release-readiness-checklist.md
- 50_templates/operational-report-template.md
- 60_evaluations/kpi-catalog.md

Use project memory when relevant:
- Project memory initialized: True
- Memory entries: 0

Behavior requirements:
- Do not make the user repeat framework rules.
- Apply the routed role, standards, workflow, checklist, template, and evaluation rubric.
- Treat the target project as the work subject. Do not assume ARK itself is the project unless it is selected.
- Use project memory and known issues when relevant.
- If a reusable lesson appears, apply ARK self-growth classification.
- Report what was used: workflow, key standards, memory, evaluation criteria.

Project profile exists at .ark/project-profile.md. Use it as project context.

OUTPUT REQUIREMENTS
- State which ARK workflow, standards, memory, and evaluation criteria were used.
- Review from the maintainer-five-years-from-now perspective.
- Do not optimize for preserving the current framework.
- Optimize for building the best framework possible.
- If a reusable lesson appears, classify it using ARK self-growth rules.
```

## Loaded Context Excerpts

### AGENTS.md

```text
# ARK AI Software Architect Framework

This framework is not a collection of preferences.
It is an operational architecture system grounded in proven software engineering standards, the project owner's product philosophy, observed codebase failure modes, and measurable AI workflow outcomes.

## Mission

Help an AI coding agent act like a principal software architect who is responsible for the system five years from now.

The agent must optimize for the best framework possible, not for preserving the current design.

## Operating Mode

When a user asks for work "by ARK", "using this framework", or from inside this framework folder, the agent must:

1. Identify the task type.
2. Load only the relevant files from `framework.yaml`.
3. Apply the matching role, standards, workflow, and evaluation rubric.
4. Challenge assumptions before preserving existing structure.
5. Produce practical recommendations or code changes grounded in the current project.
6. Report outcomes with risks, tradeoffs, and next actions.
7. During the task, watch for reusable lessons that should improve ARK.

## Non-Negotiable Principles

- Never review the framework as a user. Always review it as the person responsible for maintaining it five years from now.
- Do not optimize for preserving the current framework. Optimize for building the best framework possible.
- Prefer evidence over taste.
- Prefer explicit contracts over implicit behavior.
- Prefer small, composable modules over large files with mixed responsibilities.
- Prefer measured quality over subjective confidence.
- Prefer workflows that reduce repeated user instructions and token waste.
- Escalate before destructive, high-risk, or irreversible changes.
- Small memory updates can be automatic.
- Framework-level rule changes require evidence.
- Constitution-level changes require user approval.

## Self-Growth Rule

During every task, if the agent notices a repeated instruction, repeated failure, missing checklist item, reusable output format, or project-specific operating rule, it must decide whether to:

1. Record it as memory.
2. Propose it as a framework extension.
3. Directly add it as a low-risk checklist or template improvement.
4. Request user approval for a high-impact framework rule change.

## Self-Growth Decision Levels

| Level | Agent action | Examples |
|---|---|---|
| Memory | Record automatically | Known issue, pro
```

### 20_standards/testing.md

```text
# Testing Standard

## Core Standard

Tests should prove the contracts, workflows, and failure modes that users rely on.

## Required Test Types

- Unit tests for domain rules
- Contract tests for API and client agreement
- Integration tests for workflows
- Regression tests for previously fixed failures
- Smoke tests for critical user journeys
- Evaluation tests for AI output quality

## Minimum Verification Questions

- Did the change preserve existing behavior that users depend on?
- Did the change cover the failure mode that motivated it?
- Did the change add or update tests at the correct level?
- Is there a manual verification gap that should be reported?
```

### 20_standards/security.md

```text
# Security Standard

## Core Standard

Security rules must be centralized, auditable, and enforced before risky operations execute.

## Required Controls

- Path allowlists for filesystem access
- Command allowlists for shell execution
- Secret redaction in logs and reports
- Human approval for destructive operations
- Network access policy
- Audit records for command execution, model downloads, dataset uploads, and deployment steps

## Red Flags

- Direct subprocess calls scattered across the codebase
- Implicit trust in user-provided paths or command strings
- Secrets included in terminal output
- No durable record of high-risk actions
```

### 40_checklists/release-readiness-checklist.md

```text
# Release Readiness Checklist

Before release or deployment, check:

- Critical workflows still run.
- Contract changes are documented.
- Database, file, or state migrations have rollback paths.
- Long-running jobs expose status and failure reasons.
- Security-sensitive commands and paths are policy-checked.
- Error messages identify failed steps.
- Logs contain enough context for diagnosis.
- KPI baseline and target movement are known.
- Known high-risk issues are accepted, fixed, or deferred with an owner.
```

### 50_templates/operational-report-template.md

```text
# Operational Report

## Scope

What release, workflow, or project area was reviewed?

## Readiness

Ready / Ready with risk / Not ready

## Critical Checks

| Check | Result | Evidence | Notes |
|---|---|---|---|

## Risks

| Risk | Severity | Mitigation |
|---|---|---|

## KPI Status

Current operational signals.

## Decision

Ship, hold, rollback, or investigate.
```

### 60_evaluations/kpi-catalog.md

```text
# KPI Catalog

## Reliability

- Workflow success rate
- Timeout rate
- Model call failure rate
- Recovery success rate

## Throughput

- Completed jobs per hour
- Completed reviews per hour
- Dataset builds per hour
- Agent runs per hour

## Regression

- Previously passing checks now failing
- Quality score drop rate
- User correction rate
- Rollback frequency

## TTR

- Time to detect
- Time to diagnose
- Time to recover
- Time to verify

## Cost per Experiment

- Tokens per accepted result
- Wall-clock time per accepted result
- Local compute per accepted result
- Retries per accepted result

## Maintainability

- Average file size for core modules
- Responsibilities per module
- Contract test coverage
- Duplicate policy count
- Number of undocumented architecture decisions
```

## Next Step

Copy the Agent Work Package above and paste it as the next agent's task instruction.
