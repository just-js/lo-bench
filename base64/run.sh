#!/bin/bash
OS=$(uname -s)
uname -a
if [[ $OS == 'Darwin' ]]; then
  sysctl -a | grep machdep.cpu | grep brand_string | cut -c 27-
  system_profiler SPMemoryDataType  
else
  cat /proc/cpuinfo | grep "model name" | head -n 1 | cut -c 14-
  dmidecode --type 17
fi
echo bun $(bun --version)
echo lo $(lo --version)
echo deno $(deno --version | head -n 1)
echo node $(node --version)
deno run -A --unstable-ffi base64.mjs | tee -a results.txt
bun base64.mjs | tee -a results.txt
node base64.mjs | tee -a results.txt
lo base64-lo.js | tee -a results.txt
node results.mjs results.txt
