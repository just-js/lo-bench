## on linux

```shell
docker build -t fs-bench .
docker run -it --rm -v $(pwd):/bench --privileged --shm-size=1024m fs-bench
tar -xvf test.tar.gz
mv test /dev/shm/
lo build binding stdfs
node copy.mjs
bun copy.mjs
lo copy.js
```

```shell
node       copy                 time     6097 rate         1640 rate/core         1624 ns/iter    609792.81 rss     75505664 usr  50.67 sys  50.34 tot 101.01
node       copy                 time     6026 rate         1660 rate/core         1673 ns/iter    602699.26 rss     88281088 usr  49.77 sys  49.44 tot  99.21
node       copy                 time     6006 rate         1665 rate/core         1681 ns/iter    600606.78 rss     92729344 usr  50.61 sys  48.45 tot  99.06
node       copy                 time     5974 rate         1674 rate/core         1698 ns/iter    597421.09 rss     92729344 usr  49.37 sys  49.21 tot  98.58
node       copy                 time     5997 rate         1668 rate/core         1687 ns/iter    599711.02 rss     92729344 usr  49.52 sys  49.35 tot  98.87
bun        copy                 time     1565 rate         6387 rate/core         6452 ns/iter    156574.20 rss     52985856 usr  27.46 sys  71.53 tot  98.99
bun        copy                 time     1563 rate         6397 rate/core         6537 ns/iter    156338.47 rss     57573376 usr  27.50 sys  70.36 tot  97.86
bun        copy                 time     1568 rate         6377 rate/core         6537 ns/iter    156833.97 rss     59146240 usr  27.41 sys  70.13 tot  97.54
bun        copy                 time     1566 rate         6383 rate/core         6537 ns/iter    156684.41 rss     60981248 usr  28.72 sys  68.92 tot  97.64
bun        copy                 time     1559 rate         6412 rate/core         6580 ns/iter    155978.66 rss     62554112 usr  27.56 sys  69.88 tot  97.44
lo         copy                 time     3285 rate         4261 rate/core         4349 ns/iter    234698.34 rss     37617664 usr  28.60 sys  69.38 tot  97.98
lo         copy                 time     3313 rate         4226 rate/core         4283 ns/iter    236680.10 rss     37785600 usr  31.68 sys  66.99 tot  98.67
lo         copy                 time     3280 rate         4268 rate/core         4348 ns/iter    234304.33 rss     37785600 usr  29.57 sys  68.59 tot  98.16
lo         copy                 time     3284 rate         4263 rate/core         4322 ns/iter    234578.30 rss     37785600 usr  28.62 sys  70.03 tot  98.65
lo         copy                 time     3287 rate         4260 rate/core         4322 ns/iter    234795.41 rss     37785600 usr  25.85 sys  72.70 tot  98.55
```

## on macos

```shell
## install lo
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
```

```shell
tar -xvf test.tar.gz
mv test /tmp/
lo build binding stdfs
node copy.mjs /tmp
bun copy.mjs /tmp
lo copy.js /tmp
```

```shell
node       copy                 time    10974 rate          912 rate/core          908 ns/iter   1097489.06 rss     66387968 usr  11.09 sys  89.27 tot 100.36
node       copy                 time    10930 rate          915 rate/core          915 ns/iter   1093075.22 rss     73072640 usr  10.68 sys  89.31 tot  99.99
node       copy                 time    10976 rate          912 rate/core          912 ns/iter   1097619.90 rss     79642624 usr  10.60 sys  89.40 tot 100.00
node       copy                 time    10955 rate          913 rate/core          914 ns/iter   1095505.79 rss     84066304 usr  10.55 sys  89.42 tot  99.97
node       copy                 time    10984 rate          911 rate/core          912 ns/iter   1098417.55 rss     84328448 usr  10.54 sys  89.34 tot  99.88
bun        copy                 time     4209 rate         2376 rate/core         2375 ns/iter    420933.32 rss     35995648 usr   3.97 sys  96.08 tot 100.05
bun        copy                 time     4183 rate         2391 rate/core         2391 ns/iter    418335.67 rss     37486592 usr   3.95 sys  96.05 tot 100.00
bun        copy                 time     4183 rate         2391 rate/core         2391 ns/iter    418316.72 rss     38682624 usr   3.94 sys  96.07 tot 100.01
bun        copy                 time     4196 rate         2383 rate/core         2384 ns/iter    419694.62 rss     41779200 usr   3.94 sys  96.04 tot  99.98
bun        copy                 time     4193 rate         2385 rate/core         2385 ns/iter    419367.71 rss     43073536 usr   3.93 sys  96.07 tot 100.00
lo         copy                 time     8115 rate         1233 rate/core         1232 ns/iter    811529.78 rss     21086208 usr   5.17 sys  94.88 tot 100.05
lo         copy                 time     8124 rate         1231 rate/core         1232 ns/iter    812458.74 rss     22085632 usr   5.16 sys  94.77 tot  99.93
lo         copy                 time     8120 rate         1232 rate/core         1232 ns/iter    812038.94 rss     22134784 usr   5.17 sys  94.82 tot  99.99
lo         copy                 time     8140 rate         1229 rate/core         1232 ns/iter    814053.51 rss     22134784 usr   5.03 sys  94.71 tot  99.74
lo         copy                 time     8127 rate         1231 rate/core         1232 ns/iter    812744.94 rss     22134784 usr   5.04 sys  94.86 tot  99.90
```

## with a ramdisk on macos

```shell
hdiutil attach -nomount ram://$((2 * 1024 * 100))
diskutil eraseVolume HFS+ RAMDisk /dev/disk4
```

```shell
node copy.mjs /Volumes/RAMDisk     
node       copy                 time     8437 rate         1186 rate/core         1179 ns/iter    843790.24 rss     67207168 usr  14.78 sys  85.76 tot 100.54
node       copy                 time     8386 rate         1193 rate/core         1191 ns/iter    838653.47 rss     79052800 usr  14.30 sys  85.85 tot 100.15
node       copy                 time     8376 rate         1194 rate/core         1194 ns/iter    837622.42 rss     84033536 usr  14.21 sys  85.82 tot 100.03
node       copy                 time     8376 rate         1194 rate/core         1194 ns/iter    837630.48 rss     85131264 usr  14.16 sys  85.85 tot 100.01
node       copy                 time     8374 rate         1195 rate/core         1194 ns/iter    837472.38 rss     85164032 usr  14.22 sys  85.84 tot 100.06
bun        copy                 time     3623 rate         2760 rate/core         2758 ns/iter    362332.32 rss     36339712 usr   4.66 sys  95.41 tot 100.07
bun        copy                 time     3615 rate         2767 rate/core         2766 ns/iter    361512.46 rss     38174720 usr   4.63 sys  95.39 tot 100.02
bun        copy                 time     3620 rate         2763 rate/core         2762 ns/iter    362030.82 rss     39682048 usr   4.63 sys  95.39 tot 100.02
bun        copy                 time     3613 rate         2768 rate/core         2767 ns/iter    361334.65 rss     43089920 usr   4.64 sys  95.41 tot 100.05
bun        copy                 time     3614 rate         2767 rate/core         2768 ns/iter    361412.51 rss     44728320 usr   4.63 sys  95.36 tot  99.99
lo         copy                 time     6306 rate         1586 rate/core         1586 ns/iter    630659.74 rss     22020096 usr   6.65 sys  93.39 tot 100.04
lo         copy                 time     6300 rate         1588 rate/core         1585 ns/iter    630060.69 rss     23019520 usr   6.66 sys  93.48 tot 100.14
lo         copy                 time     6299 rate         1588 rate/core         1588 ns/iter    629904.61 rss     23117824 usr   6.66 sys  93.34 tot 100.00
lo         copy                 time     6297 rate         1588 rate/core         1590 ns/iter    629730.54 rss     23117824 usr   6.51 sys  93.37 tot  99.88
lo         copy                 time     6297 rate         1588 rate/core         1588 ns/iter    629766.06 rss     23117824 usr   6.66 sys  93.36 tot 100.02
```

## strace

```shell
strace -c node copy.mjs /dev/shm
node       copy                 time      386 rate          260 rate/core          455 ns/iter   3860156.50 rss     59768832 usr  33.67 sys  23.31 tot  56.98
node       copy                 time      356 rate          281 rate/core          556 ns/iter   3568029.40 rss     59858944 usr  25.22 sys  25.22 tot  50.44
node       copy                 time      359 rate          279 rate/core          589 ns/iter   3595268.18 rss     62349312 usr  13.90 sys  33.37 tot  47.27
node       copy                 time      358 rate          280 rate/core          589 ns/iter   3581175.96 rss     62574592 usr  19.54 sys  27.92 tot  47.46
node       copy                 time      367 rate          273 rate/core          626 ns/iter   3670455.25 rss     62676992 usr  16.34 sys  27.24 tot  43.58
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ------------------
 24.38    0.052063           2     22564        15 statx
 20.97    0.044769           3     12054           openat
  9.38    0.020033           4      4500           unlink
  8.18    0.017456           1     12059           close
  7.88    0.016833           3      4509           copy_file_range
  6.55    0.013978           1      9018           getdents64
  5.84    0.012479           1      9028           fstat
  5.19    0.011088           2      4515           chmod
  3.52    0.007507           1      4509           ftruncate
  3.25    0.006930           1      4509           fchmod
  3.10    0.006609           2      3021           newfstatat
  0.59    0.001260          14        86           munmap
  0.50    0.001066           2       502         1 access
  0.32    0.000687           2       330         8 futex
  0.06    0.000130           2        44           madvise
  0.06    0.000128           2        55           read
  0.04    0.000090           1        78           mmap
  0.04    0.000085           5        16           epoll_pwait
  0.03    0.000058           0        65           rt_sigaction
  0.03    0.000057           0        64           getpid
  0.02    0.000052           0        61           mprotect
  0.02    0.000041           1        38         2 ioctl
  0.02    0.000039           3        10           write
  0.01    0.000030           0        41           rt_sigprocmask
  0.01    0.000020           1        20           brk
  0.01    0.000012           0        28        14 fcntl
  0.01    0.000012           2         6         2 epoll_ctl
  0.00    0.000002           0         3           readlink
  0.00    0.000000           0         2           pread64
  0.00    0.000000           0         1           execve
  0.00    0.000000           0         1           uname
  0.00    0.000000           0         1           getcwd
  0.00    0.000000           0         6           mkdir
  0.00    0.000000           0         1           sysinfo
  0.00    0.000000           0        13           getuid
  0.00    0.000000           0        13           getgid
  0.00    0.000000           0        13           geteuid
  0.00    0.000000           0        13           getegid
  0.00    0.000000           0        13           capget
  0.00    0.000000           0         1           arch_prctl
  0.00    0.000000           0         3           gettid
  0.00    0.000000           0         1           sched_getaffinity
  0.00    0.000000           0         1           set_tid_address
  0.00    0.000000           0         1           set_robust_list
  0.00    0.000000           0         2           eventfd2
  0.00    0.000000           0         2           epoll_create1
  0.00    0.000000           0         2           dup3
  0.00    0.000000           0         3           pipe2
  0.00    0.000000           0         8           prlimit64
  0.00    0.000000           0         2           getrandom
  0.00    0.000000           0         1           rseq
  0.00    0.000000           0        10           clone3
------ ----------- ----------- --------- --------- ------------------
100.00    0.213514           2     91847        42 total


strace -c bun copy.mjs /dev/shm
bun        copy                 time      178 rate          562 rate/core         1001 ns/iter   1782081.08 rss     49283072 usr  16.83 sys  39.27 tot  56.10
bun        copy                 time      174 rate          574 rate/core         1668 ns/iter   1742621.01 rss     49676288 usr   5.73 sys  28.69 tot  34.42
bun        copy                 time      176 rate          569 rate/core         2001 ns/iter   1760281.48 rss     49541120 usr   5.68 sys  22.72 tot  28.40
bun        copy                 time      175 rate          572 rate/core         1430 ns/iter   1750307.01 rss     49471488 usr   5.71 sys  34.27 tot  39.98
bun        copy                 time      178 rate          562 rate/core         1668 ns/iter   1781023.48 rss     49471488 usr   5.61 sys  28.07 tot  33.68
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- -------------------
 30.29    0.041484           3     12055         1 openat
 16.51    0.022606           1     12052           close
  9.43    0.012915           2      4509           copy_file_range
  8.76    0.011998           1      6018           getdents64
  8.03    0.011002           2      4509           ftruncate
  6.49    0.008884           1      4509           fchmod
  6.34    0.008684           2      3006           lstat
  6.19    0.008483           1      4521           fstat
  5.88    0.008056           2      3006      3006 mkdir
  0.74    0.001012           6       160         1 futex
  0.46    0.000635          70         9           sched_yield
  0.18    0.000244          20        12           clone3
  0.11    0.000147           3        47           read
  0.10    0.000140           7        20           mprotect
  0.09    0.000129           2        46           mmap
  0.08    0.000110           3        32           rt_sigprocmask
  0.07    0.000102          10        10           sched_setscheduler
  0.07    0.000101           3        29           madvise
  0.04    0.000061           6        10           write
  0.02    0.000034           2        13           pread64
  0.02    0.000023           1        19         1 ioctl
  0.02    0.000023           1        12           sched_getaffinity
  0.01    0.000014           3         4           munmap
  0.01    0.000011           2         4           timerfd_create
  0.01    0.000010           5         2           readlink
  0.01    0.000010           3         3           epoll_ctl
  0.01    0.000008           1         8           newfstatat
  0.01    0.000008           8         1           epoll_create1
  0.00    0.000006           0        13           rt_sigaction
  0.00    0.000005           2         2           timerfd_settime
  0.00    0.000005           5         1           eventfd2
  0.00    0.000004           4         1           sysinfo
  0.00    0.000002           2         1           lseek
  0.00    0.000001           1         1           uname
  0.00    0.000000           0         1           open
  0.00    0.000000           0         3           brk
  0.00    0.000000           0         2         2 access
  0.00    0.000000           0         1           getpid
  0.00    0.000000           0         1           execve
  0.00    0.000000           0         1           getcwd
  0.00    0.000000           0         1           sigaltstack
  0.00    0.000000           0         1           arch_prctl
  0.00    0.000000           0         2           gettid
  0.00    0.000000           0         1           set_tid_address
  0.00    0.000000           0         1           set_robust_list
  0.00    0.000000           0         8           prlimit64
  0.00    0.000000           0         2           getrandom
  0.00    0.000000           0         1           rseq
  0.00    0.000000           0         1           close_range
------ ----------- ----------- --------- --------- -------------------
100.00    0.136957           2     54672      3011 total

lo copy.js /dev/shm
lo         copy                 time      210 rate          475 rate/core         1251 ns/iter   2106454.60 rss     28704768 usr   9.49 sys  28.48 tot  37.97
lo         copy                 time      216 rate          462 rate/core         1112 ns/iter   2165969.02 rss     29097984 usr   9.23 sys  32.31 tot  41.54
lo         copy                 time      225 rate          443 rate/core         1251 ns/iter   2257523.04 rss     29097984 usr   8.85 sys  26.57 tot  35.42
lo         copy                 time      257 rate          389 rate/core         1001 ns/iter   2574635.62 rss     29097984 usr   7.76 sys  31.07 tot  38.83
lo         copy                 time      226 rate          441 rate/core         1112 ns/iter   2267724.25 rss     29097984 usr   4.40 sys  35.27 tot  39.67
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ------------------
 28.75    0.053179           2     18050           newfstatat
 28.70    0.053095           4     12040           openat
 13.21    0.024435           2     12039           close
 11.07    0.020470           4      4509           sendfile
  6.97    0.012892           2      6012           getdents64
  5.66    0.010464           1      6012           fcntl
  5.37    0.009938           2      4509           fchmod
  0.12    0.000223          44         5           write
  0.06    0.000111           2        46           mmap
  0.03    0.000053           3        17           brk
  0.02    0.000037           5         7           pread64
  0.01    0.000022           0        30           mprotect
  0.01    0.000022           2         8           futex
  0.01    0.000016           2         6           times
  0.01    0.000011           0        23           read
  0.00    0.000007           1         6           munmap
  0.00    0.000004           2         2           ioctl
  0.00    0.000004           4         1           getcwd
  0.00    0.000000           0         1           rt_sigaction
  0.00    0.000000           0         5           rt_sigprocmask
  0.00    0.000000           0         1         1 access
  0.00    0.000000           0         3           madvise
  0.00    0.000000           0         1           getpid
  0.00    0.000000           0         1           execve
  0.00    0.000000           0         1           uname
  0.00    0.000000           0         1           arch_prctl
  0.00    0.000000           0         1           sched_getaffinity
  0.00    0.000000           0         1           set_tid_address
  0.00    0.000000           0         1           set_robust_list
  0.00    0.000000           0         2           prlimit64
  0.00    0.000000           0         1           getrandom
  0.00    0.000000           0         1         1 pkey_alloc
  0.00    0.000000           0         1           rseq
  0.00    0.000000           0         2           clone3
------ ----------- ----------- --------- --------- ------------------
100.00    0.184983           2     63346         2 total
```


