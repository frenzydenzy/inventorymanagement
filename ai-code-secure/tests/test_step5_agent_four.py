import json
import subprocess
import sys
from pathlib import Path
import yaml
from ai_code_secure.cli import init_repo


def test_agent_four_specs_and_metrics_tracker(tmp_path: Path):
    init_repo(tmp_path)

    agent_md = tmp_path / ".ai-code-secure" / "agents" / "documentation.agent.md"
    skill_md = tmp_path / ".ai-code-secure" / "skills" / "documentation" / "SKILL.md"
    metrics_py = (
        tmp_path / ".ai-code-secure" / "skills" / "documentation" / "scripts" / "record_metrics.py"
    )

    assert agent_md.exists()
    assert skill_md.exists()
    assert metrics_py.exists()

    _, fm, _ = agent_md.read_text(encoding="utf-8").split("---", 2)
    meta = yaml.safe_load(fm)
    assert meta["name"] == "documentation"
    assert meta["stage"] == 4

    skill_text = skill_md.read_text(encoding="utf-8")
    assert "Before & After Code Comparisons" in skill_text
    assert "REJECTED_BY_DEVELOPER" in skill_text

    artifacts = tmp_path / ".ai-code-secure" / "artifacts"
    artifacts.mkdir(parents=True, exist_ok=True)
    history_path = tmp_path / ".ai-code-secure" / "history.json"
    summary_path = artifacts / "metrics-summary.json"

    # Simulate Run 1 (historical baseline)
    ctx1 = artifacts / "ctx1.json"
    vuln1 = artifacts / "vuln1.json"
    rem1 = artifacts / "rem1.json"
    ctx1.write_text(
        json.dumps(
            {
                "metadata": {"commit_sha": "111aaaa", "feature_branch": "feature/init"},
                "summary": "Initial user routes",
                "changed_files": [{"path": "src/users.js"}],
            }
        ),
        encoding="utf-8",
    )
    vuln1.write_text(json.dumps({"findings": [{"severity": "HIGH"}]}), encoding="utf-8")
    rem1.write_text(json.dumps({"applied_fixes": [{"rule_id": "CX-003"}], "tests_passed": True}), encoding="utf-8")

    subprocess.run(
        [
            sys.executable,
            str(metrics_py),
            "--context", str(ctx1),
            "--vuln", str(vuln1),
            "--remediation", str(rem1),
            "--history", str(history_path),
            "--summary-out", str(summary_path),
        ],
        check=True,
    )

    # Simulate Run 2 (current commit)
    ctx2 = artifacts / "ctx2.json"
    vuln2 = artifacts / "vuln2.json"
    rem2 = artifacts / "rem2.json"
    ctx2.write_text(
        json.dumps(
            {
                "metadata": {"commit_sha": "222bbbb", "feature_branch": "feature/auth"},
                "summary": "Added login handler",
                "changed_files": [{"path": "src/auth.js"}, {"path": "tests/auth.test.js"}],
            }
        ),
        encoding="utf-8",
    )
    vuln2.write_text(
        json.dumps({"findings": [{"severity": "CRITICAL"}, {"severity": "MEDIUM"}]}),
        encoding="utf-8",
    )
    rem2.write_text(
        json.dumps({"applied_fixes": [{"rule_id": "CX-001"}, {"rule_id": "SQ-001"}], "tests_passed": True}),
        encoding="utf-8",
    )

    subprocess.run(
        [
            sys.executable,
            str(metrics_py),
            "--context", str(ctx2),
            "--vuln", str(vuln2),
            "--remediation", str(rem2),
            "--history", str(history_path),
            "--summary-out", str(summary_path),
        ],
        check=True,
    )

    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    assert summary["total_runs"] == 2
    assert summary["total_findings_detected"] == 3
    assert summary["total_fixes_applied"] == 3
    assert len(summary["previous_runs"]) == 1
    assert summary["previous_runs"][0]["commit_sha"] == "111aaaa"
    assert summary["current_run"]["commit_sha"] == "222bbbb"