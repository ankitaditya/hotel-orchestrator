#!/bin/bash
ARCH=$(uname -m)

if [[ "$ARCH" == "arm64" || "$ARCH" == "aarch64" ]]; then
  export PLATFORM=linux/arm64   # use native arm64 on M1/M2
else
  export PLATFORM=linux/amd64   # default x86 for Intel/AMD
fi

echo "Detected arch: $ARCH"
echo "Building with platform: $PLATFORM"

docker compose up --build -d
