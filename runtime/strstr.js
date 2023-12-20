import { bind } from 'lib/ffi.js'
import { Bench } from 'lib/bench.js'

const { core, assert, wrap , ptr} = lo
const { dlsym, dlopen, strnlen_str } = core

const handle = new Uint32Array(2)

//console.log(dlsym(0, 'strstr'))
//console.log(dlsym(0, 'memmem'))

console.log(dlsym(dlopen('/lib/x86_64-linux-gnu/libc.so.6', 1), 'memmem'))

//const fn_ptr = bind(dlsym(0, 'memmem'), 'pointer', ['pointer', 'u32', 'pointer', 'u32'])
//const memmem = wrap(handle, fn_ptr, 4)
const memmem = wrap(handle, core.memmem, 4)

const encoder = new TextEncoder()
const search_str = '0'.repeat(1024 * 1024) + 'hello' + '1'.repeat(1024 * 1024)
const str_buf = ptr(encoder.encode(search_str))

//console.log(str_buf.ptr)
//console.log(memmem(str_buf, str_buf.length, 'e', 1))

function find_str_in_buffer (haystack, needle) {
  const start = memmem(haystack.ptr, haystack.length, needle.ptr, needle.length)
  if (start === 0) return 0
  return start - haystack.ptr
}

const bench = new Bench()
const iter = 5
const runs = 5000

const hello = ptr(encoder.encode('hello'))
console.log(find_str_in_buffer(str_buf, hello))
console.log(search_str.indexOf('hello'))

for (let i = 0; i < iter; i++) {
  bench.start('memmem')
  for (let j = 0; j < runs; j++) {
    assert(search_str.indexOf('hello') === 1048576)
    //assert(find_str_in_buffer(str_buf, hello) === 1048576)
  }
  bench.end(runs)
}
