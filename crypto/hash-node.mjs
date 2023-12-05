import { Bench } from './lib/bench.mjs'
import { createHash } from 'node:crypto'

const encoder = new TextEncoder()
const hello = encoder.encode('hello')

const expected = [ 
  93, 65, 64, 42, 188, 75, 42, 118, 185, 113, 157, 145, 16, 23, 197, 146 
]
const expectedsha256 = [ 
  44, 242, 77, 186, 95, 176, 163, 14, 38, 232, 59, 42, 197, 185, 226, 158, 27, 
  22, 30, 92, 31, 167, 66, 94, 115, 4, 51, 98, 147, 139, 152, 36 
]

function md5_buffer (buf) {
  return createHash('md5').update(buf).digest()
}

function md5_string (str) {
  return createHash('md5').update(str).digest()
}

function sha256_buffer (buf) {
  return createHash('sha256').update(buf).digest()
}

function sha256_string (str) {
  return createHash('sha256').update(str).digest()
}

md5_buffer(hello).forEach((v, i) => assert(v === expected[i]))
md5_string('hello').forEach((v, i) => assert(v === expected[i]))
sha256_buffer(hello).forEach((v, i) => assert(v === expectedsha256[i]))
sha256_string('hello').forEach((v, i) => assert(v === expectedsha256[i]))

const iter = parseInt(args[0] || '3', 10)
const runs = parseInt(args[1] || '1000000', 10)
let total = parseInt(args[2] || '1', 10)
const bench = new Bench()

while (total--) {

{
  for (let i = 0; i < iter; i++) {
    bench.start('md5-string')
    for (let j = 0; j < runs; j++) {
      md5_string('hello')
    }
    bench.end(runs)
  }
}

{
  for (let i = 0; i < iter; i++) {
    bench.start('md5-buffer')
    for (let j = 0; j < runs; j++) {
      md5_buffer(hello)
    }
    bench.end(runs)
  }
}

{
  for (let i = 0; i < iter; i++) {
    bench.start('sha256-string')
    for (let j = 0; j < runs; j++) {
      sha256_string('hello')
    }
    bench.end(runs)
  }
}

{
  for (let i = 0; i < iter; i++) {
    bench.start('sha256-buffer')
    for (let j = 0; j < runs; j++) {
      sha256_buffer(hello)
    }
    bench.end(runs)
  }
}

}
