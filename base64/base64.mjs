import { Bench } from './lib/bench.mjs'
import { Buffer } from 'node:buffer'

const iter = parseInt(args[0] || '5', 10)

const sizes = [ 32, 512, 64 * 1024, 512 * 1024, 1024 * 1024 * 8 ]
const rates = [ 9000000, 6000000, 60000, 6000, 200 ]

for (let x = 0; x < sizes.length; x++) {
  const size = sizes[x]
  const buf = Buffer.alloc(size, "latin1")
  const input = buf.toString("base64")
  const output = Buffer.from(input, "base64")
  assert(output.length === size)
  {
    let runs = rates[x]
    let time_taken = 0
    const fn = () => assert(Buffer.from(input, 'base64').length === size)
    while (time_taken < 3) {
      const bench = new Bench(false)
      bench.start(`Buffer.from ${size}`)
      for (let j = 0; j < runs; j++) fn()
      time_taken = bench.end(runs).seconds
      runs = Math.floor(runs * ((3 / time_taken) * 1.1))
    }
    for (let i = 0; i < iter; i++) {
      const bench = new Bench()
      bench.name_width = 30
      bench.start(`Buffer.from ${size}`)
      for (let j = 0; j < runs; j++) fn()
      bench.end(runs)
    }
  }
  {
    let runs = rates[x]
    let time_taken = 0
    const fn = () => assert(output.write(input, 'base64') === size)
    while (time_taken < 3) {
      const bench = new Bench(false)
      bench.start(`Buffer.write ${size}`)
      for (let j = 0; j < runs; j++) fn()
      time_taken = bench.end(runs).seconds
      runs = Math.floor(runs * ((3 / time_taken) * 1.1))
    }
    for (let i = 0; i < iter; i++) {
      const bench = new Bench()
      bench.name_width = 30
      bench.start(`Buffer.write ${size}`)
      for (let j = 0; j < runs; j++) fn()
      bench.end(runs)
    }
  }
}
