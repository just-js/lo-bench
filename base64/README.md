## Base64 Decoding Benchmark

This benchmark was prompted by [an investigation](https://x.com/lemire/status/1803598132334436415) done by [Daniel Lemire](https://x.com/lemire) into base64 decoding in Bun and node.js.

In order to understand the runtime overhead a little better, I put together this
bench, which looks at the following:

- Bun vs Node.js performance decoding base64 strings into new Buffers using ```Buffer.from```
- Bun vs Node.js performance decoding base64 strings into existing, pre-allocated Buffers using ```Buffer.write```
- Performance of Bun/Node.js Buffer.write to a "close-to-optimal" "zero-overhead" implementation on v8 using lo runtime

## More info

- https://x.com/lemire/status/1803598132334436415
- https://github.com/oven-sh/bun/blob/main/bench/snippets/buffer-base64.mjs
- https://github.com/simdutf/simdutf/blob/master/include/simdutf/implementation.h#L1500
- https://github.com/nodejs/node/blob/d335487e3f39437a5e3cc5a4a07bf253b9d0d505/src/string_bytes.cc#L327
- https://x.com/lemire/status/1804610720706826666
- https://lemire.me/blog/2024/06/22/performance-tip-avoid-unnecessary-copies/

## build the docker image

```shell
docker build -t base64-bench .
```

## run a shell in the docker container in the current directory

```shell
docker run -it --rm -v $(pwd):/bench --privileged base64-bench /bin/bash
```

## prepare the runtimes for the bench

** Note **: run the following commands inside the docker container shell

```shell
lo build binding simdtext
```

## run the bench

```shell
./run.sh
```

## results

```shell
Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz
Linux 85e8e2316ecd 6.5.0-35-generic #35~22.04.1-Ubuntu SMP PREEMPT_DYNAMIC Tue May  7 09:00:52 UTC 2 x86_64 GNU/Linux
# dmidecode 3.4
Getting SMBIOS data from sysfs.
SMBIOS 3.0.0 present.

Handle 0x003C, DMI type 17, 40 bytes
Memory Device
        Array Handle: 0x003B
        Error Information Handle: Not Provided
        Total Width: 64 bits
        Data Width: 64 bits
        Size: 16 GB
        Form Factor: SODIMM
        Set: None
        Locator: DIMM A
        Bank Locator: BANK 0
        Type: DDR4
        Type Detail: Synchronous Unbuffered (Unregistered)
        Speed: 2400 MT/s
        Manufacturer: 859B0000802C
        Serial Number: E2DB3FE1
        Asset Tag: 1A192600
        Part Number: CT16G4SFD824A.M16FE 
        Rank: 2
        Configured Memory Speed: 2400 MT/s
        Minimum Voltage: 1.2 V
        Maximum Voltage: 1.2 V
        Configured Voltage: 1.2 V

Handle 0x003D, DMI type 17, 40 bytes
Memory Device
        Array Handle: 0x003B
        Error Information Handle: Not Provided
        Total Width: 64 bits
        Data Width: 64 bits
        Size: 16 GB
        Form Factor: SODIMM
        Set: None
        Locator: DIMM B
        Bank Locator: BANK 2
        Type: DDR4
        Type Detail: Synchronous Unbuffered (Unregistered)
        Speed: 2400 MT/s
        Manufacturer: 859B0000802C
        Serial Number: E2DB3FDF
        Asset Tag: 1A192600
        Part Number: CT16G4SFD824A.M16FE 
        Rank: 2
        Configured Memory Speed: 2400 MT/s
        Minimum Voltage: 1.2 V
        Maximum Voltage: 1.2 V
        Configured Voltage: 1.2 V

bun 1.1.16
lo 0.0.17-pre
deno deno 1.44.4 (release, x86_64-unknown-linux-gnu)
node v22.2.0
```

```shell
node v bun (Buffer.from)

32           ops/sec/core thru/core    ratio 
node              5232916  167.45 MBps   1.68 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun               3114690   99.67 MBps   0.59 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
512          ops/sec/core thru/core    ratio 
node              2871153    1.47 GBps   1.34 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun               2135410    1.09 GBps   0.74 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
node                33151    2.17 GBps   0.46 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                 71650    4.69 GBps   2.16 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
node                 2135    1.11 GBps   0.23 🟢🟢🟢🟢🟢🟢🟢🟢
bun                  8923    4.67 GBps   4.17 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
8388608      ops/sec/core thru/core    ratio 
node                   85  713.03 MBps   0.17 🟢🟢🟢🟢🟢🟢
bun                   478    4.00 GBps   5.62 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣

node v deno (Buffer.from)

32           ops/sec/core thru/core    ratio 
node              5232916  167.45 MBps  10.62 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               492625   15.76 MBps   0.09 🟣🟣🟣
512          ops/sec/core thru/core    ratio 
node              2871153    1.47 GBps  12.48 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               229898  117.70 MBps   0.08 🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
node                33151    2.17 GBps    4.4 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                 7527  493.28 MBps   0.22 🟣🟣🟣🟣🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
node                 2135    1.11 GBps   3.08 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                  692  362.80 MBps   0.32 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
8388608      ops/sec/core thru/core    ratio 
node                   85  713.03 MBps   2.07 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                   41  343.93 MBps   0.48 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣

bun v deno (Buffer.from)

32           ops/sec/core thru/core    ratio 
bun               3114690   99.67 MBps   6.32 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               492625   15.76 MBps   0.15 🟣🟣🟣🟣🟣
512          ops/sec/core thru/core    ratio 
bun               2135410    1.09 GBps   9.28 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               229898  117.70 MBps    0.1 🟣🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
bun                 71650    4.69 GBps   9.51 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                 7527  493.28 MBps    0.1 🟣🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
bun                  8923    4.67 GBps  12.89 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                  692  362.80 MBps   0.07 🟣🟣🟣
8388608      ops/sec/core thru/core    ratio 
bun                   478    4.00 GBps  11.65 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                   41  343.93 MBps   0.08 🟣🟣🟣

node v bun (Buffer.write)

32           ops/sec/core thru/core    ratio 
node              7373851  235.96 MBps   0.53 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun              13853322  443.30 MBps   1.87 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
512          ops/sec/core thru/core    ratio 
node              4737173    2.42 GBps   0.63 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun               7500168    3.84 GBps   1.58 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
node                94739    6.20 GBps   0.78 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                120009    7.86 GBps   1.26 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
node                11250    5.89 GBps   0.76 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                 14754    7.73 GBps   1.31 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
8388608      ops/sec/core thru/core    ratio 
node                  761    6.38 GBps   1.01 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                   748    6.27 GBps   0.98 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣

node v deno (Buffer.write)

32           ops/sec/core thru/core    ratio 
node              7373851  235.96 MBps   9.06 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               813065   26.01 MBps   0.11 🟣🟣🟣🟣
512          ops/sec/core thru/core    ratio 
node              4737173    2.42 GBps  12.12 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               390645  200.01 MBps   0.08 🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
node                94739    6.20 GBps  12.21 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                 7753  508.10 MBps   0.08 🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
node                11250    5.89 GBps  15.98 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                  704  369.09 MBps   0.06 🟣🟣
8388608      ops/sec/core thru/core    ratio 
node                  761    6.38 GBps  18.56 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                   41  343.93 MBps   0.05 🟣🟣

node v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
node              7373851  235.96 MBps   0.64 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo               11392865  364.57 MBps   1.54 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
512          ops/sec/core thru/core    ratio 
node              4737173    2.42 GBps   0.67 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                7059066    3.61 GBps   1.49 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
node                94739    6.20 GBps   0.62 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                 150641    9.87 GBps   1.59 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
node                11250    5.89 GBps   0.62 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                  17911    9.39 GBps   1.59 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
8388608      ops/sec/core thru/core    ratio 
node                  761    6.38 GBps   0.94 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                    806    6.76 GBps   1.05 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣

bun v deno (Buffer.write)

32           ops/sec/core thru/core    ratio 
bun              13853322  443.30 MBps  17.03 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               813065   26.01 MBps   0.05 🟣🟣
512          ops/sec/core thru/core    ratio 
bun               7500168    3.84 GBps  19.19 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               390645  200.01 MBps   0.05 🟣🟣
65536        ops/sec/core thru/core    ratio 
bun                120009    7.86 GBps  15.47 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                 7753  508.10 MBps   0.06 🟣🟣
524288       ops/sec/core thru/core    ratio 
bun                 14754    7.73 GBps  20.95 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                  704  369.09 MBps   0.04 🟣🟣
8388608      ops/sec/core thru/core    ratio 
bun                   748    6.27 GBps  18.24 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                   41  343.93 MBps   0.05 🟣🟣

bun v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
bun              13853322  443.30 MBps   1.21 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo               11392865  364.57 MBps   0.82 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
512          ops/sec/core thru/core    ratio 
bun               7500168    3.84 GBps   1.06 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                7059066    3.61 GBps   0.94 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
bun                120009    7.86 GBps   0.79 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                 150641    9.87 GBps   1.25 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
bun                 14754    7.73 GBps   0.82 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                  17911    9.39 GBps   1.21 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
8388608      ops/sec/core thru/core    ratio 
bun                   748    6.27 GBps   0.92 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                    806    6.76 GBps   1.07 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣

deno v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
deno               813065   26.01 MBps   0.07 🟢🟢🟢
lo               11392865  364.57 MBps  14.01 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
512          ops/sec/core thru/core    ratio 
deno               390645  200.01 MBps   0.05 🟢🟢
lo                7059066    3.61 GBps  18.07 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
deno                 7753  508.10 MBps   0.05 🟢🟢
lo                 150641    9.87 GBps  19.43 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
deno                  704  369.09 MBps   0.03 🟢🟢
lo                  17911    9.39 GBps  25.44 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
8388608      ops/sec/core thru/core    ratio 
deno                   41  343.93 MBps   0.05 🟢🟢
lo                    806    6.76 GBps  19.65 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
```
