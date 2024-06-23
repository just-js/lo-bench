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

## setup on macos

```shell
## install lo
git clone https://github.com/just-js/lo-bench.git
cd lo-bench/base64
export LO_VERSION=0.0.17-pre
curl -L -o ${LO_VERSION}.tar.gz https://github.com/just-js/lo/archive/refs/tags/${LO_VERSION}.tar.gz
tar -xf ${LO_VERSION}.tar.gz
rm -fr ${HOME}/.lo
mv lo-${LO_VERSION} ${HOME}/.lo
rm ${LO_VERSION}.tar.gz
curl -L -o lo-mac-arm64.gz https://github.com/just-js/lo/releases/download/${LO_VERSION}/lo-mac-arm64.gz
gunzip lo-mac-arm64.gz
mv lo-mac-arm64 lo
chmod +x lo
./lo install
## install node
curl -L -o nodejs.tar.gz https://nodejs.org/dist/v22.3.0/node-v22.3.0-darwin-arm64.tar.gz
tar -xvf nodejs.tar.gz
rm -fr ${HOME}/.node
mv node-v22.3.0-darwin-arm64 ${HOME}/.node
rm nodejs.tar.gz
## install bun
curl -fsSL https://bun.sh/install | bash
## install deno
curl -fsSL https://deno.land/install.sh | bash
```

## build the docker image on linux

```shell
docker build -t base64-bench .
```

## run a shell in the docker container in the current directory

```shell
docker run -it --rm -v $(pwd):/bench --privileged base64-bench /bin/bash
```

## prepare the runtimes for the bench

** Note **: on linux, run the following commands inside the docker container shell

```shell
lo build binding simdtext
```

## run the bench

```shell
./run.sh
```

## results

## mac mini m1

```shell
Darwin 4d940e2e-416a-4718-9612-30679a7cf36d 22.6.0 Darwin Kernel Version 22.6.0: Wed Jul  5 22:22:52 PDT 2023; root:xnu-8796.141.3~6/RELEASE_ARM64_T8103 arm64
Apple M1
Memory:

      Memory: 8 GB
      Type: LPDDR4
      Manufacturer: Hynix

bun 1.1.16
lo 0.0.17-pre
deno deno 1.44.4 (release, aarch64-apple-darwin)
node v22.3.0
```

```shell
node v bun (Buffer.from)

32           ops/sec/core thru/core    ratio 
node             11875219   380.00 MBps   1.39 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun               8502727   272.08 MBps   0.71 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
512          ops/sec/core thru/core    ratio 
node              5944427     3.04 GBps   1.22 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun               4847825     2.48 GBps   0.81 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
65536        ops/sec/core thru/core    ratio 
node                47453     3.10 GBps   0.49 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                 96664     6.33 GBps   2.03 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
524288       ops/sec/core thru/core    ratio 
node                 5440     2.85 GBps   0.43 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                 12431     6.51 GBps   2.28 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
8388608      ops/sec/core thru/core    ratio 
node                  242     2.03 GBps    0.3 🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                   800     6.71 GBps    3.3 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡


node v deno (Buffer.from)

32           ops/sec/core thru/core    ratio 
node             11875219   380.00 MBps   8.56 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno              1387117    44.38 MBps   0.11 🟣🟣🟣
512          ops/sec/core thru/core    ratio 
node              5944427     3.04 GBps   9.37 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               633916   324.56 MBps    0.1 🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
node                47453     3.10 GBps   4.23 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                11210   734.65 MBps   0.23 🟣🟣🟣🟣🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
node                 5440     2.85 GBps   4.05 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                 1341   703.07 MBps   0.24 🟣🟣🟣🟣🟣🟣🟣
8388608      ops/sec/core thru/core    ratio 
node                  242     2.03 GBps   3.22 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                   75   629.14 MBps    0.3 🟣🟣🟣🟣🟣🟣🟣🟣🟣


bun v deno (Buffer.from)

32           ops/sec/core thru/core    ratio 
bun               8502727   272.08 MBps   6.12 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno              1387117    44.38 MBps   0.16 🟣🟣🟣🟣
512          ops/sec/core thru/core    ratio 
bun               4847825     2.48 GBps   7.64 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno               633916   324.56 MBps   0.13 🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
bun                 96664     6.33 GBps   8.62 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                11210   734.65 MBps   0.11 🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
bun                 12431     6.51 GBps   9.26 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                 1341   703.07 MBps    0.1 🟣🟣🟣
8388608      ops/sec/core thru/core    ratio 
bun                   800     6.71 GBps  10.66 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                   75   629.14 MBps   0.09 🟣🟣


node v bun (Buffer.write)

32           ops/sec/core thru/core    ratio 
node             15630773   500.18 MBps   0.53 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun              29084759   930.71 MBps   1.86 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
512          ops/sec/core thru/core    ratio 
node              7725187     3.95 GBps   0.67 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun              11372877     5.82 GBps   1.47 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
65536        ops/sec/core thru/core    ratio 
node               111212     7.28 GBps   0.82 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                135388     8.87 GBps   1.21 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
524288       ops/sec/core thru/core    ratio 
node                14009     7.34 GBps   0.82 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                 17042     8.93 GBps   1.21 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
8388608      ops/sec/core thru/core    ratio 
node                 1179     9.89 GBps   1.11 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                  1059     8.88 GBps   0.89 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡


node v deno (Buffer.write)

32           ops/sec/core thru/core    ratio 
node             15630773   500.18 MBps   7.16 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno              2180079    69.76 MBps   0.13 🟣🟣🟣🟣
512          ops/sec/core thru/core    ratio 
node              7725187     3.95 GBps   9.32 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               828123   423.99 MBps    0.1 🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
node               111212     7.28 GBps   9.79 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                11358   744.35 MBps    0.1 🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
node                14009     7.34 GBps  10.33 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                 1355   710.41 MBps   0.09 🟣🟣
8388608      ops/sec/core thru/core    ratio 
node                 1179     9.89 GBps  14.73 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                   80   671.08 MBps   0.06 🟣🟣


node v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
node             15630773   500.18 MBps   0.37 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo               41545704     1.32 GBps   2.65 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
512          ops/sec/core thru/core    ratio 
node              7725187     3.95 GBps   0.69 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo               11128787     5.69 GBps   1.44 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
65536        ops/sec/core thru/core    ratio 
node               111212     7.28 GBps   0.92 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                 119593     7.83 GBps   1.07 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
524288       ops/sec/core thru/core    ratio 
node                14009     7.34 GBps   0.93 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                  15008     7.86 GBps   1.07 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
8388608      ops/sec/core thru/core    ratio 
node                 1179     9.89 GBps   1.27 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                    928     7.78 GBps   0.78 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠


bun v deno (Buffer.write)

32           ops/sec/core thru/core    ratio 
bun              29084759   930.71 MBps  13.34 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno              2180079    69.76 MBps   0.07 🟣🟣
512          ops/sec/core thru/core    ratio 
bun              11372877     5.82 GBps  13.73 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno               828123   423.99 MBps   0.07 🟣🟣
65536        ops/sec/core thru/core    ratio 
bun                135388     8.87 GBps  11.92 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                11358   744.35 MBps   0.08 🟣🟣
524288       ops/sec/core thru/core    ratio 
bun                 17042     8.93 GBps  12.57 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                 1355   710.41 MBps   0.07 🟣🟣
8388608      ops/sec/core thru/core    ratio 
bun                  1059     8.88 GBps  13.23 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                   80   671.08 MBps   0.07 🟣🟣


bun v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
bun              29084759   930.71 MBps    0.7 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo               41545704     1.32 GBps   1.42 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
512          ops/sec/core thru/core    ratio 
bun              11372877     5.82 GBps   1.02 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo               11128787     5.69 GBps   0.97 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
65536        ops/sec/core thru/core    ratio 
bun                135388     8.87 GBps   1.13 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo                 119593     7.83 GBps   0.88 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
524288       ops/sec/core thru/core    ratio 
bun                 17042     8.93 GBps   1.13 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo                  15008     7.86 GBps   0.88 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
8388608      ops/sec/core thru/core    ratio 
bun                  1059     8.88 GBps   1.14 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo                    928     7.78 GBps   0.87 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠


deno v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
deno              2180079    69.76 MBps   0.05 🟣
lo               41545704     1.32 GBps  19.05 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
512          ops/sec/core thru/core    ratio 
deno               828123   423.99 MBps   0.07 🟣🟣
lo               11128787     5.69 GBps  13.43 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
65536        ops/sec/core thru/core    ratio 
deno                11358   744.35 MBps   0.09 🟣🟣
lo                 119593     7.83 GBps  10.52 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
524288       ops/sec/core thru/core    ratio 
deno                 1355   710.41 MBps   0.09 🟣🟣
lo                  15008     7.86 GBps  11.07 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
8388608      ops/sec/core thru/core    ratio 
deno                   80   671.08 MBps   0.08 🟣🟣
lo                    928     7.78 GBps   11.6 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠


Base64 Decoding Throughput Rankings

runtime  name         size     thru          ratio   

node     Buffer.write 8388608      9.89 GBps 100.00 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun      Buffer.write 524288       8.93 GBps  90.35 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.write 8388608      8.88 GBps  89.83 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.write 65536        8.87 GBps  89.72 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo       Buffer.write 524288       7.86 GBps  79.56 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
lo       Buffer.write 65536        7.83 GBps  79.25 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
lo       Buffer.write 8388608      7.78 GBps  78.72 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
node     Buffer.write 524288       7.34 GBps  74.27 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.write 65536        7.28 GBps  73.70 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun      Buffer.from  8388608      6.71 GBps  67.86 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.from  524288       6.51 GBps  65.90 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.from  65536        6.33 GBps  64.06 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.write 512          5.82 GBps  58.88 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo       Buffer.write 512          5.69 GBps  57.62 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
node     Buffer.write 512          3.95 GBps  40.00 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  65536        3.10 GBps  31.45 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  512          3.04 GBps  30.78 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  524288       2.85 GBps  28.84 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun      Buffer.from  512          2.48 GBps  25.10 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
node     Buffer.from  8388608      2.03 GBps  20.53 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo       Buffer.write 32           1.32 GBps  13.45 % 🟠🟠🟠🟠🟠🟠🟠
bun      Buffer.write 32         930.71 MBps   9.42 % 🟡🟡🟡🟡🟡
deno     Buffer.write 65536      744.35 MBps   7.53 % 🟣🟣🟣🟣
deno     Buffer.from  65536      734.65 MBps   7.43 % 🟣🟣🟣🟣
deno     Buffer.write 524288     710.41 MBps   7.19 % 🟣🟣🟣🟣
deno     Buffer.from  524288     703.07 MBps   7.11 % 🟣🟣🟣🟣
deno     Buffer.write 8388608    671.08 MBps   6.79 % 🟣🟣🟣🟣
deno     Buffer.from  8388608    629.14 MBps   6.37 % 🟣🟣🟣🟣
node     Buffer.write 32         500.18 MBps   5.06 % 🟢🟢🟢
deno     Buffer.write 512        423.99 MBps   4.29 % 🟣🟣🟣
node     Buffer.from  32         380.00 MBps   3.85 % 🟢🟢
deno     Buffer.from  512        324.56 MBps   3.29 % 🟣🟣
bun      Buffer.from  32         272.08 MBps   2.76 % 🟡🟡
deno     Buffer.write 32          69.76 MBps   0.71 % 🟣
deno     Buffer.from  32          44.38 MBps   0.45 % 🟣
```

## Linux Core i5, 8th Generation

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
node              5475231   175.20 MBps   1.75 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun               3114022    99.64 MBps   0.56 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
512          ops/sec/core thru/core    ratio 
node              2850965     1.45 GBps   1.34 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun               2121759     1.08 GBps   0.74 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
65536        ops/sec/core thru/core    ratio 
node                32914     2.15 GBps   0.46 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                 70462     4.61 GBps   2.14 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
524288       ops/sec/core thru/core    ratio 
node                 2531     1.32 GBps   0.28 🟢🟢🟢🟢🟢🟢🟢🟢
bun                  8859     4.64 GBps    3.5 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
8388608      ops/sec/core thru/core    ratio 
node                   97   813.69 MBps   0.19 🟢🟢🟢🟢🟢
bun                   495     4.15 GBps    5.1 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡


node v deno (Buffer.from)

32           ops/sec/core thru/core    ratio 
node              5475231   175.20 MBps  11.85 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               461944    14.78 MBps   0.08 🟣🟣
512          ops/sec/core thru/core    ratio 
node              2850965     1.45 GBps  11.88 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               239979   122.86 MBps   0.08 🟣🟣
65536        ops/sec/core thru/core    ratio 
node                32914     2.15 GBps   4.46 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                 7372   483.13 MBps   0.22 🟣🟣🟣🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
node                 2531     1.32 GBps   3.65 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                  693   363.33 MBps   0.27 🟣🟣🟣🟣🟣🟣🟣🟣
8388608      ops/sec/core thru/core    ratio 
node                   97   813.69 MBps   2.36 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                   41   343.93 MBps   0.42 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣


bun v deno (Buffer.from)

32           ops/sec/core thru/core    ratio 
bun               3114022    99.64 MBps   6.74 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno               461944    14.78 MBps   0.14 🟣🟣🟣🟣
512          ops/sec/core thru/core    ratio 
bun               2121759     1.08 GBps   8.84 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno               239979   122.86 MBps   0.11 🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
bun                 70462     4.61 GBps   9.55 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                 7372   483.13 MBps    0.1 🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
bun                  8859     4.64 GBps  12.78 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                  693   363.33 MBps   0.07 🟣🟣
8388608      ops/sec/core thru/core    ratio 
bun                   495     4.15 GBps  12.07 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                   41   343.93 MBps   0.08 🟣🟣


node v bun (Buffer.write)

32           ops/sec/core thru/core    ratio 
node              7421987   237.50 MBps   0.52 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun              14092291   450.95 MBps   1.89 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
512          ops/sec/core thru/core    ratio 
node              4594599     2.35 GBps   0.63 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun               7237117     3.70 GBps   1.57 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
65536        ops/sec/core thru/core    ratio 
node                90823     5.95 GBps   0.74 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                121107     7.93 GBps   1.33 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
524288       ops/sec/core thru/core    ratio 
node                10951     5.74 GBps   0.73 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                 14811     7.76 GBps   1.35 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
8388608      ops/sec/core thru/core    ratio 
node                  747     6.26 GBps      1 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                   745     6.24 GBps   0.99 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡


node v deno (Buffer.write)

32           ops/sec/core thru/core    ratio 
node              7421987   237.50 MBps   9.11 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               814631    26.06 MBps    0.1 🟣🟣🟣
512          ops/sec/core thru/core    ratio 
node              4594599     2.35 GBps  11.73 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               391622   200.51 MBps   0.08 🟣🟣
65536        ops/sec/core thru/core    ratio 
node                90823     5.95 GBps  11.68 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                 7772   509.34 MBps   0.08 🟣🟣
524288       ops/sec/core thru/core    ratio 
node                10951     5.74 GBps  15.51 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                  706   370.14 MBps   0.06 🟣
8388608      ops/sec/core thru/core    ratio 
node                  747     6.26 GBps  18.21 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                   41   343.93 MBps   0.05 🟣


node v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
node              7421987   237.50 MBps   0.62 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo               11855523   379.37 MBps   1.59 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
512          ops/sec/core thru/core    ratio 
node              4594599     2.35 GBps   0.65 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                7059507     3.61 GBps   1.53 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
65536        ops/sec/core thru/core    ratio 
node                90823     5.95 GBps   0.61 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                 148124     9.70 GBps   1.63 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
524288       ops/sec/core thru/core    ratio 
node                10951     5.74 GBps   0.61 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                  17929     9.39 GBps   1.63 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
8388608      ops/sec/core thru/core    ratio 
node                  747     6.26 GBps   0.93 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                    800     6.71 GBps   1.07 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠


bun v deno (Buffer.write)

32           ops/sec/core thru/core    ratio 
bun              14092291   450.95 MBps  17.29 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno               814631    26.06 MBps   0.05 🟣
512          ops/sec/core thru/core    ratio 
bun               7237117     3.70 GBps  18.47 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno               391622   200.51 MBps   0.05 🟣
65536        ops/sec/core thru/core    ratio 
bun                121107     7.93 GBps  15.58 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                 7772   509.34 MBps   0.06 🟣
524288       ops/sec/core thru/core    ratio 
bun                 14811     7.76 GBps  20.97 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                  706   370.14 MBps   0.04 🟣
8388608      ops/sec/core thru/core    ratio 
bun                   745     6.24 GBps  18.17 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                   41   343.93 MBps   0.05 🟣


bun v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
bun              14092291   450.95 MBps   1.18 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo               11855523   379.37 MBps   0.84 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
512          ops/sec/core thru/core    ratio 
bun               7237117     3.70 GBps   1.02 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo                7059507     3.61 GBps   0.97 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
65536        ops/sec/core thru/core    ratio 
bun                121107     7.93 GBps   0.81 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo                 148124     9.70 GBps   1.22 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
524288       ops/sec/core thru/core    ratio 
bun                 14811     7.76 GBps   0.82 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo                  17929     9.39 GBps   1.21 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
8388608      ops/sec/core thru/core    ratio 
bun                   745     6.24 GBps   0.93 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo                    800     6.71 GBps   1.07 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠


deno v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
deno               814631    26.06 MBps   0.06 🟣🟣
lo               11855523   379.37 MBps  14.55 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
512          ops/sec/core thru/core    ratio 
deno               391622   200.51 MBps   0.05 🟣
lo                7059507     3.61 GBps  18.02 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
65536        ops/sec/core thru/core    ratio 
deno                 7772   509.34 MBps   0.05 🟣
lo                 148124     9.70 GBps  19.05 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
524288       ops/sec/core thru/core    ratio 
deno                  706   370.14 MBps   0.03 🟣
lo                  17929     9.39 GBps  25.39 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
8388608      ops/sec/core thru/core    ratio 
deno                   41   343.93 MBps   0.05 🟣
lo                    800     6.71 GBps  19.51 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠


Base64 Decoding Throughput Rankings

runtime  name         size     thru          ratio   

lo       Buffer.write 65536        9.70 GBps 100.00 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
lo       Buffer.write 524288       9.39 GBps  96.84 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
bun      Buffer.write 65536        7.93 GBps  81.77 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.write 524288       7.76 GBps  80.00 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo       Buffer.write 8388608      6.71 GBps  69.14 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
node     Buffer.write 8388608      6.26 GBps  64.56 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun      Buffer.write 8388608      6.24 GBps  64.38 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
node     Buffer.write 65536        5.95 GBps  61.32 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.write 524288       5.74 GBps  59.15 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun      Buffer.from  524288       4.64 GBps  47.85 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.from  65536        4.61 GBps  47.57 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.from  8388608      4.15 GBps  42.78 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.write 512          3.70 GBps  38.18 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo       Buffer.write 512          3.61 GBps  37.24 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
node     Buffer.write 512          2.35 GBps  24.24 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  65536        2.15 GBps  22.23 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  512          1.45 GBps  15.04 % 🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  524288       1.32 GBps  13.67 % 🟢🟢🟢🟢🟢🟢🟢
bun      Buffer.from  512          1.08 GBps  11.20 % 🟡🟡🟡🟡🟡🟡
node     Buffer.from  8388608    813.69 MBps   8.39 % 🟢🟢🟢🟢🟢
deno     Buffer.write 65536      509.34 MBps   5.25 % 🟣🟣🟣
deno     Buffer.from  65536      483.13 MBps   4.98 % 🟣🟣🟣
bun      Buffer.write 32         450.95 MBps   4.65 % 🟡🟡🟡
lo       Buffer.write 32         379.37 MBps   3.91 % 🟠🟠
deno     Buffer.write 524288     370.14 MBps   3.82 % 🟣🟣
deno     Buffer.from  524288     363.33 MBps   3.75 % 🟣🟣
deno     Buffer.from  8388608    343.93 MBps   3.55 % 🟣🟣
deno     Buffer.write 8388608    343.93 MBps   3.55 % 🟣🟣
node     Buffer.write 32         237.50 MBps   2.45 % 🟢🟢
deno     Buffer.write 512        200.51 MBps   2.07 % 🟣🟣
node     Buffer.from  32         175.20 MBps   1.81 % 🟢
deno     Buffer.from  512        122.86 MBps   1.27 % 🟣
bun      Buffer.from  32          99.64 MBps   1.03 % 🟡
deno     Buffer.write 32          26.06 MBps   0.27 % 🟣
deno     Buffer.from  32          14.78 MBps   0.16 % 🟣
```

## Linux Raspberry Pi 3B+

```shell
Linux pi 6.6.28+rpt-rpi-v8 #1 SMP PREEMPT Debian 1:6.6.28-1+rpt1 (2024-04-22) aarch64 GNU/Linux
# dmidecode 3.4
# No SMBIOS nor DMI entry point found, sorry.
bun 1.1.16
lo 0.0.17-pre
deno deno 1.44.4 (release, aarch64-unknown-linux-gnu)
node v22.3.0
```

```shell
node v deno (Buffer.from)

32           ops/sec/core thru/core    ratio 
node               289192     9.25 MBps  12.72 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                22727   727.26 KBps   0.07 🟣🟣
512          ops/sec/core thru/core    ratio 
node               121622    62.27 MBps   9.11 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                13346     6.83 MBps    0.1 🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
node                 1102    72.22 MBps   3.43 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                  321    21.03 MBps   0.29 🟣🟣🟣🟣🟣🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
node                  120    62.91 MBps   3.24 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                36.98    19.38 MBps    0.3 🟣🟣🟣🟣🟣🟣🟣🟣🟣
8388608      ops/sec/core thru/core    ratio 
node                  7.4    62.07 MBps   2.94 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                 2.51    21.05 MBps   0.33 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣


node v deno (Buffer.write)

32           ops/sec/core thru/core    ratio 
node               401738    12.85 MBps   10.1 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                39738     1.27 MBps   0.09 🟣🟣
512          ops/sec/core thru/core    ratio 
node               163658    83.79 MBps   8.19 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                19980    10.22 MBps   0.12 🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
node                 2132   139.72 MBps    6.4 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                  333    21.82 MBps   0.15 🟣🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
node                  236   123.73 MBps   6.22 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                37.89    19.86 MBps   0.16 🟣🟣🟣🟣
8388608      ops/sec/core thru/core    ratio 
node                18.85   158.12 MBps   7.39 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                 2.55    21.39 MBps   0.13 🟣🟣🟣🟣


node v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
node               401738    12.85 MBps   0.53 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                 754813    24.15 MBps   1.87 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
512          ops/sec/core thru/core    ratio 
node               163658    83.79 MBps   0.57 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                 286686   146.78 MBps   1.75 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
65536        ops/sec/core thru/core    ratio 
node                 2132   139.72 MBps   0.57 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                   3707   242.94 MBps   1.73 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
524288       ops/sec/core thru/core    ratio 
node                  236   123.73 MBps   0.52 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                    448   234.88 MBps   1.89 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
8388608      ops/sec/core thru/core    ratio 
node                18.85   158.12 MBps   0.67 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                  27.92   234.20 MBps   1.48 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠


deno v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
deno                39738     1.27 MBps   0.05 🟣
lo                 754813    24.15 MBps  18.99 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
512          ops/sec/core thru/core    ratio 
deno                19980    10.22 MBps   0.06 🟣🟣
lo                 286686   146.78 MBps  14.34 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
65536        ops/sec/core thru/core    ratio 
deno                  333    21.82 MBps   0.08 🟣🟣
lo                   3707   242.94 MBps  11.13 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
524288       ops/sec/core thru/core    ratio 
deno                37.89    19.86 MBps   0.08 🟣🟣
lo                    448   234.88 MBps  11.82 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
8388608      ops/sec/core thru/core    ratio 
deno                 2.55    21.39 MBps   0.09 🟣🟣
lo                  27.92   234.20 MBps  10.94 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠


Base64 Decoding Throughput Rankings

runtime  name         size     thru          ratio   

lo       Buffer.write 65536      242.94 MBps 100.00 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
lo       Buffer.write 524288     234.88 MBps  96.69 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
lo       Buffer.write 8388608    234.20 MBps  96.41 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
node     Buffer.write 8388608    158.12 MBps  65.09 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo       Buffer.write 512        146.78 MBps  60.42 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
node     Buffer.write 65536      139.72 MBps  57.52 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.write 524288     123.73 MBps  50.94 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.write 512         83.79 MBps  34.50 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  65536       72.22 MBps  29.73 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  524288      62.91 MBps  25.90 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  512         62.27 MBps  25.64 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  8388608     62.07 MBps  25.56 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo       Buffer.write 32          24.15 MBps   9.95 % 🟠🟠🟠🟠🟠
deno     Buffer.write 65536       21.82 MBps   8.99 % 🟣🟣🟣🟣🟣
deno     Buffer.write 8388608     21.39 MBps   8.81 % 🟣🟣🟣🟣🟣
deno     Buffer.from  8388608     21.05 MBps   8.67 % 🟣🟣🟣🟣🟣
deno     Buffer.from  65536       21.03 MBps   8.66 % 🟣🟣🟣🟣🟣
deno     Buffer.write 524288      19.86 MBps   8.18 % 🟣🟣🟣🟣🟣
deno     Buffer.from  524288      19.38 MBps   7.99 % 🟣🟣🟣🟣
node     Buffer.write 32          12.85 MBps   5.30 % 🟢🟢🟢
deno     Buffer.write 512         10.22 MBps   4.22 % 🟣🟣🟣
node     Buffer.from  32           9.25 MBps   3.81 % 🟢🟢
deno     Buffer.from  512          6.83 MBps   2.82 % 🟣🟣
deno     Buffer.write 32           1.27 MBps   0.53 % 🟣
deno     Buffer.from  32         727.26 KBps   0.30 % 🟣
```
