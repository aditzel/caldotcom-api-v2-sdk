# Protected Janus SDK CI preparation

This is additive ordinary CI preparation. Automatic main pushes, pull requests
against main and manual dispatch use read-only hosted Ubuntu while native
commissioning completes; the retired self-hosted Actions labels leave jobs queued.
Checkout does not persist credentials. Keep automatic Actions until the native
pipeline has been commissioned and verified.

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

Before native cutover, verify exact PR/main source identity, statuses, hosted fork
isolation and manual fallback, plus SDK archive upload/download hashes and
failure/cancellation behavior. The repository tarball replaces Actions' directory
artifact only after those native handoff checks pass. Historical local test
counts are not current provider evidence.

`publish.yml`, `docker-publish.yml` and `junie.yml` remain byte-for-byte unchanged.
They do not consume this CI workflow or its artifact. This preparation
changes no package, SDK/MCP application path or Dockerfile, so it does not match
the Docker publisher's main-push path filters. npm provenance, release publishing
and managed Junie replacement need their separate integrations; this preparation triggers
no release or deployment.

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
CJS, legacy JS and declaration entry points and README; every included member
must match the corresponding SDK file. Duplicate paths, traversal, links,
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
provenance all need verification before changing `publish.yml`. Docker Hub
publishing needs its isolated builder and remains separately tracked.
