import { Bench } from '../crypto/lib/bench.mjs'
const fs = require('node:fs')

const file_name = args[0] || 'openssl.tar.gz'
const buf = fs.readFileSync(file_name)
const decompressed = Bun.gunzipSync(buf)
const len = decompressed.length
console.log(`original ${buf.length} decompressed ${decompressed.length} - ${Math.floor((buf.length / decompressed.length) * 100)} %`)

const iter = 5
const runs = 1000
const bench = new Bench()

for (let i = 0; i < iter; i++) {
  bench.start('inflate')
  for (let j = 0; j < runs; j++) {
    const decompressed = Bun.gunzipSync(buf)
    assert(decompressed.length === len)
  }
  bench.end(runs)
}
