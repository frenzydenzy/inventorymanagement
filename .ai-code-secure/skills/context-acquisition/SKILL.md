---
name: context-acquisition
description: Read-only Git diff extraction, project stack discovery (Node.js/Jest, Java/Maven/Gradle), and architectural logic mapping.
---

# Skill: Context Acquisition & Logic Mapping

### 1. Load Configuration & Verify Branch State
- Read `ai-code-secure.yaml` from the repository root.
- Run read-only Git inspection commands:
  - Current branch: `git rev-parse --abbrev-ref HEAD`
  - Current commit SHA: `git rev-parse HEAD`
  - Verify `current_branch != base_branch`. If on `base_branch`, halt and report that context acquisition only runs on feature branches.

### 2. Extract Committed Diffs
- Identify all files changed between `base_branch` and `HEAD`:
  ```bash
  git diff --name-status origin/<base_branch>...HEAD
  (Fallback to <base_branch>...HEAD if origin/<base_branch> is unavailable in local testing).

  Retrieve unified diffs for each changed file:

   git diff -U5 <base_branch>...HEAD -- <file_path>
  Exclude lockfiles (package-lock.json, yarn.lock, pom.xml.versionsBackup), build outputs (dist/, target/, build/), and .ai-code-secure/ artifacts from code logic analysis.
###3. Detect Stack & Map Related Tests
Node.js / JavaScript / TypeScript (package.json present):

Inspect package.json to confirm test framework (e.g., jest) and scripts.

For every modified source file src/foo/bar.js (or .ts), locate matching test files (*.test.js, *.spec.js, __tests__/bar.test.js).

Java (pom.xml or build.gradle present - extensible):

Identify build tool (maven vs gradle) and map src/main/java/.../Foo.java to src/test/java/.../FooTest.java.

4. Analyze Code Structure & Intent
For each changed file, determine:

Change Classification: feature, bugfix, refactor, config, or test.

Entry Points & Data Flow: Identify functions, API routes, database queries, external HTTP calls, file system operations, or user-input handlers touched by the diff.

Logic Summary: Concise explanation of what the developer's commit achieves.

5. Emit Context Artifact
Write valid JSON to <reporting.artifacts_dir>/context-report.json matching this exact schema:

```json
{
  "metadata": {
    "feature_branch": "string",
    "base_branch": "string",
    "commit_sha": "string",
    "project_stack": "nodejs | java | unknown",
    "test_framework": "jest | junit | none"
  },
  "summary": "Concise architectural summary of all committed changes",
  "changed_files": [
    {
      "path": "src/api/users.js",
      "status": "M",
      "language": "javascript",
      "change_type": "feature",
      "logic_summary": "Adds endpoint to fetch user profile by query param id",
      "risk_surfaces": ["user_input", "database_query"],
      "related_tests": ["tests/api/users.test.js"],
      "diff": "<unified diff snippet>"
    }
  ]
}
```
