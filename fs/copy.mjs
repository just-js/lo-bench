import { Bench } from './lib/bench.mjs'
import { cpSync } from 'node:fs'

const options = { force: true, recursive: true }

const dest_dir = args[0] || '/dev/shm'
cpSync(`${dest_dir}/test`, `${dest_dir}/test2`, options)

const iter = 5
const bench = new Bench()
const runs = 10000

for (let i = 0; i < iter; i++) {
  bench.start('copy')
  for (let j = 0; j < runs; j++) {
    cpSync(`${dest_dir}/test`, `${dest_dir}/test2`, options)
  }
  bench.end(runs)
}
