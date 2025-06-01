import { Bench } from '../fs/lib/bench.mjs'
import { bind } from './ffi.js'

const { assert, ptr, core, utf8EncodeInto, addr } = lo
const { dlopen, dlsym } = core

const handle = dlopen('./pico.so', 1)
const phr_parse_request = bind(dlsym(handle, 'phr_parse_request'), 'i32', [
  'pointer', 'u32', 'pointer', 'pointer', 'pointer', 'pointer', 
  'pointer', 'pointer', 'pointer', 'u64'
])
const phr_parse_response = bind(dlsym(handle, 'phr_parse_response'), 'i32', [
  'pointer', 'u32', 'pointer', 'pointer', 'pointer', 'pointer', 
  'pointer', 'pointer', 'u32'
])

class ResponseParser {
  minor_version = ptr(new Uint32Array(1))
  status_code = ptr(new Uint32Array(1))
  num_headers = ptr(new Uint32Array(1))
  message = ptr(new Uint32Array(2))
  message_len = ptr(new Uint32Array(1))
  headers = ptr(new Uint32Array(8 * 16))
  rb = new Uint8Array(0)

  constructor (rb) {
    this.rb = rb.ptr ? rb : ptr(rb)
    this.num_headers[0] = 16
    this.parse = (new Function('parse', 'ptr', 'size', `
    return function (len = size) {
      return parse(ptr, len, ${this.minor_version.ptr}, 
        ${this.status_code.ptr}, ${this.message.ptr}, ${this.message_len.ptr}, 
        ${this.headers.ptr}, ${this.num_headers.ptr}, 0)
    }
    `))(phr_parse_response, rb.ptr, rb.size)
  }
}


class RequestParser {
  method = ptr(new Uint32Array(2))
  method_len = ptr(new Uint32Array(2))
  path = ptr(new Uint32Array(2))
  path_len = ptr(new Uint32Array(2))
  minor_version = ptr(new Uint32Array(1))
  headers = ptr(new Uint32Array(8 * 16))
  num_headers = ptr(new Uint32Array(2))
  rb = new Uint8Array(0)

  constructor (rb) {
    this.rb = rb.ptr ? rb : ptr(rb)
    this.num_headers[0] = 16
    this.parse = (new Function('parse', 'ptr', 'size', `
    return function (len = size) {
      return parse(ptr, len, ${this.method.ptr}, 
        ${this.method_len.ptr}, ${this.path.ptr}, ${this.path_len.ptr}, 
        ${this.minor_version.ptr}, ${this.headers.ptr}, ${this.num_headers.ptr}, 0)
    }
    `))(phr_parse_request, rb.ptr, rb.size)
  }
}

function test_response_parser () {
  const parser = new ResponseParser(new Uint8Array(16384))
  const written = utf8EncodeInto('HTTP/1.1 200 OK\r\nContent-Length: 0\r\nServer: foo\r\n\r\n', parser.rb)
  assert(parser.parse(written) === written)
  assert(parser.status_code[0] === 200)
  assert(parser.message_len[0] === 2)
  assert(parser.minor_version[0] === 1)
  assert(parser.num_headers[0] === 2)
}

function test_request_parser () {
  const parser = new RequestParser(new Uint8Array(16384))
  const written = utf8EncodeInto('GET / HTTP/1.1\r\nHost: 127.0.0.1:3000\r\n\r\n', parser.rb)
  assert(parser.parse(written) === written)
  assert(parser.method_len[0] === 3)
  assert(parser.path_len[0] === 1)
  assert(parser.minor_version[0] === 1)
  assert(parser.num_headers[0] === 1)
}

test_response_parser()
test_request_parser()

const iter = 20
const runs = 50000000
const bench = new Bench()
const encoder = new TextEncoder()

const req_buf = encoder.encode('GET / HTTP/1.1\r\n\r\n')
const request_parser = new RequestParser(req_buf)
assert(request_parser.parse() === req_buf.length)

const res_buf = encoder.encode('HTTP/1.1 200 OK\r\n\r\n')
const response_parser = new ResponseParser(res_buf)
assert(response_parser.parse() === res_buf.length)

const parse_request = request_parser.parse
assert(parse_request() === req_buf.length)
const parse_response = response_parser.parse
assert(parse_response() === res_buf.length)

while (1) {
  for (let i = 0; i < iter; i++) {
    bench.start('request_parser')
    for (let j = 0; j < runs; j++) {
      assert(parse_request() === req_buf.length)
    }
    bench.end(runs)
  }

  for (let i = 0; i < iter; i++) {
    bench.start('response_parser')
    for (let j = 0; j < runs; j++) {
      assert(parse_response() === res_buf.length)
    }
    bench.end(runs)
  }
}
