---
name: orchestrator
description: Coordinates pre-merge review/remediation and post-merge impact documentation across Agents 1 through 4.
---

# Skill: Multi-Agent Pipeline Orchestration

## Execution Modes

Determine the active trigger mode from environment variables or CLI flags (`--phase pre-merge` vs `--phase post-merge`):

---

### Phase 1: `pre-merge` (Triggered on Feature Branch Push / MR Update)

1. **Validate Configuration & Branch Guard:**
   - Load `ai-code-secure.yaml`.
   - Confirm `CI_COMMIT_REF_NAME` (or `git rev-parse --abbrev-ref HEAD`) is NOT `project.base_branch` and does NOT start with `gitlab.remediation_branch_prefix` (prevent infinite loops when Agent Three pushes its remediation branch).
   - If the branch starts with `gitlab.remediation_branch_prefix`, exit `0` immediately.

2. **Invoke Agent One (`context-acquisition`):**
   - Execute `.ai-code-secure/agents/context-acquisition.agent.md`.
   - Verify `.ai-code-secure/artifacts/context-report.json` exists and is valid JSON.

3. **Invoke Agent Two (`vulnerability-review`):**
   - Execute `.ai-code-secure/agents/vulnerability-review.agent.md`.
   - Verify `.ai-code-secure/artifacts/vulnerability-report.json` exists and is valid JSON.

4. **Evaluate Remediation Gate:**
   - Read `remediation_required` from `vulnerability-report.json`.
   - **Branch A (`remediation_required == true`):**
     - Invoke **Agent Three (`code-fixer`)** (`.ai-code-secure/agents/code-fixer.agent.md`).
     - Verify `.ai-code-secure/artifacts/remediation-report.json` shows `"status": "AWAITING_APPROVAL"` and a valid `merge_request.iid`.
     - **STOP HERE.** Output the Merge Request URL and wait for human approval in GitLab UI.
   - **Branch B (`remediation_required == false`):**
     - Write `remediation-report.json` with `{"status": "NO_FIXES_NEEDED", "applied_fixes": [], "tests_passed": true}`.
     - Invoke **Agent Four (`documentation`)** to record clean-commit baseline metrics.

---

### Phase 2: `post-merge` (Triggered After Developer Approves & Merges Remediation MR)

1. **Verify Artifacts & Merge State:**
   - Ensure `context-report.json`, `vulnerability-report.json`, and `remediation-report.json` are present (restored from GitLab CI artifacts or workspace).
   - Confirm the Merge Request `merge_request.iid` has been merged into `<target_feature_branch>`.
   - If the MR was closed without merging, record `"status": "REJECTED_BY_DEVELOPER"` and exit cleanly without modifying `<target_feature_branch>`.

2. **Invoke Agent Four (`documentation`):**
   - Execute `.ai-code-secure/agents/documentation.agent.md`.
   - Confirm a new Markdown report was written under `<reporting.impact_reports_dir>/` and `<reporting.history_log>` was updated.
   - Commit the impact report to `<target_feature_branch>` with `[skip ci]` so it does not re-trigger the pipeline.