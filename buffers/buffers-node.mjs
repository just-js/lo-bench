import { Bench } from '../crypto/lib/bench.mjs'

function create_buffer (size) {
  return new Uint8Array(size)
}

const iter = 5
const runs = 1000000
const bench = new Bench()

const size = 16384
while (1) {

for (let i = 0; i < iter; i++) {
  bench.start('create_buffer')
  for (let j = 0; j < runs; j++) {
    if (create_buffer(size).length !== size) throw new Error('UhOh')
  }
  bench.end(runs)
}

}
