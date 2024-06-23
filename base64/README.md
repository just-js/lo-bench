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

node v bun (Buffer.from)

32           ops/sec/core thru/core    ratio 
node             11691128   374.11 MBps   1.37 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun               8532581   273.04 MBps   0.72 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
512          ops/sec/core thru/core    ratio 
node              5944475     3.04 GBps   1.21 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun               4892753     2.50 GBps   0.82 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
65536        ops/sec/core thru/core    ratio 
node                48045     3.14 GBps   0.49 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                 96871     6.34 GBps   2.01 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
524288       ops/sec/core thru/core    ratio 
node                 5468     2.86 GBps   0.44 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                 12376     6.48 GBps   2.26 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
8388608      ops/sec/core thru/core    ratio 
node                  240     2.01 GBps   0.29 🟢🟢🟢🟢🟢🟢🟢🟢
bun                   803     6.73 GBps   3.34 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡


node v deno (Buffer.from)

32           ops/sec/core thru/core    ratio 
node             11691128   374.11 MBps   8.53 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno              1369988    43.83 MBps   0.11 🟣🟣🟣
512          ops/sec/core thru/core    ratio 
node              5944475     3.04 GBps   9.31 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               638388   326.85 MBps    0.1 🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
node                48045     3.14 GBps   4.15 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                11571   758.31 MBps   0.24 🟣🟣🟣🟣🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
node                 5468     2.86 GBps   4.03 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                 1354   709.88 MBps   0.24 🟣🟣🟣🟣🟣🟣🟣
8388608      ops/sec/core thru/core    ratio 
node                  240     2.01 GBps   3.15 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                   76   637.53 MBps   0.31 🟣🟣🟣🟣🟣🟣🟣🟣🟣


bun v deno (Buffer.from)

32           ops/sec/core thru/core    ratio 
bun               8532581   273.04 MBps   6.22 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno              1369988    43.83 MBps   0.16 🟣🟣🟣🟣
512          ops/sec/core thru/core    ratio 
bun               4892753     2.50 GBps   7.66 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno               638388   326.85 MBps   0.13 🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
bun                 96871     6.34 GBps   8.37 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                11571   758.31 MBps   0.11 🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
bun                 12376     6.48 GBps   9.14 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                 1354   709.88 MBps    0.1 🟣🟣🟣
8388608      ops/sec/core thru/core    ratio 
bun                   803     6.73 GBps  10.56 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                   76   637.53 MBps   0.09 🟣🟣


node v bun (Buffer.write)

32           ops/sec/core thru/core    ratio 
node             15442799   494.16 MBps   0.53 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun              28978115   927.29 MBps   1.87 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
512          ops/sec/core thru/core    ratio 
node              7732130     3.95 GBps   0.65 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun              11782157     6.03 GBps   1.52 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
65536        ops/sec/core thru/core    ratio 
node               110422     7.23 GBps   0.81 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                135523     8.88 GBps   1.22 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
524288       ops/sec/core thru/core    ratio 
node                14011     7.34 GBps   0.82 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                 17050     8.93 GBps   1.21 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
8388608      ops/sec/core thru/core    ratio 
node                 1181     9.90 GBps   1.11 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                  1061     8.90 GBps   0.89 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡


node v deno (Buffer.write)

32           ops/sec/core thru/core    ratio 
node             15442799   494.16 MBps    7.1 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno              2173987    69.56 MBps   0.14 🟣🟣🟣🟣
512          ops/sec/core thru/core    ratio 
node              7732130     3.95 GBps   9.19 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               840456   430.31 MBps    0.1 🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
node               110422     7.23 GBps   9.55 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                11562   757.72 MBps    0.1 🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
node                14011     7.34 GBps  10.35 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                 1353   709.36 MBps   0.09 🟣🟣
8388608      ops/sec/core thru/core    ratio 
node                 1181     9.90 GBps  14.76 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                   80   671.08 MBps   0.06 🟣🟣


node v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
node             15442799   494.16 MBps   0.39 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo               39133820     1.25 GBps   2.53 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
512          ops/sec/core thru/core    ratio 
node              7732130     3.95 GBps   0.68 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo               11268736     5.76 GBps   1.45 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
65536        ops/sec/core thru/core    ratio 
node               110422     7.23 GBps   0.92 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                 119610     7.83 GBps   1.08 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
524288       ops/sec/core thru/core    ratio 
node                14011     7.34 GBps   0.93 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                  15001     7.86 GBps   1.07 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
8388608      ops/sec/core thru/core    ratio 
node                 1181     9.90 GBps   1.26 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                    930     7.80 GBps   0.78 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠


bun v deno (Buffer.write)

32           ops/sec/core thru/core    ratio 
bun              28978115   927.29 MBps  13.32 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno              2173987    69.56 MBps   0.07 🟣🟣
512          ops/sec/core thru/core    ratio 
bun              11782157     6.03 GBps  14.01 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno               840456   430.31 MBps   0.07 🟣🟣
65536        ops/sec/core thru/core    ratio 
bun                135523     8.88 GBps  11.72 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                11562   757.72 MBps   0.08 🟣🟣
524288       ops/sec/core thru/core    ratio 
bun                 17050     8.93 GBps   12.6 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                 1353   709.36 MBps   0.07 🟣🟣
8388608      ops/sec/core thru/core    ratio 
bun                  1061     8.90 GBps  13.26 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                   80   671.08 MBps   0.07 🟣🟣


bun v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
bun              28978115   927.29 MBps   0.74 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo               39133820     1.25 GBps   1.35 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
512          ops/sec/core thru/core    ratio 
bun              11782157     6.03 GBps   1.04 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo               11268736     5.76 GBps   0.95 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
65536        ops/sec/core thru/core    ratio 
bun                135523     8.88 GBps   1.13 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo                 119610     7.83 GBps   0.88 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
524288       ops/sec/core thru/core    ratio 
bun                 17050     8.93 GBps   1.13 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo                  15001     7.86 GBps   0.87 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
8388608      ops/sec/core thru/core    ratio 
bun                  1061     8.90 GBps   1.14 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo                    930     7.80 GBps   0.87 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠


deno v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
deno              2173987    69.56 MBps   0.05 🟣
lo               39133820     1.25 GBps     18 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
512          ops/sec/core thru/core    ratio 
deno               840456   430.31 MBps   0.07 🟣🟣
lo               11268736     5.76 GBps   13.4 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
65536        ops/sec/core thru/core    ratio 
deno                11562   757.72 MBps   0.09 🟣🟣
lo                 119610     7.83 GBps  10.34 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
524288       ops/sec/core thru/core    ratio 
deno                 1353   709.36 MBps   0.09 🟣🟣
lo                  15001     7.86 GBps  11.08 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
8388608      ops/sec/core thru/core    ratio 
deno                   80   671.08 MBps   0.08 🟣🟣
lo                    930     7.80 GBps  11.62 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠


Throughput Rankings

runtime  name         size     thru          ratio   

node     Buffer.write 8388608      9.90 GBps 100.00 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun      Buffer.write 524288       8.93 GBps  90.23 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.write 8388608      8.90 GBps  89.83 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.write 65536        8.88 GBps  89.65 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo       Buffer.write 524288       7.86 GBps  79.38 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
lo       Buffer.write 65536        7.83 GBps  79.12 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
lo       Buffer.write 8388608      7.80 GBps  78.74 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
node     Buffer.write 524288       7.34 GBps  74.14 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.write 65536        7.23 GBps  73.04 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun      Buffer.from  8388608      6.73 GBps  67.99 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.from  524288       6.48 GBps  65.49 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.from  65536        6.34 GBps  64.08 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.write 512          6.03 GBps  60.89 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo       Buffer.write 512          5.76 GBps  58.23 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
node     Buffer.write 512          3.95 GBps  39.96 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  65536        3.14 GBps  31.78 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  512          3.04 GBps  30.72 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  524288       2.86 GBps  28.93 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun      Buffer.from  512          2.50 GBps  25.28 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
node     Buffer.from  8388608      2.01 GBps  20.32 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo       Buffer.write 32           1.25 GBps  12.64 % 🟠🟠🟠🟠🟠🟠🟠
bun      Buffer.write 32         927.29 MBps   9.36 % 🟡🟡🟡🟡🟡
deno     Buffer.from  65536      758.31 MBps   7.65 % 🟣🟣🟣🟣
deno     Buffer.write 65536      757.72 MBps   7.64 % 🟣🟣🟣🟣
deno     Buffer.from  524288     709.88 MBps   7.16 % 🟣🟣🟣🟣
deno     Buffer.write 524288     709.36 MBps   7.16 % 🟣🟣🟣🟣
deno     Buffer.write 8388608    671.08 MBps   6.77 % 🟣🟣🟣🟣
deno     Buffer.from  8388608    637.53 MBps   6.43 % 🟣🟣🟣🟣
node     Buffer.write 32         494.16 MBps   4.98 % 🟢🟢🟢
deno     Buffer.write 512        430.31 MBps   4.34 % 🟣🟣🟣
node     Buffer.from  32         374.11 MBps   3.77 % 🟢🟢
deno     Buffer.from  512        326.85 MBps   3.29 % 🟣🟣
bun      Buffer.from  32         273.04 MBps   2.75 % 🟡🟡
deno     Buffer.write 32          69.56 MBps   0.70 % 🟣
deno     Buffer.from  32          43.83 MBps   0.44 % 🟣

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
node              5232916   167.45 MBps   1.68 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun               3114690    99.67 MBps   0.59 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
512          ops/sec/core thru/core    ratio 
node              2871153     1.47 GBps   1.34 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun               2135410     1.09 GBps   0.74 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
65536        ops/sec/core thru/core    ratio 
node                33151     2.17 GBps   0.46 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                 71650     4.69 GBps   2.16 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
524288       ops/sec/core thru/core    ratio 
node                 2135     1.11 GBps   0.23 🟢🟢🟢🟢🟢🟢🟢
bun                  8923     4.67 GBps   4.17 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
8388608      ops/sec/core thru/core    ratio 
node                   85   713.03 MBps   0.17 🟢🟢🟢🟢🟢
bun                   478     4.00 GBps   5.62 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡


node v deno (Buffer.from)

32           ops/sec/core thru/core    ratio 
node              5232916   167.45 MBps  10.62 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               492625    15.76 MBps   0.09 🟣🟣
512          ops/sec/core thru/core    ratio 
node              2871153     1.47 GBps  12.48 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               229898   117.70 MBps   0.08 🟣🟣
65536        ops/sec/core thru/core    ratio 
node                33151     2.17 GBps    4.4 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                 7527   493.28 MBps   0.22 🟣🟣🟣🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
node                 2135     1.11 GBps   3.08 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                  692   362.80 MBps   0.32 🟣🟣🟣🟣🟣🟣🟣🟣🟣
8388608      ops/sec/core thru/core    ratio 
node                   85   713.03 MBps   2.07 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                   41   343.93 MBps   0.48 🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣


bun v deno (Buffer.from)

32           ops/sec/core thru/core    ratio 
bun               3114690    99.67 MBps   6.32 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno               492625    15.76 MBps   0.15 🟣🟣🟣🟣
512          ops/sec/core thru/core    ratio 
bun               2135410     1.09 GBps   9.28 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno               229898   117.70 MBps    0.1 🟣🟣🟣
65536        ops/sec/core thru/core    ratio 
bun                 71650     4.69 GBps   9.51 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                 7527   493.28 MBps    0.1 🟣🟣🟣
524288       ops/sec/core thru/core    ratio 
bun                  8923     4.67 GBps  12.89 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                  692   362.80 MBps   0.07 🟣🟣
8388608      ops/sec/core thru/core    ratio 
bun                   478     4.00 GBps  11.65 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                   41   343.93 MBps   0.08 🟣🟣


node v bun (Buffer.write)

32           ops/sec/core thru/core    ratio 
node              7373851   235.96 MBps   0.53 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun              13853322   443.30 MBps   1.87 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
512          ops/sec/core thru/core    ratio 
node              4737173     2.42 GBps   0.63 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun               7500168     3.84 GBps   1.58 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
65536        ops/sec/core thru/core    ratio 
node                94739     6.20 GBps   0.78 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                120009     7.86 GBps   1.26 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
524288       ops/sec/core thru/core    ratio 
node                11250     5.89 GBps   0.76 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                 14754     7.73 GBps   1.31 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
8388608      ops/sec/core thru/core    ratio 
node                  761     6.38 GBps   1.01 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun                   748     6.27 GBps   0.98 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡


node v deno (Buffer.write)

32           ops/sec/core thru/core    ratio 
node              7373851   235.96 MBps   9.06 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               813065    26.01 MBps   0.11 🟣🟣🟣
512          ops/sec/core thru/core    ratio 
node              4737173     2.42 GBps  12.12 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno               390645   200.01 MBps   0.08 🟣🟣
65536        ops/sec/core thru/core    ratio 
node                94739     6.20 GBps  12.21 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                 7753   508.10 MBps   0.08 🟣🟣
524288       ops/sec/core thru/core    ratio 
node                11250     5.89 GBps  15.98 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                  704   369.09 MBps   0.06 🟣
8388608      ops/sec/core thru/core    ratio 
node                  761     6.38 GBps  18.56 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
deno                   41   343.93 MBps   0.05 🟣


node v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
node              7373851   235.96 MBps   0.64 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo               11392865   364.57 MBps   1.54 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
512          ops/sec/core thru/core    ratio 
node              4737173     2.42 GBps   0.67 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                7059066     3.61 GBps   1.49 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
65536        ops/sec/core thru/core    ratio 
node                94739     6.20 GBps   0.62 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                 150641     9.87 GBps   1.59 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
524288       ops/sec/core thru/core    ratio 
node                11250     5.89 GBps   0.62 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                  17911     9.39 GBps   1.59 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
8388608      ops/sec/core thru/core    ratio 
node                  761     6.38 GBps   0.94 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
lo                    806     6.76 GBps   1.05 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠


bun v deno (Buffer.write)

32           ops/sec/core thru/core    ratio 
bun              13853322   443.30 MBps  17.03 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno               813065    26.01 MBps   0.05 🟣
512          ops/sec/core thru/core    ratio 
bun               7500168     3.84 GBps  19.19 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno               390645   200.01 MBps   0.05 🟣
65536        ops/sec/core thru/core    ratio 
bun                120009     7.86 GBps  15.47 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                 7753   508.10 MBps   0.06 🟣
524288       ops/sec/core thru/core    ratio 
bun                 14754     7.73 GBps  20.95 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                  704   369.09 MBps   0.04 🟣
8388608      ops/sec/core thru/core    ratio 
bun                   748     6.27 GBps  18.24 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
deno                   41   343.93 MBps   0.05 🟣


bun v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
bun              13853322   443.30 MBps   1.21 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo               11392865   364.57 MBps   0.82 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
512          ops/sec/core thru/core    ratio 
bun               7500168     3.84 GBps   1.06 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo                7059066     3.61 GBps   0.94 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
65536        ops/sec/core thru/core    ratio 
bun                120009     7.86 GBps   0.79 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo                 150641     9.87 GBps   1.25 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
524288       ops/sec/core thru/core    ratio 
bun                 14754     7.73 GBps   0.82 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo                  17911     9.39 GBps   1.21 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
8388608      ops/sec/core thru/core    ratio 
bun                   748     6.27 GBps   0.92 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo                    806     6.76 GBps   1.07 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠


deno v lo (Buffer.write)

32           ops/sec/core thru/core    ratio 
deno               813065    26.01 MBps   0.07 🟣🟣
lo               11392865   364.57 MBps  14.01 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
512          ops/sec/core thru/core    ratio 
deno               390645   200.01 MBps   0.05 🟣
lo                7059066     3.61 GBps  18.07 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
65536        ops/sec/core thru/core    ratio 
deno                 7753   508.10 MBps   0.05 🟣
lo                 150641     9.87 GBps  19.43 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
524288       ops/sec/core thru/core    ratio 
deno                  704   369.09 MBps   0.03 🟣
lo                  17911     9.39 GBps  25.44 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
8388608      ops/sec/core thru/core    ratio 
deno                   41   343.93 MBps   0.05 🟣
lo                    806     6.76 GBps  19.65 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠


Base64 Decoding Throughput Rankings

runtime  name         size     thru          ratio   

lo       Buffer.write 65536        9.87 GBps 100.00 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
lo       Buffer.write 524288       9.39 GBps  95.11 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
bun      Buffer.write 65536        7.86 GBps  79.66 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.write 524288       7.73 GBps  78.35 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo       Buffer.write 8388608      6.76 GBps  68.48 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
node     Buffer.write 8388608      6.38 GBps  64.66 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun      Buffer.write 8388608      6.27 GBps  63.55 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
node     Buffer.write 65536        6.20 GBps  62.89 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.write 524288       5.89 GBps  59.74 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
bun      Buffer.from  65536        4.69 GBps  47.56 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.from  524288       4.67 GBps  47.38 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.from  8388608      4.00 GBps  40.61 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
bun      Buffer.write 512          3.84 GBps  38.89 % 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
lo       Buffer.write 512          3.61 GBps  36.60 % 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
node     Buffer.write 512          2.42 GBps  24.56 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  65536        2.17 GBps  22.00 % 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  512          1.47 GBps  14.89 % 🟢🟢🟢🟢🟢🟢🟢🟢
node     Buffer.from  524288       1.11 GBps  11.33 % 🟢🟢🟢🟢🟢🟢
bun      Buffer.from  512          1.09 GBps  11.07 % 🟡🟡🟡🟡🟡🟡
node     Buffer.from  8388608    713.03 MBps   7.22 % 🟢🟢🟢🟢
deno     Buffer.write 65536      508.10 MBps   5.14 % 🟣🟣🟣
deno     Buffer.from  65536      493.28 MBps   4.99 % 🟣🟣🟣
bun      Buffer.write 32         443.30 MBps   4.49 % 🟡🟡🟡
deno     Buffer.write 524288     369.09 MBps   3.73 % 🟣🟣
lo       Buffer.write 32         364.57 MBps   3.69 % 🟠🟠
deno     Buffer.from  524288     362.80 MBps   3.67 % 🟣🟣
deno     Buffer.from  8388608    343.93 MBps   3.48 % 🟣🟣
deno     Buffer.write 8388608    343.93 MBps   3.48 % 🟣🟣
node     Buffer.write 32         235.96 MBps   2.39 % 🟢🟢
deno     Buffer.write 512        200.01 MBps   2.02 % 🟣🟣
node     Buffer.from  32         167.45 MBps   1.69 % 🟢
deno     Buffer.from  512        117.70 MBps   1.19 % 🟣
bun      Buffer.from  32          99.67 MBps   1.00 % 🟡
deno     Buffer.write 32          26.01 MBps   0.26 % 🟣
deno     Buffer.from  32          15.76 MBps   0.15 % 🟣
```
