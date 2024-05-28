#!/bin/bash
#sudo sh -c 'echo 1 >/proc/sys/kernel/perf_event_paranoid'
#sudo sh -c 'echo 0 >/proc/sys/kernel/kptr_restrict'
rm -f *.data
rm -f *.so
rm -f *.log
rm -f *.dump
rm -f *.jitted
rm -f *.old
#perf record -g --strict-freq --call-graph=fp --clockid=mono --freq=max --output=perf.data /home/andrew/.lo/bin/lo --perf-prof --no-write-protect-code-memory --interpreted-frames-native-stack lo-ssr2.js 800 
#perf inject --jit --input=perf.data --output=perf.data.jitted
#perf report --input=perf.data.jitted
