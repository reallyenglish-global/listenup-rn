# Web release and browser E2E

The **Web release** workflow builds Expo's production static export, runs Playwright
against that exact `dist/` directory, and only then uploads a release bundle.
It runs on pull requests and main pushes; it does not deploy a website, change
mobile store releases, or require signing/cloud credentials.

## Local verification

```sh
mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm exec playwright install chromium
mise exec -- pnpm build:web
mise exec -- pnpm test:e2e:web
```

Python 3 serves the export on loopback port 4173. A locally installed Chromium can
be selected with `CHROMIUM_PATH=/path/to/chromium`. CI uses Playwright's pinned browser.
Desktop Chromium and a Pixel 7-sized Chromium viewport both test:

- All ten listening/challenge/transcript stages and final completion.
- Actual bundled audio playback and media loading without HTTP errors.
- A failed challenge followed by a successful retry of the same stage.
- Progress surviving reload and corrupt/out-of-range storage falling back safely.

Mobile viewport coverage is **not** Android native or real-device/Safari coverage.

## Release artifact

Download `listenup-web-<sha>-<run>-<attempt>` from a successful workflow run.
PR artifacts attest the tested merge commit, not the unmerged branch commit.
For release candidates use a successful main run. It contains:

- `listenup-web.tar.gz`: the tested static site, plus `release.json` provenance.
- `release.json`: source SHA, workflow run ID and attempt.
- `SHA256SUMS`: hashes for the archive and provenance file.

```sh
sha256sum -c SHA256SUMS
mkdir site
tar -xzf listenup-web.tar.gz -C site
python3 -m http.server 4173 --bind 127.0.0.1 --directory site
```

Artifacts expire after 30 days; browser evidence after 14 days. To preserve a
candidate, dispatch **Web release** on **main** with `draft_release=true`. After
build and E2E pass it creates a uniquely tagged **draft GitHub release**, attaches
the verified archive/checksums/provenance, and targets that exact main SHA. This is
opt-in; regular main pushes do not publish releases. Non-main dispatches build and
test only; the draft-publication job is skipped.

## Hosting is a separate approval

No hosting destination is configured by this change. Publishing the draft or
uploading to a public host requires separate approval, including bundled content
rights review. Serve the extracted site at the origin root; subpath deployment
requires an Expo base-path build and matching E2E coverage. Use HTTPS for remote
hosting. Keep the previous release archive for rollback; deploy the whole site
atomically, never mix hashed assets from different releases. Browser progress
is local to the origin; moving domains does not migrate it.
