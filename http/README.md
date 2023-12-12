this works on a fresh debian:bookworm-slim docker. i'll push it up to docs repo later.

```bash
apt update
# install build deps
apt install -y curl g++ make libcurl4-openssl-dev
# download and extract source
curl -L -o 0.0.13-pre.tar.gz https://github.com/just-js/lo/archive/refs/tags/0.0.13-pre.tar.gz
tar -xf 0.0.13-pre.tar.gz
cd lo-0.0.13-pre
# build the lo runtime
make C=gcc CC=g++ cleanall lo
# run some checks
# this should print version to console
./lo
# this should run successfully and display nothing
./lo eval 1
# this should run successfully and display nothing
./lo test/runtime.js
# this should dump all the internals of the current runtime
./lo test/dump.js
# build the bindings the http benches depend on
./lo build binding net
./lo build binding epoll
./lo build binding pico
./lo build binding system
# download and extract the bench repo
curl -L -o lo-bench.tar.gz https://codeload.github.com/just-js/lo-bench/tar.gz/main
tar -xf lo-bench.tar.gz
# set LO_HOME
export LO_HOME=$(pwd)
# open two terminals, run the web server in one
./lo lo-bench-main/http/hello-lo.js
# run the load tester in the other
./lo lo-bench-main/http/wrk.js
```
