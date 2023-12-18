import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { libssl } from 'lib/libssl.js'
import { ResponseParser, parse_url, pico } from 'lib/pico.js'
import { Resolver } from 'lib/dns/dns.js'

const { assert, ptr } = lo
const { socket, connect, close } = net
const { sockaddr_in } = net.types
const { Blocked } = Loop
const { 
  SOCK_STREAM, AF_INET, SOCKADDR_LEN, EINPROGRESS, SOCK_NONBLOCK
} = net
const {
  SSL_set_fd, SSL_set_connect_state, SSL_do_handshake, SSL_free, SSL_read, 
  SSL_write_string, SSL_get_error, TLS_client_method, SSL_CTX_new, SSL_new, 
  SSL_ERROR_WANT_READ, SSL_ERROR_WANT_WRITE, default_options, SSL_CTX_set_options,
  SSL_shutdown
} = libssl

function close_socket (fd, loop) {
  if (!sockets.has(fd)) return
  const socket = sockets.get(fd)
  if (socket.ssl > 0) SSL_free(socket.ssl)
  if (fd > 0) {
    if (loop) loop.remove(fd)
    sockets.delete(fd)
    close(fd)
  }
  socket.ssl = 0
  socket.fd = 0
}

function create_secure_socket (fd, ctx) {
  const ssl = assert(SSL_new(ctx))
  assert(SSL_set_fd(ssl, fd) === 1)
  SSL_set_connect_state(ssl)
  const buf = new Uint8Array(BUFSIZE)
  return {
    parser: new ResponseParser(buf), fd, ssl, state: INSECURE
  }
}

function set_secure (socket) {
  const { ssl, state, fd } = socket
  if (state === SECURE) return true
  const rc = SSL_do_handshake(ssl)
  if (rc === 1) {
    socket.state = SECURE
    return true
  } else if (rc === 0) {
    close_socket(fd)
    return false
  }
  const err = SSL_get_error(ssl, rc)
  if (err === SSL_ERROR_WANT_READ || 
    err === SSL_ERROR_WANT_WRITE) return false
  close_socket(fd)
  return false
}

function get_socket (address, port, protocol, loop) {
  const key = `${protocol}:${address}:${port}`
  if (!sockets.has(key)) {
    const sock = sockets.get(key)
    sockets.delete(key)
    return sock
  }
  const sock = new Socket(address, port, loop)
  if (protocol === 'https') sock.set_secure()
  sockets.set(key, sock)
  return sock
}

class TLS {
  ctx = undefined

  constructor () {
    const method = assert(TLS_client_method())
    let ctx
    if (protocol === 'https') {
      ctx = assert(SSL_CTX_new(method))
      SSL_CTX_set_options(ctx, default_options | libssl.SSL_OP_NO_COMPRESSION | libssl.SSL_MODE_RELEASE_BUFFERS)
    }
  }
}

const noop = () => {}

function http_get (url, loop, callback) {
  const { protocol, hostname, path, port } = parse_url(url)
  const resolver = new Resolver(loop)
  let headers_done = false
  let chunked = false
  let content_length = 0
  let start = 0
  let body_bytes = 0
  const sz = ptr(new Uint32Array(2))
  const chunk_decoder = ptr(new Uint8Array(pico.struct_phr_chunked_decoder_size))
  //const payload = `GET ${path} HTTP/1.1\r\nHost: ${hostname}${(port === 80 || port === 443) ? '' : ':' + port}\r\nConnection: close\r\nAccept: */*\r\n\r\n`
  const payload = `GET ${path} HTTP/1.1\r\nHost: ${hostname}${(port === 80 || port === 443) ? '' : ':' + port}\r\nAccept: */*\r\n\r\n`
  resolver.lookup(hostname, (err, ip) => {
    if (err) return callback(err)
    const method = assert(TLS_client_method())
    let ctx
    if (protocol === 'https') {
      ctx = assert(SSL_CTX_new(method))
      SSL_CTX_set_options(ctx, default_options | libssl.SSL_OP_NO_COMPRESSION | libssl.SSL_MODE_RELEASE_BUFFERS)
    }
    const fd = socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK, 0)
    assert(connect(fd, sockaddr_in(ip, port), SOCKADDR_LEN) > 0 || lo.errno === EINPROGRESS)
    assert(loop.add(fd, () => {
      const socket = create_secure_socket(fd, ctx)
      sockets.set(fd, socket)
      assert(loop.modify(fd, fd => {
        const { parser, ssl, state } = socket
        if (state === INSECURE && set_secure(socket)) {
          SSL_write_string(socket.ssl, payload)
          return
        }
        const bytes = SSL_read(ssl, parser.rb.ptr + start, BUFSIZE - start)
        if (bytes > 0) {
          if (headers_done) {
            if (chunked) {
              sz[0] = bytes
              const rc = pico.decode_chunked(chunk_decoder.ptr, parser.rb.ptr, sz.ptr)
              if (rc === -2 || rc > 0) {
                //if (sz[0] > 0) {
                  socket.response.on_bytes(parser.rb.subarray(0, sz[0]))
                //}
                body_bytes += sz[0]
                if (rc > 0) {
                  socket.response.body_bytes = body_bytes
                  socket.response.on_complete()       
                }
              } else {
                console.log('error decoding')
                close_socket(fd, loop)
              }
            } else {
              socket.response.on_bytes(parser.rb.subarray(0, bytes))
              body_bytes += bytes
              if (body_bytes === content_length) {
                socket.response.body_bytes = body_bytes
                socket.response.on_complete()       
              }
            }
            return
          } else {
            const parsed = parser.parse(bytes + start)
            if (parsed > 0) {
              const { status, headers } = parser
              if (headers.transfer_encoding && headers.transfer_encoding === 'chunked') {
                chunked = true
              } else {
                content_length = parseInt(headers.content_length || '0', 10)
              }
              const response = {
                fd,
                status, 
                content_length,
                chunked,
                body_bytes,
                minor_version: parser.minor_version,
                num_headers: parser.num_headers,
                message: parser.message,
                headers: {},
                on_complete: noop,
                on_bytes: noop,
                on_error: noop,
                close: () => close_socket(fd, loop)
              }
              Object.assign(response.headers, headers)
              callback(null, response)
              socket.response = response
              if (parsed < bytes + start) {
                const remaining = (bytes + start) - parsed
                if (chunked) {
                  sz[0] = remaining
                  const rc = pico.decode_chunked(chunk_decoder.ptr, parser.rb.ptr + parsed, sz.ptr)
                  if (rc === -2 || rc > 0) {
                    socket.response.on_bytes(parser.rb.subarray(parsed, parsed + sz[0]))
                    body_bytes += sz[0]
                    if (rc > 0) {
                      socket.response.body_bytes = body_bytes
                      socket.response.on_complete()       
                    }
                  } else {
                    console.log('error decoding')
                    close_socket(fd, loop)
                  }
                } else {
                  body_bytes += remaining
                  socket.response.on_bytes(parser.rb.subarray(parsed, parsed + remaining))
                  if (body_bytes === content_length) {
                    socket.response.body_bytes = body_bytes
                    socket.response.on_complete()       
                  }
                }
              }
              headers_done = true
              start = 0
              return
            }
            if (parsed === -2) {
              start += bytes
              return
            }
            close_socket(fd, loop)
            return
          }
        }
        if (bytes < 0 && lo.errno === Blocked) return
        //close_socket(fd, loop)          
      }, Loop.Readable, () => close_socket(fd, loop)) === 0)
      if (set_secure(socket)) SSL_write_string(socket.ssl, payload)
    }, Loop.Writable | Loop.EdgeTriggered, () => close_socket(fd, loop)) === 0)
  })
}

function fetch (url, loop = globalThis.loop) {
  return new Promise ((resolve, reject) => {
    http_get(url, loop, (err, res) => {
      if (err) {
        reject(err)
        return
      }
      const { content_length = 0 } = res

      const body = new Uint8Array(content_length || (1 * 1024 * 1024 * 1024))
      let off = 0
      let promise_resolve
      let promise_reject

      res.on_bytes = buf => {
        body.set(buf, off)
        off += buf.length
      }

      const p = new Promise((resolve, reject) => {
        promise_resolve = resolve
        promise_reject = reject
      })

      res.bytes = () => {
        return p
      }

      res.on_complete = () => {
//        res.close()
        promise_resolve(body.subarray(0, off))
      }

      res.on_error = err => {
        promise_reject(err)
      }

      lo.nextTick(() => resolve(res))

    })
  })  
}

const BUFSIZE = 65536
const INSECURE = 0
const SECURE = 1
const sockets = new Map()

export { fetch, http_get }
