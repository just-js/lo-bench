import { Bench } from '../fs/lib/bench.mjs'

const { ada } = lo.load('ada')

const { wrap, ptr, assert, utf8_length, utf8_encode_into, wrap_memory } = lo

const parse = wrap(new Uint32Array(2), ada.parse, 2)
const parse_str = wrap(new Uint32Array(2), ada.parse_str, 2)
const get_components = wrap(new Uint32Array(2), ada.get_components, 1)
const { free, can_parse, can_parse_str, can_parse_str2 } = ada

const url = 'https://codeload.github.com/WireGuard/wireguard-tools/tar.gz/master'

const urlb = ptr(new Uint8Array(1 * 1024 * 1024))

const ada_url = assert(parse(urlb.ptr, utf8_encode_into(url, urlb)))
const comp_addr = assert(get_components(ada_url))
console.log(assert(get_components(ada_url)))
console.log(assert(get_components(ada_url)))
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

assert(can_parse(urlb.ptr, utf8_encode_into(url, urlb)) === 1)
assert(can_parse_str(url, utf8_length(url)) === 1)

const expected = utf8_length(url)

const bench = new Bench()
const runs = 6000000

while (1) {
/*
  for (let i = 0; i < 5; i++) {
    bench.start('ada_can_parse')
    for (let j = 0; j < runs; j++) {
      assert(can_parse(urlb.ptr, utf8_encode_into(url, urlb)) === 1)
    }
    bench.end(runs, expected)
  }
*/
  for (let i = 0; i < 5; i++) {
    bench.start('ada_can_parse_str')
    for (let j = 0; j < runs; j++) {
      // we could embed the utf8 length call into the assembly and just pass the string
      assert(can_parse_str(url, utf8_length(url)) === 1)
    }
    bench.end(runs, expected)
  }

  for (let i = 0; i < 5; i++) {
    bench.start('ada_can_parse_str2')
    for (let j = 0; j < runs; j++) {
      assert(can_parse_str2(url) === 1)
    }
    bench.end(runs, expected)
  }
/*
  for (let i = 0; i < 5; i++) {
    bench.start('ada_parse')
    for (let j = 0; j < runs; j++) {
      free(assert(parse(urlb.ptr, utf8_encode_into(url, urlb))))
    }
    bench.end(runs, expected)
  }


  for (let i = 0; i < 5; i++) {
    bench.start('ada_parse_str')
    for (let j = 0; j < runs; j++) {
      free(assert(parse_str(url, utf8_length(url))))
    }
    bench.end(runs, expected)
  }
*/
}
