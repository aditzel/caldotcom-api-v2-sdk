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

`publish.yml`, `docker-publish.yml` and `junie.yml` remain byte-for-byte unchanged.
They do not consume this CI workflow or its artifact. This six-file preparation
changes no package, SDK/MCP application path or Dockerfile, so it does not match
the Docker publisher's main-push path filters. npm provenance, release publishing
and managed Junie replacement remain separate phases; this preparation triggers
no release or deployment.
