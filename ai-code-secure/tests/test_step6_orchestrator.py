from pathlib import Path
import yaml
from ai_code_secure.cli import init_repo


def test_orchestrator_declarative_specs(tmp_path: Path):
    init_repo(tmp_path)

    orch_agent = tmp_path / ".ai-code-secure" / "agents" / "orchestrator.agent.md"
    orch_skill = tmp_path / ".ai-code-secure" / "skills" / "orchestrator" / "SKILL.md"

    assert orch_agent.exists()
    assert orch_skill.exists()

    _, fm, _ = orch_agent.read_text(encoding="utf-8").split("---", 2)
    meta = yaml.safe_load(fm)
    assert meta["name"] == "orchestrator"
    assert meta["mode"] == "coordinator"
    assert len(meta["sub_agents"]) == 4

    skill_text = orch_skill.read_text(encoding="utf-8")
    assert "pre-merge" in skill_text
    assert "post-merge" in skill_text
    assert "gitlab.remediation_branch_prefix" in skill_text
    assert "AWAITING_APPROVAL" in skill_text
    assert "[skip ci]" in skill_text