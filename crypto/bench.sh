#!/bin/bash
ITER=5
RUNS=3000000
TOTAL=3
echo node20
nice -n 20 taskset --cpu-list 0 node crypto/hash-node.mjs $ITER $RUNS $TOTAL
echo node21
nice -n 20 taskset --cpu-list 0 /home/andrew/.node/21/bin/node crypto/hash-node.mjs $ITER $RUNS $TOTAL
echo bun-node
nice -n 20 taskset --cpu-list 0 bun crypto/hash-node.mjs $ITER $RUNS $TOTAL
echo deno-node
nice -n 20 taskset --cpu-list 0 deno run -A crypto/hash-node.mjs $ITER $RUNS $TOTAL
echo bun-native
nice -n 20 taskset --cpu-list 0 bun crypto/hash-bun.js $ITER $RUNS $TOTAL
echo deno-native
nice -n 20 taskset --cpu-list 0 deno run -A crypto/hash-deno.js $ITER $RUNS $TOTAL
echo lo
nice -n 20 taskset --cpu-list 0 lo crypto/hash-lo.js $ITER $RUNS $TOTAL
