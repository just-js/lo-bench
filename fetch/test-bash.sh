#!/bin/bash
mkdir -p tmp
curl -s -L -o tmp/download.tar.gz https://codeload.github.com/WireGuard/wireguard-tools/tar.gz/master
cd tmp
tar -xf download.tar.gz
rm download.tar.gz
cd ..
