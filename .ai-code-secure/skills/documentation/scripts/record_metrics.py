
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser(description="Record remediation metrics and historical context")
    parser.add_argument("--context", type=Path, required=True)
    parser.add_argument("--vuln", type=Path, required=True)
    parser.add_argument("--remediation", type=Path, required=True)
    parser.add_argument("--history", type=Path, required=True)
    parser.add_argument("--summary-out", type=Path, required=True)
    args = parser.parse_args()

    context = load_json(args.context, {})
    vuln = load_json(args.vuln, {"findings": []})
    remediation = load_json(args.remediation, {"applied_fixes": [], "tests_passed": True})
    history: List[Dict[str, Any]] = load_json(args.history, [])

    meta = context.get("metadata", {})
    findings = vuln.get("findings", [])
    applied_fixes = remediation.get("applied_fixes", [])

    severity_breakdown: Dict[str, int] = {}
    for f in findings:
        sev = f.get("severity", "UNKNOWN")
        severity_breakdown[sev] = severity_breakdown.get(sev, 0) + 1

    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "commit_sha": meta.get("commit_sha", "unknown"),
        "feature_branch": meta.get("feature_branch", "unknown"),
        "files_changed": len(context.get("changed_files", [])),
        "findings_detected": len(findings),
        "fixes_applied": len(applied_fixes),
        "severity_breakdown": severity_breakdown,
        "tests_passed": bool(remediation.get("tests_passed", False)),
        "feature_summary": context.get("summary", ""),
    }

    history.append(record)
    args.history.parent.mkdir(parents=True, exist_ok=True)
    args.history.write_text(json.dumps(history, indent=2), encoding="utf-8")

    cumulative = {
        "total_runs": len(history),
        "total_findings_detected": sum(r["findings_detected"] for r in history),
        "total_fixes_applied": sum(r["fixes_applied"] for r in history),
        "previous_runs": history[:-1][-3:],  # Last 3 prior runs for historical context
        "current_run": record,
    }

    args.summary_out.parent.mkdir(parents=True, exist_ok=True)
    args.summary_out.write_text(json.dumps(cumulative, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()