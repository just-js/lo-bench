import { Bench } from './lib/bench.mjs'
import { Hash } from "https://deno.land/x/checksum@1.2.0/mod.ts";

const encoder = new TextEncoder()
const hello = encoder.encode('hello')

const expected = [ 
  93, 65, 64, 42, 188, 75, 42, 118, 185, 113, 157, 145, 16, 23, 197, 146 
]
const expectedsha256 = [ 
  44, 242, 77, 186, 95, 176, 163, 14, 38, 232, 59, 42, 197, 185, 226, 158, 27, 
  22, 30, 92, 31, 167, 66, 94, 115, 4, 51, 98, 147, 139, 152, 36 
]

const md5 = new Hash('md5')
const sha256_hash = data => crypto.subtle.digest("SHA-256", data)

function md5_digest_string (str) {
  return md5.digest(encoder.encode(str)).data
}

function md5_digest_buffer (buf) {
  return md5.digest(buf).data
}

async function sha256_hash_string (str) {
  const ab = await crypto.subtle.digest("SHA-256", encoder.encode(str))
  return new Uint8Array(ab)
}

async function sha256_hash_buffer (buf) {
  const ab = await crypto.subtle.digest("SHA-256", buf)
  return new Uint8Array(ab)
}

md5_digest_buffer(hello).forEach((v, i) => assert(v === expected[i]))
md5_digest_string('hello').forEach((v, i) => assert(v === expected[i]))
let u8 = await sha256_hash_string('hello')
u8.forEach((v, i) => assert(v === expectedsha256[i]))
u8 = await sha256_hash_buffer(hello)
u8.forEach((v, i) => assert(v === expectedsha256[i]))

const iter = 3
const runs = 1000000
const bench = new Bench()

while (1) {
/*
{
  for (let i = 0; i < iter; i++) {
    bench.start('md5-string')
    for (let j = 0; j < runs; j++) {
      md5.digest(encoder.encode('hello'))
    }
    bench.end(runs)
  }
}

{
  for (let i = 0; i < iter; i++) {
    bench.start('md5-buffer')
    for (let j = 0; j < runs; j++) {
      md5.digest(hello)
    }
    bench.end(runs)
  }
}
*/
{
  for (let i = 0; i < iter; i++) {
    bench.start('sha256-string')
    for (let j = 0; j < runs; j++) {
      await sha256_hash_string('hello')
    }
    bench.end(runs)
  }
}
/*
{
  for (let i = 0; i < iter; i++) {
    bench.start('sha256-buffer')
    for (let j = 0; j < runs; j++) {
      await sha256_hash_buffer(hello)
    }
    bench.end(runs)
  }
}
*/
}
