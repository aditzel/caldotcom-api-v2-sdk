# Protected Janus SDK CI

Main pushes and same-repository pull requests against main run on the protected
`caldotcom-api-v2-sdk-ci` Buildkite pipeline. Fork pull requests retain read-only
hosted Ubuntu CI. Routine manual runs use `caldotcom-api-v2-sdk-manual-ci` in
Buildkite; Actions dispatch remains an explicit hosted rollback path. Checkout
does not persist credentials. See [CI operations](ci-operations.md) for status
contexts, artifacts and rollback.

The reference pipeline calls `janus-ci bootstrap` on queue `janus-linux`. The
protected image-owned `caldotcom-api-v2-sdk-ci` policy must select job
`build-and-test`, Node 22, Bun 1.3.0, command
`["bash", "scripts/buildkite/check.sh", "build-and-test"]`, the original 360-minute
Actions limit, no job secrets and artifact `sdk-dist.tar.gz`. Repository pipeline
files grant no admission and are not uploaded as native job configuration.

The wrapper preserves the original command order: `bun install --frozen-lockfile`,
`bun run lint`, `bun run build`, then `bun test`. It deliberately retains CI's Bun
1.3.0 pin while package metadata continues to declare 1.3.4. Reconciling those pins
is separate work. The protected image also supplies Python 3 for the wrapper's
process supervision; repository commands do not download a runtime or run as root.

## Isolation and cleanup

Each execution uses temporary HOME, XDG configuration/data/cache/state, Bun/npm
caches and TMPDIR. Child processes receive an allowlisted environment, without
inherited credentials, runtime injection options or caller npm configuration.
User and global npm configuration use separate empty temporary files.
Runtime dotenv files in the root and workspaces are rejected before dependency
installation; tracked examples remain permitted.

Stale final/partial archives are unlinked before validation, and old SDK dist is
removed before installing dependencies. Symlinked path components are rejected.
Successful output must contain regular single-link files with no symlinks.
Packaging creates a temporary tarball, validates it against the protected 64 MiB
file limit and renames it atomically. The archive contains `dist/` from
`packages/sdk/dist`; failed commands retain their nonzero status and do not
publish a stale or partial archive. No failure report is produced by this job.

TERM, INT and HUP record the first cancellation signal. Each command owns a
process group; cleanup sends TERM, waits at most three seconds, sends KILL to
remaining members and reaps the direct child with a bounded wait. The private
homes/configuration/caches are removed after success, failure or handled
cancellation. The controller remains responsible for exhaustive UID cleanup,
escaped sessions and hard termination. Wrapper regressions are not provider
cancellation proof.

## Commissioning and publishing boundaries

When changing runner admission, recheck exact PR/main source identity, statuses,
hosted fork isolation and manual fallback, plus SDK archive upload/download
hashes and failure/cancellation behavior. Buildkite publishes the SDK tarball;
the hosted fallback retains Actions' directory artifact. Historical local test
counts are not current provider evidence. See [CI operations](ci-operations.md)
for the cutover and rollback contract.

`docker-publish.yml` and `junie.yml` remain byte-for-byte unchanged. The npm
publisher has the separately gated integration described below.
The Docker and Junie workflows do not consume this CI workflow or its artifact. This preparation
changes no package, SDK/MCP application path or Dockerfile, so it does not match
the Docker publisher's main-push path filters. The npm provenance and release
integration still requires native commissioning before activation; managed Junie
replacement remains separate. This preparation triggers no release or deployment.

## npm artifact preparation

`bash scripts/buildkite/check.sh build-and-pack` runs the same install, lint,
build and `bun test` stages, then packs the SDK workspace with npm offline.
It uses the existing Node 22 / Bun 1.3.0 toolchain. It creates
`npm-release/package.tgz` and `npm-release/manifest.json` instead of the ordinary
`sdk-dist.tar.gz`; neither path is admitted to the active pipeline yet.

Packing runs with lifecycle scripts and workspace expansion disabled. Project
`.npmrc` files or npm release lifecycle hooks require a reviewed contract before
the job will run. The root/workspace package metadata and `bun.lock` must remain
byte-for-byte unchanged across build, tests and packing. The package name remains
the unscoped `caldotcom-api-v2-sdk`; no version bump, tag creation, registry
lookup or publication occurs. The existing publisher's unused manual `version`
input remains unused; this command accepts no version override.

The tarball is inspected without extracting it. It must contain the tested ESM,
CJS, legacy JS and declaration entry points, README and the declared LICENSE;
every included member must match the corresponding SDK file. The workspace
license carries the existing repository license into the npm package. A missing
license is rejected even if it is absent from both the workspace and archive.
Duplicate paths, traversal, links,
unexpected package members, writable archive modes, oversized archives and
metadata mismatches fail the job. The compressed limit is 64 MiB, expanded limit
128 MiB and entry limit 4096. The output directory is renamed atomically only
after validation. Failure or handled cancellation removes final and partial
release output; repeated runs remove stale output before validating arguments.

The manifest records the package identity, tarball size, SHA-256, SHA-512
integrity and hashes of the four source metadata files. It is repository-produced
data, not permission to publish. Protected producer admission, an independently
validated source/job/policy envelope, authenticated artifact consumption and
the minimal GitHub-hosted npm publisher remain commissioning gates. Native tag
and manual-dispatch semantics, the original total 360-minute job budget,
failure/cancellation/retry behavior, npm trusted-publisher configuration and
provenance all need verification before enabling the hosted release modes. Docker Hub
publishing needs its isolated builder and remains separately tracked.


## Original npm workflow integration

`Publish Package` retains its `v*` tag and manual-dispatch triggers and the unused
optional `version` input. An unset `JANUS_CAL_RELEASE_MODE` keeps the original
self-hosted publishing steps. No package/tag equality check, existing-version
success skip, environment approval or new concurrency policy is added.

After commissioning, `verify` selects the Janus build and an offline hosted npm
dry run; `publish` selects the same build and a real supported hosted publisher.
Invalid nonempty modes fail before publication. Do not select either mode until
its native identity, artifact, retry, cancellation and timeout gates pass.
Migration testing does not authorize publishing a real package or tag.

`Prepare Janus package` runs on ephemeral `ubuntu-24.04` with read-only GitHub
permissions. It checks out only the complete reviewed helper repository at
`3ff6ff730c9607546551e11f9ae271ce0235487a`, authenticates its current source/run/job,
and makes one exact-source API build request to `caldotcom-api-v2-sdk-release`.
A private intent prevents automatic retry of uncertain writes within the same
job/attempt. Full workflow reruns use their own coordinator and request; the
old producer stops when it observes the old coordinator ending. Janus performs
install/lint/build/tests/pack without publisher credentials. The coordinator
uploads its authenticated handoff before completing successfully.

`Publish to npm` requires successful preparation in either hosted mode. It uses
the same immutable helper commit, Node `24.22.0` and npm `11.19.1`. It independently
authenticates the successful coordinator, current publisher, source, newest
producer and exact artifacts before passing the original tarball to npm.
Publisher-only retries preserve the original receipt and deadline. Both jobs
have 360-minute provider limits; helper validation and npm execution additionally
consume the coordinator's original deadline, so the second job grants no new
publication budget. Private state is removed by an always-run cleanup step.

Required configuration, still unprovisioned/unverified by this change:

- `JANUS_CAL_RELEASE_POLICY`: reviewed consumer-policy JSON, including the blob
  of this exact workflow and the deployed producer-policy digest. It is supplied
  separately from the immutable helper commit to avoid a circular hash.
- `JANUS_HELPERS_READ_TOKEN`: read access to the immutable Devops helper checkout.
- `BUILDKITE_CAL_RELEASE_READ_TOKEN`: minimum read access for this pipeline's
  builds and artifacts; provided to both hosted jobs.
- `BUILDKITE_CAL_RELEASE_CREATE_TOKEN`: scoped build creation for this pipeline;
  provided only to the coordinator, never the npm publisher.
- The root-owned producer Actions reader and matching npm trusted-publisher
  repository/workflow settings. Only the final publisher has `id-token: write`.

The reviewed workflow blob and producer digest must be reconciled in both Devops
policy examples and deployed configuration before activation. The immutable
helper commit must remain reachable through stack delivery. Current examples
still pin the old workflow and cannot admit this coordinator. Local/isolated
checks are preparation evidence, not native commissioning or live OIDC proof.
Keep Docker Hub publishing and managed Junie replacement separately tracked.
