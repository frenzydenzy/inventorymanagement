import json
import subprocess
import sys
from pathlib import Path
import yaml
from ai_code_secure.cli import init_repo


def test_agent_two_specs_and_scanner(tmp_path: Path):
    init_repo(tmp_path)

    agent_md = tmp_path / ".ai-code-secure" / "agents" / "vulnerability-review.agent.md"
    skill_md = tmp_path / ".ai-code-secure" / "skills" / "vulnerability-review" / "SKILL.md"
    scanner_py = (
        tmp_path / ".ai-code-secure" / "skills" / "vulnerability-review" / "scripts" / "static_rule_scanner.py"
    )

    assert agent_md.exists()
    assert skill_md.exists()
    assert scanner_py.exists()

    _, fm, _ = agent_md.read_text(encoding="utf-8").split("---", 2)
    meta = yaml.safe_load(fm)
    assert meta["name"] == "vulnerability-review"
    assert meta["mode"] == "read-only"
    assert meta["output_artifact"] == ".ai-code-secure/artifacts/vulnerability-report.json"

    # Create sample vulnerable JS file and clean JS file
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "vuln.js").write_text(
        'const API_KEY = "supersecretkey12345";\n'
        'function run(input) {\n'
        '  try { return eval(input); } catch (e) {}\n'
        '}\n',
        encoding="utf-8",
    )
    (tmp_path / "src" / "clean.js").write_text(
        'export function add(a, b) { return a + b; }\n',
        encoding="utf-8",
    )

    context_path = tmp_path / ".ai-code-secure" / "artifacts" / "context-report.json"
    context_path.parent.mkdir(parents=True, exist_ok=True)
    context_path.write_text(
        json.dumps(
            {
                "metadata": {"feature_branch": "feature/test", "base_branch": "main"},
                "changed_files": [
                    {"path": "src/vuln.js", "status": "M"},
                    {"path": "src/clean.js", "status": "A"},
                ],
            }
        ),
        encoding="utf-8",
    )

    output_path = tmp_path / ".ai-code-secure" / "artifacts" / "static-findings.json"
    subprocess.run(
        [
            sys.executable,
            str(scanner_py),
            "--context",
            str(context_path),
            "--output",
            str(output_path),
            "--repo-root",
            str(tmp_path),
        ],
        check=True,
    )

    results = json.loads(output_path.read_text(encoding="utf-8"))
    rule_ids = {f["rule_id"] for f in results["findings"]}
    assert {"CX-001", "CX-002", "SQ-001"}.issubset(rule_ids)
    assert all(f["file_path"] == "src/vuln.js" for f in results["findings"])