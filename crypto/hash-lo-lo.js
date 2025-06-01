import { Bench } from '../fs/lib/bench.mjs'

let libssl
if (lo.getenv('LOSSL') === 'boringssl') {
  libssl = lo.load('boringssl').boringssl
} else {
  libssl = lo.load('libssl').libssl
}

const { assert, ptr, wrap } = lo

const sizes = {
  md5: 16, sha1: 20, sha256: 32, sha384: 48, sha512: 64
}

const handle = new Uint32Array(2)

libssl.EVP_get_digestbyname = wrap(handle, libssl.EVP_get_digestbyname, 1)
libssl.EVP_MD_CTX_new = wrap(handle, libssl.EVP_MD_CTX_new, 0)

const {
  EVP_get_digestbyname, EVP_MD_CTX_new, EVP_DigestInit_ex, 
  EVP_DigestUpdateBuffer, EVP_DigestUpdate, EVP_DigestFinal, EVP_MD_CTX_reset,
  EVP_DigestUpdateString, EVP_DigestFinal_ex
} = libssl


const md5_hasher = EVP_get_digestbyname('md5')
const md5_hsize = new Uint32Array(2)
const md5_digest = ptr(new Uint8Array(sizes.md5))
const md5_ctx = EVP_MD_CTX_new()

const sha1_hasher = EVP_get_digestbyname('sha1')
const sha1_hsize = new Uint32Array(2)
const sha1_digest = ptr(new Uint8Array(sizes.sha1))
const sha1_ctx = EVP_MD_CTX_new()

const sha256_hasher = EVP_get_digestbyname('sha256')
const sha256_hsize = new Uint32Array(2)
const sha256_digest = ptr(new Uint8Array(sizes.sha256))
const sha256_ctx = EVP_MD_CTX_new()

function md5_hash_string (str) {
  assert(EVP_DigestInit_ex(md5_ctx, md5_hasher, 0) === 1)
  assert(EVP_DigestUpdateString(md5_ctx, str) === 1)
  assert(EVP_DigestFinal_ex(md5_ctx, md5_digest, md5_hsize) === 1)
//  EVP_MD_CTX_reset(md5_ctx)
  return md5_digest
}

function md5_hash_ptr (u8) {
  assert(EVP_DigestInit_ex(md5_ctx, md5_hasher, 0) === 1)
  assert(EVP_DigestUpdate(md5_ctx, u8.ptr, u8.length) === 1)
  assert(EVP_DigestFinal_ex(md5_ctx, md5_digest, md5_hsize) === 1)
//  EVP_MD_CTX_reset(md5_ctx)
  return md5_digest
}

function md5_hash_buffer (u8) {
  assert(EVP_DigestInit_ex(md5_ctx, md5_hasher, 0) === 1)
  assert(EVP_DigestUpdateBuffer(md5_ctx, u8, u8.length) === 1)
  assert(EVP_DigestFinal_ex(md5_ctx, md5_digest, md5_hsize) === 1)
//  EVP_MD_CTX_reset(md5_ctx)
  return md5_digest
}

function sha1_hash_string (str) {
  assert(EVP_DigestInit_ex(sha1_ctx, sha1_hasher, 0) === 1)
  assert(EVP_DigestUpdateString(sha1_ctx, str) === 1)
  assert(EVP_DigestFinal_ex(sha1_ctx, sha1_digest, sha1_hsize) === 1)
//  EVP_MD_CTX_reset(sha1_ctx)
  return sha1_digest
}

function sha1_hash_ptr (u8) {
  assert(EVP_DigestInit_ex(sha1_ctx, sha1_hasher, 0) === 1)
  assert(EVP_DigestUpdate(sha1_ctx, u8.ptr, u8.length) === 1)
  assert(EVP_DigestFinal_ex(sha1_ctx, sha1_digest, sha1_hsize) === 1)
//  EVP_MD_CTX_reset(sha1_ctx)
  return sha1_digest
}

function sha1_hash_buffer (u8) {
  assert(EVP_DigestInit_ex(sha1_ctx, sha1_hasher, 0) === 1)
  assert(EVP_DigestUpdateBuffer(sha1_ctx, u8, u8.length) === 1)
  assert(EVP_DigestFinal_ex(sha1_ctx, sha1_digest, sha1_hsize) === 1)
//  EVP_MD_CTX_reset(sha1_ctx)
  return sha1_digest
}

function sha256_hash_string (str) {
  assert(EVP_DigestInit_ex(sha256_ctx, sha256_hasher, 0) === 1)
  assert(EVP_DigestUpdateString(sha256_ctx, str) === 1)
  assert(EVP_DigestFinal_ex(sha256_ctx, sha256_digest, sha256_hsize) === 1)
//  EVP_MD_CTX_reset(sha256_ctx)
  return sha256_digest
}

// we could generate an assembly wrapper that just chained these calls together into one call

function sha256_hash_ptr (u8) {
  assert(EVP_DigestInit_ex(sha256_ctx, sha256_hasher, 0) === 1)
  assert(EVP_DigestUpdate(sha256_ctx, u8.ptr, u8.length) === 1)
  assert(EVP_DigestFinal_ex(sha256_ctx, sha256_digest, sha256_hsize) === 1)
//  EVP_MD_CTX_reset(sha256_ctx)
  return sha256_digest
}

function sha256_hash_buffer (u8) {
  assert(EVP_DigestInit_ex(sha256_ctx, sha256_hasher, 0) === 1)
  assert(EVP_DigestUpdateBuffer(sha256_ctx, u8, u8.length) === 1)
  assert(EVP_DigestFinal_ex(sha256_ctx, sha256_digest, sha256_hsize) === 1)
//  EVP_MD_CTX_reset(sha256_ctx)
  return sha256_digest
}

const encoder = new TextEncoder()
const hello = ptr(encoder.encode('hello'))

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

md5_hash_string('hello').forEach((v, i) => assert(v === expected[i]))
md5_hash_buffer(hello).forEach((v, i) => assert(v === expected[i]))
md5_hash_ptr(hello).forEach((v, i) => assert(v === expected[i]))
sha1_hash_string('hello').forEach((v, i) => assert(v === expectedsha1[i]))
sha1_hash_buffer(hello).forEach((v, i) => assert(v === expectedsha1[i]))
sha1_hash_ptr(hello).forEach((v, i) => assert(v === expectedsha1[i]))
sha256_hash_string('hello').forEach((v, i) => assert(v === expectedsha256[i]))
sha256_hash_buffer(hello).forEach((v, i) => assert(v === expectedsha256[i]))
sha256_hash_ptr(hello).forEach((v, i) => assert(v === expectedsha256[i]))

const iter = parseInt(args[0] || '5', 10)
const runs = parseInt(args[1] || '3000000', 10)
let total = parseInt(args[2] || '1', 10)
const bench = new Bench()

while (total--) {

{
  for (let i = 0; i < iter; i++) {
    bench.start('md5-string')
    for (let j = 0; j < runs; j++) {
      assert(md5_hash_string('hello').length === 16)
    }
    bench.end(runs, 5)
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
    bench.start('md5-pointer')
    for (let j = 0; j < runs; j++) {
      md5_hash_ptr(hello)
    }
    bench.end(runs)
  }
}

{
  for (let i = 0; i < iter; i++) {
    bench.start('sha1-string')
    for (let j = 0; j < runs; j++) {
      sha1_hash_string('hello')
    }
    bench.end(runs)
  }
}

{
  for (let i = 0; i < iter; i++) {
    bench.start('sha1-pointer')
    for (let j = 0; j < runs; j++) {
      sha1_hash_ptr(hello)
    }
    bench.end(runs)
  }
}

{
  for (let i = 0; i < iter; i++) {
    bench.start('sha1-buffer')
    for (let j = 0; j < runs; j++) {
      sha1_hash_buffer(hello)
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

{
  for (let i = 0; i < iter; i++) {
    bench.start('sha256-pointer')
    for (let j = 0; j < runs; j++) {
      sha256_hash_ptr(hello)
    }
    bench.end(runs)
  }
}

}
