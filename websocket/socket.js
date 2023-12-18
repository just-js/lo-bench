/*
https://datatracker.ietf.org/doc/html/rfc6455#section-5.3

      0                   1                   2                   3
      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
     +-+-+-+-+-------+-+-------------+-------------------------------+
     |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
     |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
     |N|V|V|V|       |S|             |   (if payload len==126/127)   |
     | |1|2|3|       |K|             |                               |
     +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
     |     Extended payload length continued, if payload len == 127  |
     + - - - - - - - - - - - - - - - +-------------------------------+
     |                               |Masking-key, if MASK set to 1  |
     +-------------------------------+-------------------------------+
     | Masking-key (continued)       |          Payload Data         |
     +-------------------------------- - - - - - - - - - - - - - - - +
     :                     Payload Data continued ...                :
     + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
     |                     Payload Data continued ...                |
     +---------------------------------------------------------------+


   Opcode:  4 bits

      Defines the interpretation of the "Payload data".  If an unknown
      opcode is received, the receiving endpoint MUST _Fail the
      WebSocket Connection_.  The following values are defined.

      *  %x0 denotes a continuation frame

      *  %x1 denotes a text frame

      *  %x2 denotes a binary frame

      *  %x3-7 are reserved for further non-control frames

      *  %x8 denotes a connection close

      *  %x9 denotes a ping

      *  %xA denotes a pong

      *  %xB-F are reserved for further control frames

*/
import { bind } from 'lib/ffi.js'
import { encode } from 'lib/encode.js'
import { Compiler } from 'lib/tcc.js'

const { pico } = lo.load('pico')
const {
  assert, core, ptr, utf8Decode, readMemoryAtOffset
} = lo
const { dlsym, dlopen } = core
const { base64_encode } = encode

// TODO: we should be able to come up with a more JS friendly api for pico

class Parser {
  buffer = new ArrayBuffer(556)
  method = ptr(new Uint32Array(this.buffer, 0, 2))
  method_len = ptr(new Uint32Array(this.buffer, 8, 2))
  path = ptr(new Uint32Array(this.buffer, 16, 2))
  path_len = ptr(new Uint32Array(this.buffer, 24, 2))
  minor_version = ptr(new Uint32Array(this.buffer, 32, 1))
  num_headers = ptr(new Uint32Array(this.buffer, 36, 2))
  headers = ptr(new Uint8Array(this.buffer, 44, 32 * 16))
  rb = new Uint8Array(0)
  ptr = 0

  constructor (rb) {
    this.rb = rb
    this.ptr = rb.ptr
    this.parse = (new Function('parse', 'ptr', 'size', `
    return function (len = size) {
      this.num_headers[0] = 16
      return parse(${this.ptr}, len, ${this.method.ptr}, 
        ${this.method_len.ptr}, ${this.path.ptr}, ${this.path_len.ptr}, 
        ${this.minor_version.ptr}, ${this.headers.ptr}, ${this.num_headers.ptr}, 0)
    }
    `))(parse_request, rb.ptr, rb.size)
  }
}

class Request {
  method = ''
  path = ''
  headers = {}
  fd = 0
  minorVersion = 1

  constructor (state, buf, bytes, fd) {
    this.fd = fd
    // TODO: make these lazy loaded property accessors
    const [path_len, , method_len, , , , minorVersion] = state
    const text = utf8Decode(buf.ptr, bytes)
    this.method = text.slice(0, method_len)
    this.path = text.slice(method_len + 1, method_len + 1 + path_len)
    const [, ...headers] = text.split('\r\n').slice(0, -2)
    this.headers = {}
    this.minorVersion = minorVersion
    for (const header of headers) {
      const [name, value] = header.split(': ')
      this.headers[name] = value
    }
  }
}

class WebSocket {
  next = 0
  available = 0
  addr = 0
  size = 0
  buffer = new Uint8Array(0)
  fin = 0
  rsv1 = 0
  rsv2 = 0
  rsv3 = 0
  op_code = 0
  len = 0
  mask = 0
  mask_bytes = ptr(new Uint32Array(1))
  start = 0
  dv = undefined

  constructor (buf) {
    const { ptr, size } = buf
    this.buffer = buf
    this.next = this.addr = ptr
    this.available = this.size = size
    this.dv = new DataView(buf.buffer)
    this.u32 = new Uint32Array(buf.buffer)
    this.u16 = new Uint16Array(buf.buffer)
  }

  message (bytes) {
    const { buffer, mask_bytes, dv } = this
    const [byte0, byte1] = buffer
    this.fin = (byte0 >> 7) & 0x01
    this.op_code = byte0 & 0x0f
    const mask = (byte1 >> 7) & 0x01
    let len = byte1 & 0x7f
    if (len === 126) {
      len = this.u16[1]
      if (mask) {
        mask_bytes[0] = this.u32[1]
        this.start = 8
      } else {
        this.start = 4
      }
    } else if (len === 127) {
      // TODO: can we avoid this?
      //len = Number(dv.getBigUint64(2, true))
      len = dv.getUint32(2, true)
      if (mask) {
        mask_bytes[0] = dv.getUint32(10, true)
        this.start = 14
      } else {
        this.start = 10
      }
    } else if (mask) {
      mask_bytes[0] = dv.getUint32(2, true)
      this.start = 6
    } else {
      this.start = 2
    }
    this.len = len
    this.mask = mask
    this.next = this.addr + bytes
    this.available -= bytes
    return true
  }

  unmask () {
    if (this.mask === 0) return
    const { buffer, len, addr, mask_bytes } = this
    buffer[1] &= 0x7f
    this.mask = 0
    if (!len) {
      this.start -= 4
      return
    }
    const { start } = this
    mask(addr + start, mask_bytes.ptr, len)
    readMemoryAtOffset(buffer, addr + start, len, start - 4)
    this.start -= 4
  }
}

function shasum (str) {
  shacalc(str, digest.ptr, str.length)
  return utf8Decode(dest.ptr, base64_encode(digest, digest.length, 
    dest, dest.size))
}

// TODO: cache/reuse
function create_request (buf, bytes, fd) {
  const req = new Request(state, buf, bytes)
  req.fd = fd
  return req
}

// TODO: don't use Date() in this function
// TODO: don't create a new buffer - encode into an existing one
function create_response (key) {
  const hash = shasum(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
  const res = ptr(encoder.encode(`HTTP/1.1 101 Switching Protocols\r
Server: s\r
Date: ${(new Date()).toUTCString()}\r
Upgrade: WebSocket\r
Connection: Upgrade\r
Sec-WebSocket-Accept: ${hash}\r
\r
`))
  return res
}

// TODO: cache/reuse
function create_parser (buf) {
  return new Parser(buf)
}

const state = ptr(new Uint32Array(24))
const encoder = new TextEncoder()
const digest = ptr(new Uint8Array(20))
const dest = ptr(new Uint8Array(256))

const { readFile } = core
const compiler = new Compiler()
compiler.options('-D_GNU_SOURCE')
//compiler.includes('/usr/include/dis-asm.h')
compiler.paths('/lib/x86_64-linux-gnu/')
const decoder = new TextDecoder()
const src = decoder.decode(readFile('./sws.c'))
compiler.compile(src)

//const handle = assert(dlopen('./sws.so', 1))
const mask = bind(assert(compiler.symbol('mask')), 'void', 
  ['pointer', 'pointer', 'u32'])
const shacalc = bind(assert(compiler.symbol('shacalc')), 'void', 
  ['string', 'pointer', 'i32'])
const { parse_request } = pico
/*
const parse_request = bind(assert(compiler.symbol('phr_parse_request')), 'i32', [
  'pointer', 'u64', 'pointer', 'pointer', 'pointer', 'pointer', 
  'pointer', 'pointer', 'pointer', 'u64'
])
*/

export {
  WebSocket, create_request, create_response, create_parser
}
