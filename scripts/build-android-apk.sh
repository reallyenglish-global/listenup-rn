#!/usr/bin/env bash
set -euo pipefail

export ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
: "${ANDROID_HOME:?Set ANDROID_HOME or ANDROID_SDK_ROOT to the Android SDK root}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
if [[ "$ANDROID_HOME" != "$ANDROID_SDK_ROOT" ]]; then
  printf 'ANDROID_HOME and ANDROID_SDK_ROOT must point to the same SDK root.\n' >&2
  exit 2
fi

command -v node >/dev/null
command -v pnpm >/dev/null
command -v java >/dev/null
[[ -d "$ANDROID_HOME/platforms/android-34" ]]
[[ -d "$ANDROID_HOME/build-tools/34.0.0" ]]

export NODE_ENV=production
CI=1 pnpm exec expo prebuild --platform android --no-install --clean
(
  cd android
  ./gradlew --no-daemon "-Dorg.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m" assembleRelease
)

apk="android/app/build/outputs/apk/release/app-release.apk"
[[ -s "$apk" ]]
"$ANDROID_HOME/build-tools/34.0.0/apksigner" verify --verbose "$apk"
printf 'APK_PATH=%s/%s\n' "$PWD" "$apk"
