import { Bench } from '../lib/bench.mjs'
//import { Buffer } from "https://deno.land/std@0.139.0/node/buffer.ts";
// https://github.com/oven-sh/bun/pull/11087

const bench = new Bench()
let runs = 3 * 1024 * 1024

const sizes = [16, 32, 64, 128, 256, 1024]

for (const size of sizes) {
  const buf = Buffer.alloc(size)
  let total = 0

  for (let i = 0; i < 5; i++) {
    bench.start(`base64url ${size}`)
    for (let j = 0; j < runs; j++) {
      total += buf.toString('base64url').length
    }
    bench.end(runs)
  }

  console.log(total)
}
