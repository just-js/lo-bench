import { RequestParser, ResponseParser } from 'lib/pico.js'
import { Bench } from 'lib/bench.js'

const { assert, utf8EncodeInto } = lo

function parse_response () {
  return response_parser.parse(BUFSIZE)
}

function parse_request () {
  return request_parser.parse(BUFSIZE)
}

const bench = new Bench()
const BUFSIZE = 16384
const iter = 5
const requests = []
const responses = []
const response_parser = new ResponseParser(new Uint8Array(BUFSIZE), 32)
const request_parser = new RequestParser(new Uint8Array(BUFSIZE), 32)

responses.push({ text: `HTTP/1.1 301 Moved Permanently\r
Location: https://www.google.com/\r
Content-Type: text/html; charset=UTF-8\r
Content-Security-Policy-Report-Only: object-src 'none';base-uri 'self';script-src 'nonce-sAF4EzNgq7qyAN9ohVlBXQ' 'strict-dynamic' 'report-sample' 'unsafe-eval' 'unsafe-inline' https: http:;report-uri https://csp.withgoogle.com/csp/gws/other-hp\r
Date: Thu, 14 Dec 2023 15:27:46 GMT\r
Expires: Thu, 14 Dec 2023 15:27:46 GMT\r
Cache-Control: private, max-age=2592000\r
Server: gws\r
Content-Length: 220\r
X-XSS-Protection: 0\r
X-Frame-Options: SAMEORIGIN\r
Set-Cookie: CONSENT=PENDING+425; expires=Sat, 13-Dec-2025 15:27:46 GMT; path=/; domain=.google.com; Secure\r
P3P: CP="This is not a P3P policy! See g.co/p3phelp for more info."\r
Alt-Svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000\r
\r\n`, runs: 3000000 })

for (let t = 0; t < responses.length; t++) {
  const test = responses[t]
  assert(utf8EncodeInto(test.text, response_parser.rb) === parse_response())
  const runs = test.runs
  for (let i = 0; i < iter; i++) {
    bench.start(`parse_response.${t}`)
    for (let j = 0; j < runs; j++) parse_response()
    bench.end(runs)
  }
}

requests.push({ text: `GET / HTTP/1.1\r
Host: 127.0.0.1:3000\r
Accept: */*\r
\r\n`, runs: 20000000 })

for (let t = 0; t < requests.length; t++) {
  const test = requests[t]
  assert(utf8EncodeInto(test.text, request_parser.rb) === parse_request())
  const runs = test.runs
  for (let i = 0; i < iter; i++) {
    bench.start(`parse_request.${t}`)
    for (let j = 0; j < runs; j++) parse_request()
    bench.end(runs)
  }
}
