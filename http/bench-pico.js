import { Bench } from 'lib/bench.js'
import { ResponseParser, RequestParser } from 'lib/pico.js'

const { assert, ptr, utf8EncodeInto, addr } = lo

function test_response_parser () {
  const parser = new ResponseParser(new Uint8Array(16384))
  const written = utf8EncodeInto('HTTP/1.1 200 OK\r\nContent-Length: 0\r\nServer: foo\r\n\r\n', parser.rb)
  assert(parser.parse(written) === written)
  //console.log(addr(parser.message))
  assert(parser.status_code[0] === 200)
  assert(parser.message_len[0] === 2)
  assert(parser.minor_version[0] === 1)
  assert(parser.num_headers[0] === 2)
  let n = 0
  for (let i = 0; i < parser.num_headers[0]; i++) {
    const key_address = addr(parser.raw_headers.subarray(n, n + 2))
    const key_len = parser.raw_headers[n + 2]
    const val_address = addr(parser.raw_headers.subarray(n + 4, n + 6))
    const val_len = parser.raw_headers[n + 6]
    n += 8
    //console.log(`${key_address} (${key_len}) : ${val_address} (${val_len}) `)
  }
}

function test_request_parser () {
  const parser = new RequestParser(new Uint8Array(16384))
  const written = utf8EncodeInto('GET / HTTP/1.1\r\nHost: 127.0.0.1:3000\r\n\r\n', parser.rb)
  assert(parser.parse(written) === written)
  //console.log(addr(parser.method))
  //console.log(addr(parser.path))
  assert(parser.method_len[0] === 3)
  assert(parser.path_len[0] === 1)
  assert(parser.minor_version[0] === 1)
  assert(parser.num_headers[0] === 1)
  let n = 0
  for (let i = 0; i < parser.num_headers[0]; i++) {
    const key_address = addr(parser.raw_headers.subarray(n, n + 2))
    const key_len = parser.raw_headers[n + 2]
    const val_address = addr(parser.raw_headers.subarray(n + 4, n + 6))
    const val_len = parser.raw_headers[n + 6]
    n += 8
    //console.log(`${key_address} (${key_len}) : ${val_address} (${val_len}) `)
  }
}

//test_response_parser()
//test_request_parser()

const iter = 5
const runs = 30000000
const bench = new Bench()
const encoder = new TextEncoder()

const request_parser = new RequestParser(encoder.encode('GET / HTTP/1.1\r\nHost: 127.0.0.1:3000\r\n\r\n'))
assert(request_parser.parse() === 40)

const response_parser = new ResponseParser(encoder.encode('HTTP/1.1 200 OK\r\nContent-Length: 0\r\nServer: foo\r\n\r\n'))
assert(response_parser.parse() === 51)

const parse_request = request_parser.parse
assert(parse_request() === 40)
const parse_response = response_parser.parse
assert(parse_response() === 51)

while (1) {
  for (let i = 0; i < iter; i++) {
    bench.start('request_parser')
    for (let j = 0; j < runs; j++) {
      parse_request()
    }
    bench.end(runs)
  }

  for (let i = 0; i < iter; i++) {
    bench.start('response_parser')
    for (let j = 0; j < runs; j++) {
      parse_response()
    }
    bench.end(runs)
  }
}
