#!/bin/bash
cat /proc/cpuinfo | grep "model name" | head -n 1 | cut -c 14-
uname -a
dmidecode --type 17
echo bun $(bun --version)
echo lo $(lo --version)
echo deno $(deno --version | head -n 1)
echo node $(node --version)
deno run -A base64.mjs | tee -a results.txt
bun base64.mjs | tee -a results.txt
node base64.mjs | tee -a results.txt
lo base64-lo.js | tee -a results.txt
node results.mjs
