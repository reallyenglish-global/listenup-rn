# Verification of the Google Play draft-release workflow

Scope: reviewed workflow and policy implementation only. The existing preview APK path, application SDK/runtime and Play configuration were not changed. Setup and limitations are in [google-play-release.md](google-play-release.md).

## Observed local execution

- Frozen pnpm dependency installation succeeded using Node 24.20.0.
- `node --test scripts/tests/play-release.test.mjs`: 8 tests passed.
- `python3 -m unittest discover -s scripts/tests -p 'test_*.py'`: 8 tests passed. Fixtures are synthetic manifest/track/bundle policy inputs, not real Play responses. Both release-policy suites are also wired into the ordinary pull-request/main test workflow without secrets.
- `pnpm exec jest --ci --runInBand`: existing app suite passed (1 test, 1 snapshot).
- actionlint 1.7.12: new workflow passed. Tool binary checksum checked against its GitHub release digest.
- ShellCheck and Bash syntax check passed for the signing build wrapper.
- `expo config --type public --json` with test versionCode 1001001 resolved the expected package and versionCode.
- Real `expo prebuild --platform android --no-install` completed. Generated Android Gradle source contained expected applicationId and versionCode 1001001. Generated native files are ignored, not committed.
- Workflow action commit IDs and bundletool 1.18.3 digest were retrieved from upstream live GitHub metadata. No action or bundletool execution in this report implies a real signed native build.
- Two bounded, tool-disabled independent Claude packet reviews completed successfully with no blocking findings. The second review explicitly checked the finalized artifact-hash handoff, readback, ref/version policy and Gradle lifecycle design. Nonblocking improvements applied: build-output-pinned artifact identity for failed-job reruns, separate expected SHA256 job output, exact Play bundle hash comparison, cleanup error preservation, explicit build-only summary, mandatory external environment/tag protections, generated-file ignore rules, base64 whitespace handling and correct draft replacement caveats. These last small changes were locally rechecked, not claimed as another full independent review.
- `git diff --check`: passed before commit.

## Not executed / enablement gates

No native `bundleRelease`/signing execution, actual bundletool validation, Google authentication, Play edit/upload/readback, device test, SDK upgrade, release tag, workflow dispatch, secret/environment/branch-policy change or merge was performed. Those require the actual signing/API setup and explicit release authority. ARM local Expo prebuild success is not an x86_64 release build. Current API-34 native baseline remains intentionally rejected by the API-36 upload guard.

The repository application test coverage is currently very small; this patch does not claim to remedy pre-existing listening/player/runtime gaps. SDK migration and release/device readiness require their own reviewed work.
