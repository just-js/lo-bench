import { Bench } from '../fs/lib/bench.mjs'
import { inflate } from 'lib/inflate.js'

const { core } = lo
const { readFile } = core
const file_name = args[0] || 'openssl.tar.gz'

const buf = readFile(file_name)
const decompressed = inflate(buf)
const len = decompressed.length
console.log(`original ${buf.length} decompressed ${decompressed.length} - ${Math.floor((buf.length / decompressed.length) * 100)} %`)

const iter = 5
const runs = 1000
const bench = new Bench()

for (let i = 0; i < iter; i++) {
  bench.start('inflate')
  for (let j = 0; j < runs; j++) {
    const decompressed = inflate(buf)
    assert(decompressed.length === len)
  }
  bench.end(runs)
}
