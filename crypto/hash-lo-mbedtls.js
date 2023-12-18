import { Bench } from 'lib/bench.mjs'

const { mbedtls } = lo.load('mbedtls')

const { assert, utf8Length, ptr, wrap } = lo

const sizes = {
  md5: 16, sha1: 20, sha256: 32, sha384: 48, sha512: 64
}

const {
  md5_init, md5_free, md5_starts, md5_update, md5_finish, 
  struct_mbedtls_md5_context_size,
  sha256_init, sha256_free, sha256_starts, sha256_update, sha256_finish, 
  struct_mbedtls_sha256_context_size
} = mbedtls


const dest = ptr(new Uint8Array(16))
const ctx = ptr(new Uint8Array(struct_mbedtls_md5_context_size))
md5_init(ctx.ptr)
const sha_dest = ptr(new Uint8Array(32))
const sha_ctx = ptr(new Uint8Array(struct_mbedtls_sha256_context_size))
sha256_init(sha_ctx.ptr)

function md5_hash_string (str) {
  md5_starts(ctx.ptr)
  md5_update(ctx.ptr, str, utf8Length(str))
  md5_finish(ctx.ptr, dest.ptr)
  return dest
}

function md5_hash_buffer (u8) {
  md5_starts(ctx.ptr)
  md5_update(ctx.ptr, u8.ptr, u8.length)
  md5_finish(ctx.ptr, dest.ptr)
  return dest
}

function sha256_hash_buffer (u8) {
  sha256_starts(sha_ctx.ptr, 0)
  sha256_update(sha_ctx.ptr, u8.ptr, u8.length)
  sha256_finish(sha_ctx.ptr, sha_dest.ptr)
  return sha_dest
}

const encoder = new TextEncoder()
const hello = ptr(encoder.encode('hello'))

const expected = [ 
  93, 65, 64, 42, 188, 75, 42, 118, 185, 113, 157, 145, 16, 23, 197, 146 
]
const expectedsha256 = [ 
  44, 242, 77, 186, 95, 176, 163, 14, 38, 232, 59, 42, 197, 185, 226, 158, 27, 
  22, 30, 92, 31, 167, 66, 94, 115, 4, 51, 98, 147, 139, 152, 36 
]

//md5_hash_string('hello').forEach((v, i) => assert(v === expected[i]))
md5_hash_buffer(hello).forEach((v, i) => assert(v === expected[i]))
sha256_hash_buffer(hello).forEach((v, i) => assert(v === expectedsha256[i]))

const iter = parseInt(args[0] || '3', 10)
const runs = parseInt(args[1] || '1000000', 10)
let total = parseInt(args[2] || '1', 10)
const bench = new Bench()

while (total--) {
/*
{
  for (let i = 0; i < iter; i++) {
    bench.start('md5-string')
    for (let j = 0; j < runs; j++) {
      md5_hash_string('hello')
    }
    bench.end(runs)
  }
}
*/
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
    bench.start('sha256-buffer')
    for (let j = 0; j < runs; j++) {
      sha256_hash_buffer(hello)
    }
    bench.end(runs)
  }
}

}

md5_free(ctx.ptr)
