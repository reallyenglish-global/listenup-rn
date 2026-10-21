#!/usr/bin/env bash
set -euo pipefail
# Do not enable xtrace: this process receives signing material.
: "${RUNNER_TEMP:?}" "${PLAY_KEYSTORE_BASE64:?}" "${PLAY_STORE_PASSWORD:?}" "${PLAY_KEY_ALIAS:?}" "${PLAY_KEY_PASSWORD:?}" "${PLAY_VERSION_CODE:?}"
export PLAY_KEYSTORE_PATH="$RUNNER_TEMP/listenup-upload.jks"
trap 'rm -f "$PLAY_KEYSTORE_PATH"' EXIT
python3 -c 'import os,base64; from pathlib import Path; p=Path(os.environ["PLAY_KEYSTORE_PATH"]); p.touch(mode=0o600,exist_ok=False); p.write_bytes(base64.b64decode(os.environ["PLAY_KEYSTORE_BASE64"].strip(),validate=True))'
unset PLAY_KEYSTORE_BASE64
(
  cd android
  ./gradlew --no-daemon --no-build-cache -I ../scripts/play-signing.init.gradle \
    "-Dorg.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m" bundleRelease
)
python3 scripts/verify-play-bundle.py
