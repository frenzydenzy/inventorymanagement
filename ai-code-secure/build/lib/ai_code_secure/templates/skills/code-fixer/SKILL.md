---
name: code-fixer
description: Creates an isolated remediation branch, applies security/quality fixes, runs Jest/JUnit tests, and opens a GitLab Merge Request into the feature branch.
---

# Skill: Isolated Remediation & GitLab MR Creation

## Execution Steps

### 1. Gate Check
- Read `ai-code-secure.yaml` (`project.base_branch`, `project.test_command`, `vcs.remediation_branch_prefix`, `reporting.artifacts_dir`).
- Read `<reporting.artifacts_dir>/vulnerability-report.json`.
- If `remediation_required` is `false` or `findings` is empty:
  - Write `remediation-report.json` with `"status": "NO_FIXES_NEEDED"` and exit immediately.

### 2. Create Isolated Remediation Branch
- Confirm current branch is `<feature_branch>` and is NOT `<base_branch>`.
- Derive `<short_sha>` via `git rev-parse --short HEAD`.
- Create and checkout the isolated branch before modifying any file:
  ```bash
  git checkout -b <vcs.remediation_branch_prefix><feature_branch>-<short_sha>
  ```
- Never switch back to or commit on `<feature_branch>` or `<base_branch>` during remediation.

### 3. Apply Targeted Fixes
For each entry in `vulnerability-report.json` (`findings`):

1. Open `file_path` and inspect `line_number` and `snippet` together with the surrounding function or block. If the snippet no longer matches the file, report the finding as `SKIPPED_STALE` and do not guess at another location.
2. Save the exact pre-edit block as `before_snippet`.
3. Apply the smallest idiomatic change required by `remediation_plan`. Preserve public function signatures, unrelated formatting, and unrelated logic.
4. Save the exact post-edit block as `after_snippet`.
5. Record one remediation entry per finding, even when multiple findings refer to the same file.

Apply these rule-specific replacements unless the surrounding code makes a safer equivalent necessary:

- `CX-001` (Injection): Replace `eval()` or `exec()` with a safe parser such as `JSON.parse()`, an explicit allowlist, or `execFile()` with fixed command/argument boundaries. Do not retain string-built command execution.
- `CX-002` (Hardcoded Secrets): Replace literal credentials with `process.env.<VAR_NAME>` in Node.js or `System.getenv("<VAR_NAME>")` in Java. Add the required variable name to the project environment-variable documentation without exposing a credential value.
- `CX-003` (XSS): Replace `.innerHTML` assignment with `.textContent` when HTML is not required. If markup is intentionally required, pass it through the project's established sanitizer or DOMPurify and preserve the expected DOM structure.
- `SQ-001` (Empty Catch): Replace an empty catch with structured context logging through the project logger or `console.error(...)`, or propagate/rethrow a handled domain error. Do not leave a silent catch.
- `SQ-002` (Weak Crypto/Random): Replace `md5` or `sha1` with `sha256` for cryptographic hashing. Replace security-sensitive `Math.random()` with `crypto.randomBytes()` or `crypto.randomUUID()` and the appropriate existing import style.

After all fixes are applied:
- Re-read every `after_snippet` from the modified file to confirm it is exact.
- Ensure no finding's vulnerable pattern remains at the addressed location.
- Run the configured test suite with `project.test_command`.
- If tests fail, make at most two focused self-correction passes. Do not broaden the change beyond the reported findings unless required to restore the test contract.

### 4. Emit Remediation Artifact
Write valid JSON to `<reporting.artifacts_dir>/remediation-report.json`. Include the branch, target feature branch, overall status, test result, and every changed finding:

```json
{
  "remediation_branch": "ai-remediation/<feature_branch>-<short_sha>",
  "feature_branch": "<feature_branch>",
  "base_branch": "<base_branch>",
  "status": "AWAITING_APPROVAL | NO_FIXES_NEEDED | SKIPPED_STALE | TESTS_FAILED",
  "test_command": "<project.test_command>",
  "test_result": "PASSED | FAILED",
  "fixes": [
    {
      "rule_id": "CX-001",
      "file_path": "src/example.js",
      "line_number": 1,
      "before_snippet": "function run(x) { return eval(x); }",
      "after_snippet": "function run(x) { return JSON.parse(x); }"
    }
  ]
}
```

The `before_snippet` and `after_snippet` values must be exact text from immediately before and immediately after the edit; never reconstruct or abbreviate them.

### 5. Commit and Create Merge Request
- Commit only the targeted files and the remediation report as `fix(security): remediate reported findings`.
- Push the isolated remediation branch.
- Create a Merge Request whose source is the remediation branch and whose target is the original feature branch:
 When vcs.provider == "gitlab":
   ```bash
    glab mr create \
     --source-branch <remediation_branch> \
     --target-branch <feature_branch> \
     --title "fix(security): remediate reported findings" \
     --description "Automated security remediation for <feature_branch>. Status: AWAITING_APPROVAL."
   ```
  When vcs.provider == "github":
  ```bash
    gh pr create \
     --head "<remediation_branch>" \
     --base "<feature_branch>" \
     --title "AI Code Secure: Remediate <N> findings on <feature_branch>" \
     --body-file ".ai-code-secure/artifacts/mr-description.md"
  ```
- The final report and Merge Request status MUST be `AWAITING_APPROVAL` for human review.
- Do NOT pass `--auto-merge`, approve the Merge Request, or merge it.
- If tests remain failing after two correction passes, prefix the Merge Request title with `Draft:`, keep its status as `AWAITING_APPROVAL`, and report the failure details in `remediation-report.json`.