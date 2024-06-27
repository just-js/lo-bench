tar -xvf test.tar.gz
mv test /tmp/


on linux

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

