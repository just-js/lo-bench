import { Bench } from './lib/bench.mjs'
import { Buffer } from 'node:buffer'

const iter = parseInt(args[0] || '5', 10)
const bench = new Bench()
bench.name_width = 30

const sizes = [ 32, 512, 64 * 1024, 512 * 1024, 1024 * 1024 * 8 ]
const rates = [
  globalThis.Bun ? 
    [ 9000000, 6000000, 240000, 24000, 1200 ] : 
    globalThis.Deno ? [1000000, 600000, 14000, 1800, 100] : 
    [ 9000000, 6000000, 60000, 6000, 200 ],
  globalThis.Bun ? 
    [ 32000000, 18000000, 180000, 18000, 1600 ] : 
    globalThis.Deno ? [2000000, 1000000, 20000, 1800, 100] :
    [ 16000000, 9000000, 180000, 18000, 1600 ]
]

for (let x = 0; x < sizes.length; x++) {
  const size = sizes[x]
  const buf = Buffer.alloc(size, "latin1")
  const input = buf.toString("base64")
  const output = Buffer.from(input, "base64")
  assert(output.length === size)
  {
    const runs = rates[0][x]
    for (let i = 0; i < iter; i++) {
      bench.start(`Buffer.from ${size}`)
      for (let j = 0; j < runs; j++) {
        assert(Buffer.from(input, 'base64').length === size)
      }
      bench.end(runs)
    }
  }
  {
    const runs = rates[1][x]
    for (let i = 0; i < iter; i++) {
      bench.start(`Buffer.write ${size}`)
      for (let j = 0; j < runs; j++) {
        assert(output.write(input, 'base64') === size)
      }
      bench.end(runs)
    }
  }
}
