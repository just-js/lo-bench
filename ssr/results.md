node 20 + marko

cpu 101
mem 87 MB

Running 10s test @ http://127.0.0.1:3000/data
  2 threads and 4 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     1.22ms  510.68us  15.34ms   84.42%
    Req/Sec     1.65k   507.15     2.29k    58.00%
  32758 requests in 10.00s, 3.03GB read
Requests/sec:   3274.62
Transfer/sec:    309.84MB
Thread: 1, 200: 17315
Thread: 2, 200: 15443
50%,947
75%,1675
90%,1789
99%,2450
99.9%,4252
99.99%,14060
99.999%,15341
99.9999%,15341

node 21 + marko

cpu 101
mem 90 MB

Running 10s test @ http://127.0.0.1:3000/data
  2 threads and 4 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     1.25ms  509.93us  10.22ms   88.17%
    Req/Sec     1.61k   476.39     2.20k    54.00%
  32027 requests in 10.00s, 2.96GB read
Requests/sec:   3202.35
Transfer/sec:    303.00MB
Thread: 1, 200: 13543
Thread: 2, 200: 18484
50%,979
75%,1735
90%,1780
99%,2704
99.9%,4792
99.99%,8281
99.999%,10218
99.9999%,10218

bun + marko

cpu 105
mem 105 MB

Running 10s test @ http://127.0.0.1:3000/data
  2 threads and 4 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     0.97ms  594.01us  22.66ms   91.11%
    Req/Sec     2.09k   523.90     4.37k    61.69%
  41709 requests in 10.10s, 3.85GB read
Requests/sec:   4129.84
Transfer/sec:    390.58MB
Thread: 1, 200: 24124
Thread: 2, 200: 17585
50%,739
75%,1258
90%,1464
99%,2309
99.9%,4335
99.99%,20721
99.999%,22657
99.9999%,22657

bun --smol + marko

cpu 150
mem 81 MB

Running 10s test @ http://127.0.0.1:3000/data
  2 threads and 4 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     1.55ms  807.51us  17.98ms   66.67%
    Req/Sec     1.30k   353.42     2.01k    54.00%
  25827 requests in 10.00s, 2.39GB read
Requests/sec:   2582.37
Transfer/sec:    244.23MB
Thread: 1, 200: 10431
Thread: 2, 200: 15396
50%,1424
75%,2004
90%,2598
99%,3536
99.9%,7341
99.99%,16434
99.999%,17983
99.9999%,17983

deno + marko

cpu 101
mem 105 MB

Running 10s test @ http://127.0.0.1:3000/data
  2 threads and 4 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     1.15ms  348.74us  14.37ms   98.22%
    Req/Sec     1.73k   126.86     1.84k    86.50%
  34346 requests in 10.00s, 3.17GB read
Requests/sec:   3433.48
Transfer/sec:    324.79MB
Thread: 1, 200: 17157
Thread: 2, 200: 17189
50%,1079
75%,1194
90%,1262
99%,1748
99.9%,6211
99.99%,14266
99.999%,14366
99.9999%,14366

lo + html

cpu 101
mem 115 MB

Running 10s test @ http://127.0.0.1:3000/data
  2 threads and 4 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   647.00us    1.65ms  45.27ms   99.52%
    Req/Sec     3.55k     0.92k    4.98k    54.00%
  70688 requests in 10.01s, 6.53GB read
Requests/sec:   7064.75
Transfer/sec:    668.24MB
Thread: 1, 200: 41729
Thread: 2, 200: 28959
50%,396
75%,782
90%,803
99%,1302
99.9%,33495
99.99%,43002
99.999%,45266
99.9999%,45266
