import { Bench } from '../lib/bench.mjs'

const { ptr } = lo
const { simdtext } = lo.load('simdtext')
const { encode } = lo.load('encode')
const { base64_encode, base64_decode_str } = encode
const { base64_decode } = simdtext

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const iter = parseInt(args[0] || '5', 10)
const bench = new Bench()
bench.name_width = 30
const sizes = [ 32, 512, 64 * 1024, 512 * 1024, 1024 * 1024 * 8 ]
const rates = [ 18000000, 12000000, 360000, 36000, 1200 ]

for (let x = 0; x < sizes.length; x++) {
  const size = sizes[x]
  const runs = rates[x]
  const buf = ptr(encoder.encode('latin1'.repeat(size).slice(0, size)))
  const dest = new Uint8Array(size * 2)
  const input = decoder.decode(dest.subarray(0, base64_encode(buf, buf.length, dest, dest.length)))
  assert(base64_decode_str(buf.ptr, buf.length, input, input.length) === size)
  assert(base64_decode(buf.ptr, buf.length, input) === size)
  for (let i = 0; i < iter; i++) {
    bench.start(`base64_simd_fast ${size}`)
    for (let j = 0; j < runs; j++) {
      assert(base64_decode(buf.ptr, buf.length, input) === size)
    }
    bench.end(runs)
  }
}
