#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://localhost:3333}"

for index in $(seq 1 15); do
  curl -fsS "${base_url}/health" >/dev/null
  curl -fsS "${base_url}/questions/question-${index}" >/dev/null
  sleep 0.2
done

echo "Telemetry generated against ${base_url}"
