---
name: documentation
description: Generates post-merge Markdown impact reports with before/after diffs, test metrics, and historical trend tracking.
---

# Skill: Post-Merge Impact Documentation & Metrics

## Execution Steps

### 1. Verify Post-Merge Eligibility
- Read `ai-code-secure.yaml` (`reporting.artifacts_dir`, `reporting.impact_reports_dir`, `reporting.history_log`).
- Read `context-report.json`, `vulnerability-report.json`, and `remediation-report.json`.
- Check MR merge status:
  -GitLab (vcs.provider == "gitlab"): Inspect via glab mr view <iid>.
  - GitHub (vcs.provider == "github"): Inspect via gh pr view <pr_number> --json state merged.
  - If `remediation-report.json` status is `"AWAITING_APPROVAL"`, confirm the MR state is `"merged"`. If `"closed"` (developer denied merge), log `"status": "REJECTED_BY_DEVELOPER"` in history and halt without writing a post-merge impact report.

### 2. Update Historical Metrics Store
Run the deterministic metrics tracker script to record this run and compute cumulative context:
```bash
python .ai-code-secure/skills/documentation/scripts/record_metrics.py \
  --context .ai-code-secure/artifacts/context-report.json \
  --vuln .ai-code-secure/artifacts/vulnerability-report.json \
  --remediation .ai-code-secure/artifacts/remediation-report.json \
  --history .ai-code-secure/history.json \
  --summary-out .ai-code-secure/artifacts/metrics-summary.json

### 3. Generate Post-Merge Impact Report
Create <reporting.impact_reports_dir>/<sanitized_branch>-<short_sha>.md containing these mandatory sections:

Executive Summary & Feature Context: What the developer built (from context-report.json) and how it connects to prior commits recorded in metrics-summary.json.

Security & Quality Remediation Summary: Table of findings (Rule ID, Standard, Severity, File, Resolution Status).

Before & After Code Comparisons: Fenced diff blocks showing vulnerable vs. remediated snippets and architectural rationale.

Validation & Test Execution Results: Test command run, pass/fail counts, and regression status.

Historical Metrics & Impact Assessment: Comparison of current findings resolved vs. cumulative repository totals, affected modules, and residual risk notes.

###4. Publish Summary to GitLab
Post a concise summary comment with a link to the generated impact report on the merged GitLab Merge Request :
  - GitLab: glab mr note <iid> --message-file .ai-code-secure/artifacts/impact-summary.md

  - GitHub: gh pr comment <pr_number> --body-file .ai-code-secure/artifacts/impact-summary.md