import { bind } from 'lib/ffi.js'
import { Bench } from 'lib/bench.mjs'
import { stringify } from 'lib/stringify.js'

const { core, assert, wrap, utf8_length, wrap_memory, ptr, cstr, addr } = lo
const { dlopen, dlsym } = core

const handle = assert(dlopen('./ada.so', 1))

const free = bind(assert(dlsym(handle, 'ada_free')), 'void', ['pointer'])
const h = new Uint32Array(2)
const parse = wrap(h, bind(assert(dlsym(handle, 'ada_parse')), 'pointer', ['pointer', 'u32']), 3)
const get_components = wrap(h, bind(assert(dlsym(handle, 'ada_get_components')), 'pointer', ['pointer']), 1)

const encoder = new TextEncoder()
const url = 'https://codeload.github.com/WireGuard/wireguard-tools/tar.gz/master'
const urlb = ptr(encoder.encode(url))

const ada_url = assert(parse(urlb.ptr, urlb.length))
const comp_addr = assert(get_components(ada_url))
free(ada_url)
const buf = wrap_memory(comp_addr, 32, 0)
const [
  protocol_end, username_end, host_start, host_end, port, pathname_start,
  search_start, hash_start
] = new Int32Array(buf.buffer)
assert(protocol_end === 6)
assert(username_end === 8)
assert(host_start === 8)
assert(host_end === 27)
assert(port === -1)
assert(pathname_start === 27)
assert(search_start === -1)
assert(hash_start === -1)

const bench = new Bench()
const runs = 12000000

for (let i = 0; i < 5; i++) {
  bench.start('URL')
  for (let j = 0; j < runs; j++) {
    free(assert(parse(urlb.ptr, utf8_length(url))))
  }
  bench.end(runs)
}

