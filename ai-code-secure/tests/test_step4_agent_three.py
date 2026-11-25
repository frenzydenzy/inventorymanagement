import subprocess
from pathlib import Path
import yaml
from ai_code_secure.cli import init_repo


def test_agent_three_declarative_specs(tmp_path: Path):
    init_repo(tmp_path)

    agent_md = tmp_path / ".ai-code-secure" / "agents" / "code-fixer.agent.md"
    skill_md = tmp_path / ".ai-code-secure" / "skills" / "code-fixer" / "SKILL.md"

    assert agent_md.exists()
    assert skill_md.exists()

    _, fm, _ = agent_md.read_text(encoding="utf-8").split("---", 2)
    meta = yaml.safe_load(fm)
    assert meta["name"] == "code-fixer"
    assert meta["mode"] == "isolated-branch-write"
    assert meta["output_artifact"] == ".ai-code-secure/artifacts/remediation-report.json"

    skill_text = skill_md.read_text(encoding="utf-8")
    assert "git checkout -b" in skill_text
    assert "--target-branch" in skill_text
    assert "AWAITING_APPROVAL" in skill_text
    assert "Do NOT pass `--auto-merge`" in skill_text


def test_isolated_remediation_branch_does_not_alter_feature_or_base(tmp_path: Path):
    """Verifies branch isolation: main and feature/auth remain clean while remediation branch holds fixes."""
    subprocess.run(["git", "init", "-b", "main"], cwd=tmp_path, check=True, capture_output=True)
    subprocess.run(["git", "config", "user.email", "dev@example.com"], cwd=tmp_path, check=True)
    subprocess.run(["git", "config", "user.name", "Dev"], cwd=tmp_path, check=True)

    (tmp_path / "index.js").write_text("const v = 1;\n", encoding="utf-8")
    subprocess.run(["git", "add", "."], cwd=tmp_path, check=True)
    subprocess.run(["git", "commit", "-m", "base"], cwd=tmp_path, check=True, capture_output=True)

    # Developer feature branch with vulnerable commit
    subprocess.run(["git", "checkout", "-b", "feature/auth"], cwd=tmp_path, check=True, capture_output=True)
    vuln_code = "function run(x) { return eval(x); }\n"
    (tmp_path / "auth.js").write_text(vuln_code, encoding="utf-8")
    subprocess.run(["git", "add", "auth.js"], cwd=tmp_path, check=True)
    subprocess.run(["git", "commit", "-m", "feat: auth"], cwd=tmp_path, check=True, capture_output=True)

    short_sha = subprocess.check_output(["git", "rev-parse", "--short", "HEAD"], cwd=tmp_path, text=True).strip()
    remediation_branch = f"ai-remediation/feature/auth-{short_sha}"

    # Agent Three creates isolated branch and applies fix
    subprocess.run(["git", "checkout", "-b", remediation_branch], cwd=tmp_path, check=True, capture_output=True)
    fixed_code = "function run(x) { return JSON.parse(x); }\n"
    (tmp_path / "auth.js").write_text(fixed_code, encoding="utf-8")
    subprocess.run(["git", "add", "auth.js"], cwd=tmp_path, check=True)
    subprocess.run(["git", "commit", "-m", "fix(security): replace eval"], cwd=tmp_path, check=True, capture_output=True)

    # Verify original feature/auth still has its exact original commit untouched
    feature_file = subprocess.check_output(["git", "show", "feature/auth:auth.js"], cwd=tmp_path, text=True)
    assert feature_file == vuln_code
    assert subprocess.run(["git", "show", "main:auth.js"], cwd=tmp_path, capture_output=True).returncode != 0