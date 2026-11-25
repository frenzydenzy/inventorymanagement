"""Tests for Agent One (Context Acquisition) declarative specs and Git diff scope."""
import subprocess
from pathlib import Path
import yaml
from ai_code_secure.cli import init_repo


def _parse_frontmatter(md_path: Path) -> dict:
    text = md_path.read_text(encoding="utf-8")
    assert text.startswith("---"), f"{md_path} missing YAML frontmatter"
    _, fm, _ = text.split("---", 2)
    return yaml.safe_load(fm)


def test_agent_one_declarative_specs(tmp_path: Path):
    init_repo(tmp_path)

    agent_md = tmp_path / ".ai-code-secure" / "agents" / "context-acquisition.agent.md"
    skill_md = tmp_path / ".ai-code-secure" / "skills" / "context-acquisition" / "SKILL.md"

    assert agent_md.exists()
    assert skill_md.exists()

    agent_meta = _parse_frontmatter(agent_md)
    assert agent_meta["name"] == "context-acquisition"
    assert agent_meta["mode"] == "read-only"
    assert agent_meta["output_artifact"] == ".ai-code-secure/artifacts/context-report.json"

    skill_content = skill_md.read_text(encoding="utf-8")
    assert "git diff --name-status" in skill_content
    assert "context-report.json" in skill_content
    assert "risk_surfaces" in skill_content


def test_agent_one_git_diff_scope_simulation(tmp_path: Path):
    """Simulates a repo with main + feature branch to verify diff isolation."""
    subprocess.run(["git", "init", "-b", "main"], cwd=tmp_path, check=True, capture_output=True)
    subprocess.run(["git", "config", "user.email", "dev@example.com"], cwd=tmp_path, check=True)
    subprocess.run(["git", "config", "user.name", "Dev"], cwd=tmp_path, check=True)

    (tmp_path / "app.js").write_text("console.log('base');\n", encoding="utf-8")
    subprocess.run(["git", "add", "."], cwd=tmp_path, check=True)
    subprocess.run(["git", "commit", "-m", "init base"], cwd=tmp_path, check=True, capture_output=True)

    # Create feature branch and commit a change
    subprocess.run(["git", "checkout", "-b", "feature/login"], cwd=tmp_path, check=True, capture_output=True)
    (tmp_path / "auth.js").write_text("function login(user) { return eval(user); }\n", encoding="utf-8")
    subprocess.run(["git", "add", "auth.js"], cwd=tmp_path, check=True)
    subprocess.run(["git", "commit", "-m", "add login"], cwd=tmp_path, check=True, capture_output=True)

    diff_out = subprocess.check_output(
        ["git", "diff", "--name-status", "main...HEAD"], cwd=tmp_path, text=True
    ).strip()

    assert diff_out == "A\tauth.js"