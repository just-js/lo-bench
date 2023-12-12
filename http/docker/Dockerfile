FROM debian:bookworm-slim

RUN apt update
# install build deps
RUN apt install -y curl g++ make libcurl4-openssl-dev
WORKDIR /lo
# download and extract source
RUN curl -L -o 0.0.13-pre.tar.gz https://github.com/just-js/lo/archive/refs/tags/0.0.13-pre.tar.gz
RUN tar -xf 0.0.13-pre.tar.gz
WORKDIR /lo/lo-0.0.13-pre
# build the lo runtime
RUN make C=gcc CC=g++ cleanall lo
# run some checks
# this should print version to console
RUN ./lo
# this should run successfully and display nothing
RUN ./lo eval 1
# this should run successfully and display nothing
RUN ./lo test/runtime.js
# this should dump all the internals of the current runtime
RUN ./lo test/dump.js
# build the bindings the http benches depend on
RUN ./lo build binding net
RUN ./lo build binding epoll
RUN ./lo build binding pico
RUN ./lo build binding system
# download and extract the bench repo
RUN curl -L -o lo-bench.tar.gz https://codeload.github.com/just-js/lo-bench/tar.gz/main
RUN tar -xf lo-bench.tar.gz
# set LO_HOME
ENV LO_HOME=/lo/lo-0.0.13-pre
CMD ["/bin/bash"]

