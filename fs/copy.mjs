import { Bench } from './lib/bench.mjs'
import { cpSync } from 'node:fs'

const options = { force: false, recursive: true }

cpSync('/dev/shm/test', '/dev/shm/test2', options)

const iter = 5
const bench = new Bench()
const runs = 100

for (let i = 0; i < iter; i++) {
  bench.start('copy')
  for (let j = 0; j < runs; j++) {
    cpSync('/dev/shm/test', '/dev/shm/test2', options)
  }
  bench.end(runs)
}
