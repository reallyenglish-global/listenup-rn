# Android installed-app E2E

## What this tests

The `Essential Android E2E` job in `android-apk.yml` installs the **same release-variant preview APK** produced by `Build preview APK`, after checking its SHA-256. It runs on a hosted API 36 x86_64 emulator without Metro, Play credentials or real learner accounts.

- `.maestro/essential-journey.yaml`: clean launch; bundled audio plays with a genuinely advancing position; pause; wrong answer and retry; correct answers; same-stage transcript and audio; Done advances; process relaunch restores stage 2.
- `.maestro/complete-course.yaml`: correct-answer journey through all ten bundled stages, each corresponding transcript, and final-stage persistence/replay without a nonexistent stage 11.
- `services/__tests__/learner-flow.test.ts`: answer-key immutability, whole-alternative grading, feedback, corrupt local progress recovery, persistence and course boundary.

Answer alternatives and order remain randomized. The flows match the permitted wording alternatives rather than fixed row coordinates. Quiz selection still advances immediately, as in the existing app; these tests do not invent Next/Submit controls or mock a passing grade.

## CI and diagnostics

Open the Android APK check on the PR. The emulator job depends on the build artifact and has only `contents: read`; the existing signing job remains skipped for PRs. New runtime actions are SHA-pinned; Maestro 2.3.0 is downloaded from its versioned release and checksum-verified. The install/verification/test stages propagate failures.

Artifacts:
- `listenup-preview-apk-<workflow SHA>`: `app-release.apk`, `SHA256SUMS` (7 days).
- `listenup-e2e-<workflow SHA>-<attempt>`: JUnit, Maestro command/debug output and screenshots, plus final screenshot/logcat even when the test fails (14 days).

On pull requests the workflow SHA is GitHub's synthetic merge ref; the Actions run also records the exact source PR head. Do not confuse the artifact name with the source commit. Rerun **failed jobs** to reuse the same successful build artifact while it remains available. A changed source commit requires a new build/run; do not pair an older APK with newer flow files and call it exact-head acceptance.

## Local replay (x86_64 Android SDK host)

```bash
pnpm install --frozen-lockfile
bash scripts/build-android-apk.sh
mkdir -p e2e-apk
cp android/app/build/outputs/apk/release/app-release.apk e2e-apk/
# Boot an API 36 emulator, install the pinned Maestro CLI, then:
bash scripts/run-android-e2e.sh
```

The scripts expect a disposable emulator. Each flow clears only this app's local data. Never point them at a personal/production device with valuable progress. Do not upload raw logs/screenshots from a real learner account.

## Boundaries

This is a release-variant **preview**, signed with the generated debug key—not the Play-signed AAB and not a public release candidate. Emulator movement of the native playback clock is not proof of audible sound, headset/Bluetooth routing, interruption handling or background behavior on physical hardware. It does not prove Play install/delivery, 16 KB runtime compatibility, a lower-API device matrix, store declarations, content rights, privacy compliance or accessibility quality.

Before publishing, build a fresh signed AAB from the reviewed/approved commit with an unused Play version code; verify its upload certificate and Play acceptance; install from the internal track and complete the physical-device/audio acceptance checklist in `docs/google-play-release.md` and re-work. A green E2E job authorizes neither merge nor store upload.
