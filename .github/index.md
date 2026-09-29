# GitHub Automation

## Workflows

| File | Purpose |
| --- | --- |
| [workflows/pages.yml](workflows/pages.yml) | Validates source data and map geometry, assembles the four atlases, and validates local links. Pull requests only build. Pushes and manual runs on `main` check Pages configuration, stitch the assembled site onto the separate `gh-pages` branch, and deploy the same validated artifact to GitHub Pages. |

## Actions

There are no custom actions in this directory. The publishing workflow uses:

| Action | Purpose |
| --- | --- |
| `actions/checkout@v4` | Checks out the repository and supplies Git authentication for branch publishing. |
| `actions/setup-python@v5` | Installs Python 3.12 for assembly and link validation. |
| `actions/setup-node@v4` | Installs Node.js 22 for map geometry validation. |
| `actions/upload-artifact@v4` | Saves the assembled tree, including `.nojekyll`, for the snapshot job. |
| `actions/download-artifact@v4` | Restores that tree before publishing it to `gh-pages`. |
| `actions/configure-pages@v5` | Checks that Pages is enabled before updating the publishing branch. |
| `actions/upload-pages-artifact@v3` | Packages the assembled tree for Pages deployment. |
| `actions/deploy-pages@v4` | Deploys the Pages artifact and reports the site URL. |

## Local Testing

With Docker running and [nektos/act](https://nektosact.com/) installed, run from the repository root:

```sh
act push -W .github/workflows/pages.yml \
  -P ubuntu-latest=catthehacker/ubuntu:act-latest \
  --artifact-server-path "$(mktemp -d)"
act pull_request -W .github/workflows/pages.yml \
  -P ubuntu-latest=catthehacker/ubuntu:act-latest \
  --artifact-server-path "$(mktemp -d)"
```

Run the push test from `main`; on Apple Silicon, add `--container-architecture linux/amd64`. The [act artifact server](https://nektosact.com/usage/#action-artifacts) exercises uploads and downloads locally. The snapshot job replaces its remote with a temporary bare repository, runs the real publishing script, and compares the published files with the build. It verifies that an unchanged republish creates no commit and that an updated publication removes stale files while preserving branch history. Local runs skip the GitHub Pages configuration and deployment API calls and need no GitHub token.

## Pages Configuration

In **Settings → Pages → Build and deployment**, select **GitHub Actions**. The `gh-pages` branch preserves the assembled publication history; the workflow deploys its matching artifact explicitly. A branch push made with `GITHUB_TOKEN` does not trigger a second Pages build. Pages must be enabled by a repository administrator before the workflow runs.
