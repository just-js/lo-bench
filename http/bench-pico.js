import { Bench } from '../fs/lib/bench.mjs'
import { ResponseParser, RequestParser } from 'lib/pico.js'

const { assert, utf8EncodeInto } = lo

function test_response_parser () {
  const parser = new ResponseParser(new Uint8Array(16384))
  const written = utf8EncodeInto('HTTP/1.1 200 OK\r\n\r\n', parser.rb)
  assert(parser.parse(written) === written)
  assert(parser.message === 'OK')
  assert(parser.status === 200)
  assert(parser.minor_version === 1)
  assert(parser.num_headers === 0)
}

function test_request_parser () {
  const parser = new RequestParser(new Uint8Array(16384))
  const written = utf8EncodeInto('GET / HTTP/1.1\r\n\r\n', parser.rb)
  assert(parser.parse(written) === written)
  assert(parser.method === 'GET')
  assert(parser.path === '/')
  assert(parser.minor_version === 1)
  assert(parser.num_headers === 0)
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
/*
  for (let i = 0; i < iter; i++) {
    bench.start('response_parser')
    for (let j = 0; j < runs; j++) {
      assert(parse_response() === res_buf.length)
    }
    bench.end(runs)
  }
*/
}
