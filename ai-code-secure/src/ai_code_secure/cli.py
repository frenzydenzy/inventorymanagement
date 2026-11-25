import argparse
import shutil
from importlib import resources
from pathlib import Path
import yaml


def init_repo(target_dir: Path, platform: str = "gitlab", force: bool = False) -> None:
    """Installs .agent.md, SKILL.md, config, and CI templates for GitLab and/or GitHub."""
    if platform not in {"gitlab", "github", "both"}:
        raise ValueError(f"Unsupported platform '{platform}'. Choose gitlab, github, or both.")

    template_root = resources.files("ai_code_secure") / "templates"

    mappings = {
        "config/ai-code-secure.yaml": target_dir / "ai-code-secure.yaml",
        "agents": target_dir / ".ai-code-secure" / "agents",
        "skills": target_dir / ".ai-code-secure" / "skills",
    }

    if platform in {"gitlab", "both"}:
        mappings["ci/.gitlab-ci.ai-secure.yml"] = target_dir / ".gitlab-ci.ai-secure.yml"
    if platform in {"github", "both"}:
        mappings["ci/github-ai-secure.yml"] = target_dir / ".github" / "workflows" / "ai-code-secure.yml"

    for src_rel, dst in mappings.items():
        src = template_root / src_rel
        if dst.exists() and not force:
            raise FileExistsError(f"{dst} already exists. Use --force to overwrite.")
        if dst.exists() and force:
            if dst.is_dir():
                shutil.rmtree(dst)
            else:
                dst.unlink()

        if src.is_dir():
            shutil.copytree(src, dst)
        else:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)

    # Update vcs.provider and vcs.host in generated ai-code-secure.yaml
    config_file = target_dir / "ai-code-secure.yaml"
    config = yaml.safe_load(config_file.read_text(encoding="utf-8"))
    if platform == "github":
        config["vcs"]["provider"] = "github"
        config["vcs"]["host"] = "https://github.com"
    else:
        config["vcs"]["provider"] = "gitlab"
        config["vcs"]["host"] = "https://gitlab.com"
    config_file.write_text(yaml.safe_dump(config, sort_keys=False), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(prog="ai-code-secure", description="AI Code Secure Setup CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    init_parser = subparsers.add_parser("init", help="Install agent & skill definitions into a repository")
    init_parser.add_argument("--path", type=Path, default=Path.cwd(), help="Target repository path")
    init_parser.add_argument(
        "--platform",
        choices=["gitlab", "github", "both"],
        default="gitlab",
        help="Target CI/CD and VCS platform (default: gitlab)",
    )
    init_parser.add_argument("--force", action="store_true", help="Overwrite existing configuration")

    args = parser.parse_args()
    if args.command == "init":
        init_repo(args.path.resolve(), platform=args.platform, force=args.force)
        print(f"AI Code Secure initialized for '{args.platform}' in {args.path.resolve()}")