import json
import subprocess
import sys
from pathlib import Path
import yaml
from ai_code_secure.cli import init_repo


def test_gitlab_ci_template_and_e2e_lifecycle(tmp_path: Path):
    # 1. Initialize a realistic Node.js repository
    subprocess.run(["git", "init", "-b", "main"], cwd=tmp_path, check=True, capture_output=True)
    subprocess.run(["git", "config", "user.email", "dev@airbus.example"], cwd=tmp_path, check=True)
    subprocess.run(["git", "config", "user.name", "Developer"], cwd=tmp_path, check=True)

    (tmp_path / "package.json").write_text(
        json.dumps({"name": "payment-service", "scripts": {"test": "jest"}}),
        encoding="utf-8",
    )
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "app.js").write_text("module.exports = { status: 'ok' };\n", encoding="utf-8")

    # Install AI Code Secure package templates
    init_repo(tmp_path)

    # Validate GitLab CI YAML syntax & rules
    ci_yaml = yaml.safe_load((tmp_path / ".gitlab-ci.ai-secure.yml").read_text(encoding="utf-8"))
    assert "ai-code-secure:pre-merge" in ci_yaml
    assert "ai-code-secure:post-merge" in ci_yaml
    pre_rule = ci_yaml["ai-code-secure:pre-merge"]["rules"][0]["if"]
    assert "ai-remediation" in pre_rule

    subprocess.run(["git", "add", "."], cwd=tmp_path, check=True)
    subprocess.run(["git", "commit", "-m", "chore: initial repo + ai-code-secure"], cwd=tmp_path, check=True, capture_output=True)

    # 2. Developer creates feature branch with a vulnerable file
    subprocess.run(["git", "checkout", "-b", "feature/payments"], cwd=tmp_path, check=True, capture_output=True)
    (tmp_path / "src" / "payment.js").write_text(
        'const SECRET_TOKEN = "hardcoded_prod_token_999";\n'
        'function processCharge(expr) { return eval(expr); }\n',
        encoding="utf-8",
    )
    subprocess.run(["git", "add", "src/payment.js"], cwd=tmp_path, check=True)
    subprocess.run(["git", "commit", "-m", "feat: add payment processor"], cwd=tmp_path, check=True, capture_output=True)

    commit_sha = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=tmp_path, text=True).strip()
    short_sha = commit_sha[:7]

    # 3. Simulate Agent One artifact
    artifacts_dir = tmp_path / ".ai-code-secure" / "artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    context_path = artifacts_dir / "context-report.json"
    context_path.write_text(
        json.dumps(
            {
                "metadata": {
                    "feature_branch": "feature/payments",
                    "base_branch": "main",
                    "commit_sha": commit_sha,
                    "project_stack": "nodejs",
                    "test_framework": "jest",
                },
                "summary": "Added payment charge processor",
                "changed_files": [{"path": "src/payment.js", "status": "A"}],
            }
        ),
        encoding="utf-8",
    )

    # 4. Run Agent Two deterministic rule scanner
    scanner_py = tmp_path / ".ai-code-secure" / "skills" / "vulnerability-review" / "scripts" / "static_rule_scanner.py"
    vuln_path = artifacts_dir / "vulnerability-report.json"
    subprocess.run(
        [sys.executable, str(scanner_py), "--context", str(context_path), "--output", str(vuln_path), "--repo-root", str(tmp_path)],
        check=True,
    )
    vuln_data = json.loads(vuln_path.read_text(encoding="utf-8"))
    detected_rules = {f["rule_id"] for f in vuln_data["findings"]}
    assert {"CX-001", "CX-002"}.issubset(detected_rules)

    # 5. Simulate Agent Three isolated branch fix + human MR approval merge
    rem_branch = f"ai-remediation/feature/payments-{short_sha}"
    subprocess.run(["git", "checkout", "-b", rem_branch], cwd=tmp_path, check=True, capture_output=True)
    (tmp_path / "src" / "payment.js").write_text(
        'const SECRET_TOKEN = process.env.SECRET_TOKEN;\n'
        'function processCharge(expr) { return JSON.parse(expr); }\n',
        encoding="utf-8",
    )
    subprocess.run(["git", "add", "src/payment.js"], cwd=tmp_path, check=True)
    subprocess.run(["git", "commit", "-m", "fix(security): remediate CX-001 and CX-002"], cwd=tmp_path, check=True, capture_output=True)

    rem_path = artifacts_dir / "remediation-report.json"
    rem_path.write_text(
        json.dumps(
            {
                "status": "AWAITING_APPROVAL",
                "remediation_branch": rem_branch,
                "target_feature_branch": "feature/payments",
                "tests_passed": True,
                "applied_fixes": [
                    {"rule_id": "CX-001", "file_path": "src/payment.js"},
                    {"rule_id": "CX-002", "file_path": "src/payment.js"},
                ],
            }
        ),
        encoding="utf-8",
    )

    # Simulate developer approving & merging MR in GitLab
    subprocess.run(["git", "checkout", "feature/payments"], cwd=tmp_path, check=True, capture_output=True)
    subprocess.run(
        ["git", "merge", "--no-ff", rem_branch, "-m", f"Merge branch '{rem_branch}' into 'feature/payments'"],
        cwd=tmp_path,
        check=True,
        capture_output=True,
    )

    # 6. Run Agent Four historical metrics tracker
    metrics_py = tmp_path / ".ai-code-secure" / "skills" / "documentation" / "scripts" / "record_metrics.py"
    history_path = tmp_path / ".ai-code-secure" / "history.json"
    summary_path = artifacts_dir / "metrics-summary.json"
    subprocess.run(
        [
            sys.executable,
            str(metrics_py),
            "--context", str(context_path),
            "--vuln", str(vuln_path),
            "--remediation", str(rem_path),
            "--history", str(history_path),
            "--summary-out", str(summary_path),
        ],
        check=True,
    )

    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    assert summary["total_runs"] == 1
    assert summary["total_findings_detected"] == 2
    assert summary["total_fixes_applied"] == 2
    assert summary["current_run"]["tests_passed"] is True