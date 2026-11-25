With your wheel built in `dist/`, follow this quick-start guide to deploy **AI Code Secure** into any live **GitLab** or **GitHub** repository.

---

### 1. Install the Package

Install the built wheel into your local or CI runner environment:

```bash
pip install dist/ai_code_secure-0.1.0-py3-none-any.whl

```

---

### 2. Initialize Your Target Repository

Navigate to your Node.js repository, create a setup branch, and run `init` for your target platform:

```bash
cd /path/to/your-repo
git checkout -b chore/setup-ai-code-secure

# Choose one:
ai-code-secure init --platform gitlab
# OR
ai-code-secure init --platform github

```

Add the temporary runtime artifacts directory to your `.gitignore`:

```gitignore
.ai-code-secure/artifacts/

```

---

### 3. Configure `ai-code-secure.yaml`

Update `ai-code-secure.yaml` in the root of your repository to match your project:

```yaml
project:
  name: "my-service"
  base_branch: "main"
  primary_language: "nodejs"
  test_command: "npm test"

vcs:
  provider: "gitlab" # or "github"
  host: "https://gitlab.com" # or "https://github.com"
  remediation_branch_prefix: "ai-remediation/"
  require_human_approval: true
  auto_merge_on_approval: false

security_rules:
  severity_threshold: "MEDIUM"

```

---

### 4. Configure CI/CD & Secrets (Never Commit Tokens)

#### Option A: GitLab Setup

1. **Include Pipeline:** Add to `.gitlab-ci.yml`:
```yaml
include:
  - local: '.gitlab-ci.ai-secure.yml'

```


2. **Add Masked Variables:** Go to **Settings → CI/CD → Variables** and add:
* `GITLAB_TOKEN` (`api` + `write_repository` scopes, **Masked: Yes**, **Protected: No**)
* `LLM_API_KEY` (**Masked: Yes**)



#### Option B: GitHub Setup

1. **Enable PR Permissions:** Go to **Settings → Actions → General → Workflow permissions**, select **Read and write permissions**, and check **Allow GitHub Actions to create and approve pull requests**.
2. **Add Copilot CLI Token:** Create a fine-grained personal access token owned by your personal account, grant it the **Copilot Requests** account permission, and limit repository access to this repository. Add it under **Settings → Secrets and variables → Actions** as `COPILOT_GITHUB_TOKEN`. The workflow uses the built-in `GITHUB_TOKEN` for repository operations; do not use a classic personal access token.

*The GitHub workflow installs GitHub Copilot CLI on Node.js 22 and runs the configured orchestrator prompt. For GitLab, set `ACS_AGENT_RUNNER` to your enterprise AI agent CLI command.*

---

### 5. Merge & Verify

Commit and merge your setup branch into `main`:

```bash
git add .
git commit -m "chore: configure AI Code Secure pipeline"
git push -u origin chore/setup-ai-code-secure

```

Once merged, pushing to any feature branch triggers **pre-merge review & isolated remediation (`ai-remediation/*`)**, pauses for your **MR/PR approval**, and generates a **post-merge impact report** in `docs/impact-reports/`.

For more context on running AI-assisted security workflows inside private enterprise environments, see [How to Run AI in Secure Environments with GitLab Duo Self-Hosted](https://www.youtube.com/watch?v=u5PRHXkg16I).