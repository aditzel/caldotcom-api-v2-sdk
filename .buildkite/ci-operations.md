# Ordinary CI operations

Main pushes and same-repository PRs targeting `main` use
[Cal CI on Buildkite](https://buildkite.com/mirai-forge/caldotcom-api-v2-sdk-ci).
Its protected bootstrap selects the image-owned `build-and-test` job on Janus.
The repository cannot upload replacement steps or grant itself runner access.
The install, lint, build and test commands, Node 22, Bun 1.3.0 and effective
360-minute ordinary job limit are unchanged.

GitHub's `CI / build-and-test` job runs only for fork PRs or an explicit Actions
dispatch. A skipped hosted job on a same-repository PR is not a successful Janus
build: check the Buildkite status and linked build for the exact head commit.
The Buildkite pipeline publishes separate branch and PR status contexts. Keep
fork acceptance on its hosted check rather than requiring a Buildkite status
that fork PRs cannot produce. This cutover adds no branch protection rule.

The provider's branch filter is `main`, PR builds are enabled with forks disabled,
and tag builds are disabled. Its webhook conditional is:

```text
build.pull_request.id == null || build.pull_request.base_branch == "main"
```

PR builds ignore Buildkite's branch filter, so the conditional excludes stacked
PRs targeting other branches. Janus independently authenticates source admission.
Automatic skip/cancel of intermediate builds is disabled, preserving the source
workflow's existing concurrency behavior.

## Artifacts and manual runs

On success, download `sdk-dist.tar.gz` from the Buildkite job's artifacts. It
contains the SDK `dist/` directory; validate the guarded artifact index's digest
before consuming it. Failed or canceled jobs do not publish an SDK tarball.
This archive is CI output, not permission to publish a package or image.

Use [Cal manual CI](https://buildkite.com/mirai-forge/caldotcom-api-v2-sdk-manual-ci)
for normal operator-triggered checks. Its protected controller freezes the
selected branch or tag and verifies the build creator and current attempt.
The manual route has separate provider overhead allowance; ordinary CI retains
the original 360-minute whole-job ceiling.

## Rollback

For an immediate trusted-source rerun, use GitHub Actions' `CI` workflow dispatch
on the intended ref. This runs the original read-only hosted Ubuntu job, including
its SDK directory artifact upload, without waiting for Buildkite.

To restore automatic hosted CI, revert the cutover in `.github/workflows/ci.yml`:
restore `push.branches: [main]` and remove the job-level routing condition. Confirm
the hosted PR and main checks before disabling the ordinary Buildkite webhook.
Do not change the release, Docker publishing or Junie workflows as part of this
rollback; their migrations and commissioning gates remain separate.
