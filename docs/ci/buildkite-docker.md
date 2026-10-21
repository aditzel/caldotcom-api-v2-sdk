# Docker publication through Janus

This replaces `.github/workflows/docker-publish.yml` only after the commissioning
gates below pass. Keep the migration PR unmerged until then. It preserves the
original main-branch path filters, published-release trigger and metadata-action
tag ordering, semver rules, labels and full commit tag. It adds no test release,
manual publication trigger or concurrency cancellation rule.

GitHub computes and uploads a small metadata plan without checking out repository
code. Its second job calls the reviewed coordinator from
`MiraiForge/devops@fdeb54440011d4c385e82ef45d5c201f0d174705`. The coordinator dispatches
the fixed `caldotcom-api-v2-sdk-docker` producer and then the
`caldotcom-api-v2-sdk-docker-publish` publisher in `mirai-forge`. Image building and
Docker Hub publication happen on Janus. GitHub receives no Docker Hub credentials
and does not build images. Both stages share the six-hour budget that starts at
the original planner's start time; retries never reset it.

The coordinator checks original GitHub authority, current native jobs and a
protected completion export before succeeding. An uncertain build-create response
is reconciled through reads, without another POST. A missing export remains
pending; a transport, identity or policy mismatch fails. Cancellation and a newer
attempt invalidate the old authority. See the reviewed
[native publisher runbook](https://github.com/MiraiForge/devops/blob/fdeb54440011d4c385e82ef45d5c201f0d174705/runbooks/buildkite-cal-docker.md)
for installation, recovery and rollback.

## Required repository configuration

| Kind | Name | Scope or value |
| --- | --- | --- |
| Secret | `JANUS_HELPERS_READ_TOKEN` | Read-only checkout of MiraiForge/devops; no persisted Git credentials. |
| Secret | `BUILDKITE_CAL_DOCKER_READ_TOKEN` | Read only the two admitted Docker pipelines and their required build/job evidence. |
| Secret | `BUILDKITE_CAL_DOCKER_CREATE_TOKEN` | Create builds only in those two pipelines; no pipeline editing or registry authority. |
| Secret | `JANUS_CAL_COMPLETION_SSH_KEY` | Dedicated reader key, never an administrator or Docker key; preserve the key's final newline. |
| Variable | `JANUS_CAL_DOCKER_WORKFLOW_BLOB` | Reviewed Git blob SHA of the final Docker workflow; must match both native policies. |
| Variable | `JANUS_CAL_PUBLISHER_POLICY_SHA256` | SHA256 of the installed protected publisher policy. |
| Variables | `JANUS_CAL_TAILSCALE_MAIN_CLIENT_ID`, `JANUS_CAL_TAILSCALE_MAIN_AUDIENCE` | Dedicated main-push federated identity and its exact audience. |
| Variables | `JANUS_CAL_TAILSCALE_RELEASE_CLIENT_ID`, `JANUS_CAL_TAILSCALE_RELEASE_AUDIENCE` | Separate published-release federated identity and its exact audience. |
| Variables | `JANUS_CAL_COMPLETION_HOST`, `JANUS_CAL_COMPLETION_PORT` | Admitted native OpenSSH endpoint on Janus, reachable through the tailnet. |
| Variable | `JANUS_CAL_COMPLETION_KNOWN_HOSTS` | Independently verified host-key entry for that exact endpoint, including `[host]:port` for a non-default port. |

`GITHUB_TOKEN` has read-only contents/actions access. Only the coordinator job has
`id-token: write`, for Tailscale federation. There are no npm credentials or npm
policy exceptions in this Docker workflow.

## Network and host commissioning gates

1. Configure two [Tailscale federated identities](https://tailscale.com/docs/features/workload-identity-federation)
   with issuer `https://token.actions.githubusercontent.com`, distinct audiences,
   only `auth_keys` write scope and `tag:janus-cal-coordinator`. Restrict both to
   `repository_id=1075098118` and `repository=aditzel/caldotcom-api-v2-sdk`.
   The main identity must match `event_name=push`, `ref=refs/heads/main`, subject
   `repo:aditzel/caldotcom-api-v2-sdk:ref:refs/heads/main`, and
   `workflow_ref=aditzel/caldotcom-api-v2-sdk/.github/workflows/docker-publish.yml@refs/heads/main`.
   The release identity must match `event_name=release`, `ref=refs/tags/*`, subject
   `repo:aditzel/caldotcom-api-v2-sdk:ref:refs/tags/*`, and
   `workflow_ref=aditzel/caldotcom-api-v2-sdk/.github/workflows/docker-publish.yml@refs/tags/*`.
   Provider-side release verification additionally requires the published event.
   Do not broaden these rules to PRs, forks, other workflows or other branches.
2. Admit that tag only to the selected Janus TCP port. Audit effective grants,
   including broader existing grants; deny access to other hosts, administrative
   services and private journals. The pinned Tailscale action uses ephemeral
   membership, an in-memory state directory and post-job logout. No long-lived
   tailnet credential, exit node, subnet advertisement or public listener is used.
3. Commission the dedicated non-root `janus-cal-completion` account, root-owned
   authorized key and immutable forced reader as specified in the native runbook.
   Verify the effective native OpenSSH configuration denies shells, forwarding,
   PTY, user startup files and access to private records. Tailscale SSH is not a
   substitute for OpenSSH `ForceCommand`. If it intercepts the proposed endpoint,
   stop and resolve the approved native route; do not add an alternate listener,
   bypass administrator authentication or expose the port publicly.
4. Independently pin the host key. The workflow writes reader credentials to its
   own `0700` run/attempt directory as exclusive `0600` files, tests an actual
   bounded read before dispatch, and always attempts credential cleanup. Exit 3
   with empty output for a missing probe is the expected response. This preflight
   proves reachability/authentication, not every server-side restriction. Preserve
   coordinator dispatch evidence; cleanup removes only the reader credential directory.
5. Reconcile the final workflow blob, helper commit, native policy hashes, installed
   source bundles and both fixed pipeline definitions. Complete native positive,
   negative, retry/cancellation and recovery checks from the runbook. Record the
   resulting provider/job identities and protected proof. Local tests and ordinary
   GitHub PR checks do not satisfy these gates. Do not create a package, release,
   tag or registry image merely to test this migration.

The host account/key, tailnet identities/grants, endpoint and live provider checks
are not commissioned by this repository change. Missing configuration fails before
Buildkite dispatch. Enable only after review and native evidence are complete.
