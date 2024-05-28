import { Bench } from '../lib/bench.mjs'

if (!globalThis.btoa) {

const { utf8_decode, utf8_length, ptr } = lo
const { encode } = lo.load('encode')

const { base64_encode_str, base64_decode_str } = encode

const dest = ptr(new Uint8Array(65536))

function btoa (str) {
  return utf8_decode(dest.ptr, base64_encode_str(str, utf8_length(str), dest.ptr, dest.length))
}

function atob (str) {
  return utf8_decode(dest.ptr, base64_decode_str(dest.ptr, dest.length, str, utf8_length(str)))
}

globalThis.btoa = btoa
globalThis.atob = atob

}

const bench = new Bench()
const runs = 9000000

const sizes = [16, 32, 64, 128, 256, 1024]

const str = 'A'.repeat(64)

for (let i = 0; i < 5; i++) {
  bench.start('btoa')
  for (let j = 0; j < runs; j++) {
    btoa(str)
  }
  bench.end(runs)
}

const b64 = btoa(str)

for (let i = 0; i < 5; i++) {
  bench.start('atob')
  for (let j = 0; j < runs; j++) {
    atob(b64)
  }
  bench.end(runs)
}
