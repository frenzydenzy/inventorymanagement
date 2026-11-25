import yaml
from pathlib import Path
from ai_code_secure.cli import init_repo


def test_init_repo_scaffolds_declarative_files(tmp_path: Path):
    init_repo(tmp_path)

    config_path = tmp_path / "ai-code-secure.yaml"
    assert config_path.exists()

    config = yaml.safe_load(config_path.read_text())
    assert config["project"]["base_branch"] == "main"
    assert config["vcs"]["require_human_approval"] is True
    assert (tmp_path / ".ai-code-secure" / "agents").is_dir()
    assert (tmp_path / ".ai-code-secure" / "skills").is_dir()
    assert (tmp_path / ".gitlab-ci.ai-secure.yml").exists()