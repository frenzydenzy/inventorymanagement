from pathlib import Path
import yaml
from ai_code_secure.cli import init_repo


def test_init_github_platform(tmp_path: Path):
    init_repo(tmp_path, platform="github")

    config = yaml.safe_load((tmp_path / "ai-code-secure.yaml").read_text(encoding="utf-8"))
    assert config["vcs"]["provider"] == "github"
    assert config["vcs"]["host"] == "https://github.com"

    gh_workflow = tmp_path / ".github" / "workflows" / "ai-code-secure.yml"
    assert gh_workflow.exists()
    assert not (tmp_path / ".gitlab-ci.ai-secure.yml").exists()

    wf_data = yaml.safe_load(gh_workflow.read_text(encoding="utf-8"))
    assert "pre-merge" in wf_data["jobs"]
    assert "post-merge" in wf_data["jobs"]


def test_init_both_platforms(tmp_path: Path):
    init_repo(tmp_path, platform="both")

    assert (tmp_path / ".github" / "workflows" / "ai-code-secure.yml").exists()
    assert (tmp_path / ".gitlab-ci.ai-secure.yml").exists()