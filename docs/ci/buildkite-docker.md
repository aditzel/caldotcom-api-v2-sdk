# Inactive Janus Docker publication template

`docs/ci/docker-publish.janus.yml` is inactive source for a future replacement of
`.github/workflows/docker-publish.yml`. GitHub discovers workflows only directly
under `.github/workflows`; landing this documentation template does not register
or dispatch it. Source review and landing are separate from commissioning.

The active Docker workflow remains byte-identical to main at
`75f28c5696ccf117c852d3883f2905626b89ddb3` (Git blob
`2df65443395ef71a54da7a75399a633162ea348d`). It retains the self-hosted Linux/X64
runner, `DOCKER_USERNAME` / `DOCKER_PASSWORD` login, existing action versions,
main package/Dockerfile path filters, published-release trigger, ordered tags,
labels and build inputs. No build arguments, platforms, manual trigger or
concurrency rule are added. These docs and test paths do not match its push
filters. This is preservation of source behavior, not fresh runtime health proof.

Do not copy, move, invoke or reference the candidate from an active workflow until
**all commissioning gates below pass and activation is explicitly authorized**.
There is no Docker mode variable or automatic fallback. Npm's
`JANUS_CAL_RELEASE_MODE` and `cal-policy.example.json` do not authorize Docker.
The pinned verifier requires exactly two jobs, including exact planner step names
and ordering; even a third skipped legacy job violates its admission contract.

## Candidate behavior after explicit activation

GitHub computes and uploads a small metadata plan without checking out repository
code. Its second job calls the reviewed coordinator from
`MiraiForge/devops@2f602a72d6b62b14a70eaef5710de87cc7960b85`. The coordinator dispatches
the fixed `caldotcom-api-v2-sdk-docker` producer and then the
`caldotcom-api-v2-sdk-docker-publish` publisher in `mirai-forge`. Image building and
Docker Hub publication happen on Janus. In this future coordinator, GitHub receives
no Docker Hub credentials and does not build images; the current active publisher
retains its existing login. Both stages share the six-hour budget that starts at
the original planner's start time; retries never reset it.

The coordinator checks original GitHub authority, current native jobs and a
protected completion export before succeeding. An uncertain build-create response
is reconciled through reads, without another POST. A missing export remains
pending; a transport, identity or policy mismatch fails. Cancellation and a newer
attempt invalidate the old authority. See the reviewed
[native publisher runbook](https://github.com/MiraiForge/devops/blob/2f602a72d6b62b14a70eaef5710de87cc7960b85/runbooks/buildkite-cal-docker.md)
for installation, recovery and rollback.

## Required before activation: repository configuration

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

In the candidate, `GITHUB_TOKEN` has read-only contents/actions access. Only the
coordinator job has `id-token: write`, for Tailscale federation. There are no npm credentials or npm
policy exceptions in this Docker workflow.

## Required before activation: native acceptance gates

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
5. Reconcile and validate the **final workflow blob, policy and helper/runtime pin
   closure** together, including installed source bundles and both fixed pipeline
   definitions. The retained `2f602a72d6b62b14a70eaef5710de87cc7960b85` helper pin is a
   historical candidate, not an approved current runtime. Later upstream fixes
   include archive extraction hardening, registry temporary-file race handling,
   controller/cancellation cleanup and journal capacity/retention gates. Compare
   and validate that complete closure before selecting new pins; do not silently
   adopt a newer helper or claim the old closure is commissioned. Complete native
   positive, negative, retry/cancellation and recovery checks from the runbook. Record the
   resulting provider/job identities and protected proof. Local tests and ordinary
   GitHub PR checks do not satisfy these gates. Do not create a package, release,
   tag or registry image merely to test this migration.
6. Record protected artifact/storage ownership and permissions, provenance and
   index integrity, policy/blob/digest mismatch rejection, current-run authority,
   reruns, the original six-hour deadline, cancellation, invalid completion,
   uncertain-create GET-only reconciliation and recovery evidence for both fixed
   pipelines. Validate positive and negative cases against the final installed
   closure. Mocked contract tests are not native acceptance evidence.

The host account/key, tailnet identities/grants, endpoint and live provider checks
are not commissioned by this repository change. Missing configuration fails before
Buildkite dispatch. Enable only after review and native evidence are complete.

## Explicit activation and rollback

After every gate passes, prepare a separately reviewed source change installing
this candidate at `.github/workflows/docker-publish.yml`. Reconcile its final blob
with `JANUS_CAL_DOCKER_WORKFLOW_BLOB`, both native policies and the installed
publisher policy digest. Preserve the reviewed legacy workflow blob above as a
rollback artifact. Activation is a workflow replacement plus commissioned native
infrastructure, not a repository-variable flip. Do not weaken verification to
accommodate an extra job or an unvalidated policy/pin combination.

Before rollback, stop new admission through the approved operational procedure
and inventory all admitted, in-flight and uncertain producer/publisher attempts.
Drain or quiesce them and reconcile provider evidence, protected journals,
completion exports and actual registry state. An uncertain registry write must
not trigger a blind retry or legacy fallback. Preserve journals and proof; never
erase them to make a retry appear new.

Only after that reconciliation, explicitly review and authorize restoration of
the saved legacy workflow and its verified runner/credential prerequisites. A
source rollback cannot undo image pushes or tags already written. Investigate
existing runner, credential or build failures separately; this inactive template
is neither a runtime health fix nor permission to rotate credentials or publish.
