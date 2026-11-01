#!/usr/bin/env bash
set -euo pipefail
mkdir -p e2e-results
trap 'adb logcat -d > e2e-results/logcat.txt 2>&1; adb shell screencap -p /sdcard/e2e.png; adb pull /sdcard/e2e.png e2e-results/final-screen.png || true' EXIT
adb install -r e2e-apk/app-release.apk
adb logcat -c
maestro test .maestro/essential-journey.yaml --format junit --output e2e-results/junit.xml --debug-output e2e-results/debug
