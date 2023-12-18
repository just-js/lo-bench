import { Bench } from 'lib/bench.mjs'

const { libssl } = lo.load('libssl')

const { assert, utf8Length, ptr, wrap } = lo

const sizes = {
  md5: 16, sha1: 20, sha256: 32, sha384: 48, sha512: 64
}

const handle = new Uint32Array(2)

libssl.EVP_get_digestbyname = wrap(handle, libssl.EVP_get_digestbyname, 1)
libssl.EVP_MD_CTX_new = wrap(handle, libssl.EVP_MD_CTX_new, 0)

const {
  EVP_get_digestbyname, EVP_MD_CTX_new, EVP_DigestInit_ex, 
  EVP_DigestUpdateBuffer, EVP_DigestFinal, EVP_MD_CTX_reset,
  EVP_DigestUpdateString
} = libssl


const md5_hasher = EVP_get_digestbyname('md5')
const md5_hsize = new Uint32Array(2)
const md5_digest = ptr(new Uint8Array(sizes['md5']))
const md5_ctx = EVP_MD_CTX_new()

const sha256_hasher = EVP_get_digestbyname('sha256')
const sha256_hsize = new Uint32Array(2)
const sha256_digest = ptr(new Uint8Array(sizes['sha256']))
const sha256_ctx = EVP_MD_CTX_new()

function md5_hash_string (str) {
  assert(EVP_DigestInit_ex(md5_ctx, md5_hasher, 0) === 1)
  assert(EVP_DigestUpdateString(md5_ctx, str, utf8Length(str)) === 1)
  assert(EVP_DigestFinal(md5_ctx, md5_digest, md5_hsize) === 1)
  EVP_MD_CTX_reset(md5_ctx)
  return md5_digest
}

function md5_hash_buffer (u8) {
  assert(EVP_DigestInit_ex(md5_ctx, md5_hasher, 0) === 1)
  assert(EVP_DigestUpdateBuffer(md5_ctx, u8, u8.length) === 1)
  assert(EVP_DigestFinal(md5_ctx, md5_digest, md5_hsize) === 1)
  EVP_MD_CTX_reset(md5_ctx)
  return md5_digest
}

function sha256_hash_string (str) {
  assert(EVP_DigestInit_ex(sha256_ctx, sha256_hasher, 0) === 1)
  assert(EVP_DigestUpdateString(sha256_ctx, str, utf8Length(str)) === 1)
  assert(EVP_DigestFinal(sha256_ctx, sha256_digest, sha256_hsize) === 1)
  EVP_MD_CTX_reset(sha256_ctx)
  return sha256_digest
}

function sha256_hash_buffer (u8) {
  assert(EVP_DigestInit_ex(sha256_ctx, sha256_hasher, 0) === 1)
  assert(EVP_DigestUpdateBuffer(sha256_ctx, u8, u8.length) === 1)
  assert(EVP_DigestFinal(sha256_ctx, sha256_digest, sha256_hsize) === 1)
  EVP_MD_CTX_reset(sha256_ctx)
  return sha256_digest
}

const encoder = new TextEncoder()
const hello = encoder.encode('hello')

const expected = [ 
  93, 65, 64, 42, 188, 75, 42, 118, 185, 113, 157, 145, 16, 23, 197, 146 
]
const expectedsha256 = [ 
  44, 242, 77, 186, 95, 176, 163, 14, 38, 232, 59, 42, 197, 185, 226, 158, 27, 
  22, 30, 92, 31, 167, 66, 94, 115, 4, 51, 98, 147, 139, 152, 36 
]

md5_hash_string('hello').forEach((v, i) => assert(v === expected[i]))
md5_hash_buffer(hello).forEach((v, i) => assert(v === expected[i]))
sha256_hash_string('hello').forEach((v, i) => assert(v === expectedsha256[i]))
sha256_hash_buffer(hello).forEach((v, i) => assert(v === expectedsha256[i]))

const iter = parseInt(args[0] || '3', 10)
const runs = parseInt(args[1] || '1000000', 10)
let total = parseInt(args[2] || '1', 10)
const bench = new Bench()

while (total--) {

{
  for (let i = 0; i < iter; i++) {
    bench.start('md5-string')
    for (let j = 0; j < runs; j++) {
      md5_hash_string('hello')
    }
    bench.end(runs)
  }
}

{
  for (let i = 0; i < iter; i++) {
    bench.start('md5-buffer')
    for (let j = 0; j < runs; j++) {
      md5_hash_buffer(hello)
    }
    bench.end(runs)
  }
}


{
  for (let i = 0; i < iter; i++) {
    bench.start('sha256-string')
    for (let j = 0; j < runs; j++) {
      sha256_hash_string('hello')
    }
    bench.end(runs)
  }
}

{
  for (let i = 0; i < iter; i++) {
    bench.start('sha256-buffer')
    for (let j = 0; j < runs; j++) {
      sha256_hash_buffer(hello)
    }
    bench.end(runs)
  }
}

}
