import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Timer } from 'lib/timer.js'
import { RequestParser } from 'lib/pico.js'
import { mem } from 'lib/proc.js'

const { libssl } = lo.load('libssl')

const { assert, utf8Length, wrap, cstr, core } = lo
const { fcntl, O_NONBLOCK, F_SETFL } = core
const { 
  socket, bind, listen, accept, send_string, close, setsockopt
} = net
const {
  SOCK_STREAM, AF_INET, SOMAXCONN, SO_REUSEPORT, SOL_SOCKET
} = net
const {
  SSL_OP_ALL, SSL_OP_NO_RENEGOTIATION, SSL_OP_NO_SSLv3, SSL_OP_NO_TLSv1, 
  SSL_OP_NO_TLSv1_1, SSL_OP_NO_DTLSv1, SSL_OP_NO_DTLSv1_2, SSL_FILETYPE_PEM
} = libssl
const {
  SSL_CTX_set_options, SSL_set_fd, SSL_set_accept_state, SSL_accept, 
  SSL_get_error, SSL_CTX_use_certificate_chain_file, SSL_CTX_use_PrivateKey_file, 
  SSL_read, SSL_write_string, SSL_free
} = libssl
const { sockaddr_in } = net.types
const { Blocked } = Loop
const SOCKADDR_LEN = 16

function on_timer () {
  console.log(`rps ${stats.rps} rss ${mem()} conn ${stats.conn} sockets ${sockets.size}`)
  stats.rps = 0
  plaintext = `content-type: text/plain;charset=utf-8\r\nDate: ${(new Date()).toUTCString()}\r\n`
}

function status_line (status = 200, message = 'OK') {
  return `HTTP/1.1 ${status} ${message}\r\n`
}

function close_socket (socket) {
  if (!socket) return
  const { fd, ssl } = socket
  if (ssl > 0) {
    SSL_free(ssl)
  }
  if (fd > 0) {
    loop.remove(fd)
    sockets.delete(fd)
    close(fd)
    stats.conn--
  }
  socket.ssl = 0
  socket.fd = 0
}

function on_socket_event (fd) {
  const socket = sockets.get(fd)
  const { parser, ssl, state } = socket
  if (state === INSECURE) {
    const rc = SSL_accept(ssl)
    if (rc === 1) {
      socket.state = SECURE
    }
    if (rc === 0) {
      close_socket(socket)
      return
    }
    if (rc === -1) {
      const err = SSL_get_error(ssl, rc)
      if (err === libssl.SSL_ERROR_WANT_READ) return
      if (err === libssl.SSL_ERROR_WANT_WRITE) return
    }
    return
  }
  const bytes = SSL_read(ssl, parser.rb.ptr, BUFSIZE)
  if (bytes > 0) {
    const parsed = parser.parse(bytes)
    if (parsed > 0) {
      const text = 'Hello, World!'
      const payload = `${status_line()}${plaintext}Content-Length: ${utf8Length(text)}\r\n\r\n${text}`
      SSL_write_string(ssl, payload, utf8Length(payload)) 
      stats.rps++
      return
    }
    if (parsed === -2) return
  }
  if (bytes < 0 && lo.errno === Blocked) return
  close_socket(socket)
}

function on_socket_error (fd) {
  close_socket(sockets.get(fd))
}

function on_socket_connect (sfd) {
  const fd = accept(sfd, 0, 0)
  if (fd > 0) {
    sockets.set(fd, create_secure_socket(fd))
    loop.add(fd, on_socket_event, Loop.Readable | Loop.EdgeTriggered, on_socket_error)
    stats.conn++
    return
  }
  if (lo.errno === Blocked) return
  close(fd)
}

function create_secure_socket (fd) {
  const ssl = assert(SSL_new(ctx))
  SSL_set_fd(ssl, fd)
  SSL_set_accept_state(ssl)
  const buf = new Uint8Array(BUFSIZE)
  return {
    parser: new RequestParser(buf), fd, ssl, state: INSECURE
  }
}

const handle = new Uint32Array(2)
const TLS_server_method = wrap(handle, libssl.TLS_server_method, 0)
const SSL_CTX_new = wrap(handle, libssl.SSL_CTX_new, 1)
const SSL_new = wrap(handle, libssl.SSL_new, 1)
let plaintext = `content-type: text/plain;charset=utf-8\r\nDate: ${(new Date()).toUTCString()}\r\n`
const INSECURE = 0
const SECURE = 1
const BUFSIZE = 16384
const address = '127.0.0.1'
const port = 3000
const sockets = new Map()
const fd = socket(AF_INET, SOCK_STREAM, 0)
assert(fd > 2)
assert(fcntl(fd, F_SETFL, O_NONBLOCK) === 0)
assert(!setsockopt(fd, SOL_SOCKET, SO_REUSEPORT, net.on, 32))
assert(!bind(fd, sockaddr_in(address, port), SOCKADDR_LEN))
assert(!listen(fd, SOMAXCONN))
const loop = new Loop()
assert(!loop.add(fd, on_socket_connect))
const options = SSL_OP_ALL | SSL_OP_NO_RENEGOTIATION | SSL_OP_NO_SSLv3 | 
  SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1 | SSL_OP_NO_DTLSv1 | SSL_OP_NO_DTLSv1_2
const method = assert(TLS_server_method())
const ctx = assert(SSL_CTX_new(method))
assert(SSL_CTX_use_PrivateKey_file(ctx, cstr('key.pem').ptr, SSL_FILETYPE_PEM) === 1)
assert(SSL_CTX_use_certificate_chain_file(ctx, cstr('cert.pem').ptr) === 1)
SSL_CTX_set_options(ctx, options)
const stats = { rps: 0, conn: 0 }
const timer = new Timer(loop, 1000, on_timer)
while (loop.poll() > 0) {}
console.log('willy')
timer.close()
close(fd)
