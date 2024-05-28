import { Bench } from 'lib/bench.mjs'

const { ada } = lo.load('ada')

const { wrap, ptr, assert, utf8_length, uft8_encode_into, wrap_memory } = lo

const ada_parse = wrap(new Uint32Array(2), ada.ada_parse, 2)
const ada_parse_str = wrap(new Uint32Array(2), ada.ada_parse_str, 2)
const ada_get_components = wrap(new Uint32Array(2), ada.ada_get_components, 1)
const { ada_free, ada_can_parse, ada_can_parse_str } = ada

const url = 'https://codeload.github.com/WireGuard/wireguard-tools/tar.gz/master'

const urlb = ptr(new Uint8Array(1 * 1024 * 1024))

const ada_url = assert(ada_parse(urlb.ptr, uft8_encode_into(url, urlb)))
const comp_addr = assert(ada_get_components(ada_url))
ada_free(ada_url)

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

assert(ada_can_parse(urlb.ptr, uft8_encode_into(url, urlb)) === 1)
assert(ada_can_parse_str(url, utf8_length(url)) === 1)

const bench = new Bench()
const runs = 6000000

while (1) {

  for (let i = 0; i < 5; i++) {
    bench.start('ada_can_parse')
    for (let j = 0; j < runs; j++) {
      assert(ada_can_parse(urlb.ptr, uft8_encode_into(url, urlb)) === 1)
    }
    bench.end(runs)
  }

  for (let i = 0; i < 5; i++) {
    bench.start('ada_can_parse_str')
    for (let j = 0; j < runs; j++) {
      assert(ada_can_parse_str(url, utf8_length(url)) === 1)
    }
    bench.end(runs)
  }

  for (let i = 0; i < 5; i++) {
    bench.start('ada_parse')
    for (let j = 0; j < runs; j++) {
      ada_free(assert(ada_parse(urlb.ptr, uft8_encode_into(url, urlb))))
    }
    bench.end(runs)
  }

  for (let i = 0; i < 5; i++) {
    bench.start('ada_parse_str')
    for (let j = 0; j < runs; j++) {
      ada_free(assert(ada_parse_str(url, utf8_length(url))))
    }
    bench.end(runs)
  }
}
