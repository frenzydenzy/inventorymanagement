ai-code-secure/
├── pyproject.toml
├── readme.md
├── structure.md
├── src/
│   └── ai_code_secure/
│       ├── __init__.py
│       ├── cli.py
│       └── templates/
│           ├── agents/
│           │   ├── code-fixer.agent.md
│           │   ├── context-acquisition.agent.md
│           │   ├── documentation.agent.md
│           │   ├── orchestrator.agent.md
│           │   └── vulnerability-review.agent.md
│           ├── ci/
│           │   ├── .gitlab-ci.ai-secure.yml
│           │   └── github-ai-secure.yml
│           ├── config/
│           │   └── ai-code-secure.yaml
│           └── skills/
│               ├── code-fixer/
│               │   └── SKILL.md
│               ├── context-acquisition/
│               │   └── SKILL.md
│               ├── documentation/
│               │   ├── SKILL.md
│               │   └── scripts/
│               │       └── record_metrics.py
│               ├── orchestrator/
│               │   └── SKILL.md
│               └── vulnerability-review/
│                   ├── SKILL.md
│                   └── scripts/
│                       └── static_rule_scanner.py
└── tests/
    ├── test_step1_installer.py
    ├── test_step2_agent_one.py
    ├── test_step3_agent_two.py
    ├── test_step4_agent_three.py
    ├── test_step5_agent_four.py
    ├── test_step6_orchestrator.py
    ├── test_step7_e2e_pipeline.py
    └── test_step8_multiplatform.py