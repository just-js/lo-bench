import { Bench } from './lib/bench.mjs'
import { Digest } from './lib/hash.js'

const md5 = new Digest('md5')
const sha256 = new Digest('sha256')
const sha1 = new Digest('sha1')
const encoder = new TextEncoder()
const hello = encoder.encode('hello')

const expected = [ 
  93, 65, 64, 42, 188, 75, 42, 118, 185, 113, 157, 145, 16, 23, 197, 146 
]
const expectedsha1 = [
  170, 244, 198, 29, 220, 197, 232, 162, 218, 190, 222, 15, 59, 72, 44, 217, 
  174, 169, 67, 77
]
const expectedsha256 = [ 
  44, 242, 77, 186, 95, 176, 163, 14, 38, 232, 59, 42, 197, 185, 226, 158, 27, 
  22, 30, 92, 31, 167, 66, 94, 115, 4, 51, 98, 147, 139, 152, 36 
]

md5.hash_string('hello').forEach((v, i) => assert(v === expected[i]))
md5.hash(hello).forEach((v, i) => assert(v === expected[i]))
sha256.hash_string('hello').forEach((v, i) => assert(v === expectedsha256[i]))
sha256.hash(hello).forEach((v, i) => assert(v === expectedsha256[i]))
sha1.hash_string('hello').forEach((v, i) => assert(v === expectedsha1[i]))
sha1.hash(hello).forEach((v, i) => assert(v === expectedsha1[i]))

const iter = parseInt(args[0] || '5', 10)
const runs = parseInt(args[1] || '3000000', 10)
let total = parseInt(args[2] || '1', 10)
const bench = new Bench()

while (total--) {

{
  for (let i = 0; i < iter; i++) {
    bench.start('sha1-string')
    for (let j = 0; j < runs; j++) {
      sha1.hash_string('hello')
    }
    bench.end(runs)
  }
}

{
  for (let i = 0; i < iter; i++) {
    bench.start('sha1-buffer')
    for (let j = 0; j < runs; j++) {
      sha1.hash(hello)
    }
    bench.end(runs)
  }
}

{
  for (let i = 0; i < iter; i++) {
    bench.start('md5-string')
    for (let j = 0; j < runs; j++) {
      md5.hash_string('hello')
    }
    bench.end(runs)
  }
}

{
  for (let i = 0; i < iter; i++) {
    bench.start('md5-buffer')
    for (let j = 0; j < runs; j++) {
      md5.hash(hello)
    }
    bench.end(runs)
  }
}

{
  for (let i = 0; i < iter; i++) {
    bench.start('sha256-string')
    for (let j = 0; j < runs; j++) {
      sha256.hash_string('hello')
    }
    bench.end(runs)
  }
}

{
  for (let i = 0; i < iter; i++) {
    bench.start('sha256-buffer')
    for (let j = 0; j < runs; j++) {
      sha256.hash(hello)
    }
    bench.end(runs)
  }
}

}
