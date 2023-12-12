import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Timer } from 'lib/timer.js'
import { RequestParser } from 'lib/pico.js'
import { mem } from 'lib/proc.js'

const { libssl } = lo.load('libssl')
//const libssl = lo.load('boringssl').boringssl

const { assert, utf8Length, wrap, cstr, core } = lo
const { fcntl, O_NONBLOCK, F_SETFL } = core
const { socket, bind, listen, accept, close, setsockopt } = net
const { sockaddr_in } = net.types
const { Blocked } = Loop
const { 
  SOCK_STREAM, AF_INET, SOMAXCONN, SO_REUSEPORT, SOL_SOCKET
} = net
const {
  SSL_OP_ALL, SSL_OP_NO_RENEGOTIATION, SSL_OP_NO_SSLv3, SSL_OP_NO_TLSv1, 
  SSL_OP_NO_TLSv1_1, SSL_OP_NO_DTLSv1, SSL_OP_NO_DTLSv1_2, SSL_FILETYPE_PEM
} = libssl
const {
  SSL_CTX_set_options, SSL_set_fd, SSL_set_accept_state, SSL_accept, SSL_free,
  SSL_CTX_use_certificate_chain_file, SSL_CTX_use_PrivateKey_file, 
  SSL_read, SSL_write_string, SSL_get_error
} = libssl

function update_headers () {
  const now = (new Date()).toUTCString()
  plaintext = `content-type: text/plain;charset=utf-8\r\nDate: ${now}\r\n`
}

function on_timer () {
  const { rps, conn } = stats
  const rss = mem()
  console.log(`rps ${rps} rss ${rss} conn ${conn} sockets ${sockets.size}`)
  stats.rps = 0
  update_headers()
}

function status_line (status = 200, message = 'OK') {
  return `HTTP/1.1 ${status} ${message}\r\n`
}

function close_socket (socket) {
  if (!socket) return
  const { fd, ssl } = socket
  if (ssl > 0) SSL_free(ssl)
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
  if (!sockets.has(fd)) throw new Error('foo')
  const socket = sockets.get(fd)
  const { parser, ssl, state } = socket
  if (state === INSECURE) {
    const rc = SSL_accept(ssl)
    if (rc === 1) {
      socket.state = SECURE
    } else if (rc === 0) {
      close_socket(socket)
      return
    } else {
      const err = SSL_get_error(ssl, rc)
      if (err === libssl.SSL_ERROR_WANT_READ || 
        err === libssl.SSL_ERROR_WANT_WRITE) return
      close_socket(socket)
      return
    }
  }
  const bytes = SSL_read(ssl, parser.rb.ptr, BUFSIZE)
  if (bytes > 0) {
    const parsed = parser.parse(bytes)
    if (parsed > 0) {
      const text = 'Hello, World!'
      const payload = `${status_line()}${plaintext}Content-Length: ${utf8Length(text)}\r\n\r\n${text}`
      const written = SSL_write_string(ssl, payload)
      if (written > 0) {
        stats.rps++
        return
      }
    }
    if (parsed === -2) {
      // todo: use offset
      return
    }
  }
  if (bytes < 0 && lo.errno === Blocked) return
  close_socket(socket)
}

function create_secure_socket (fd) {
  const ssl = assert(SSL_new(ctx))
  assert(SSL_set_fd(ssl, fd) === 1)
  SSL_set_accept_state(ssl)
  const buf = new Uint8Array(BUFSIZE)
  return {
    parser: new RequestParser(buf), fd, ssl, state: INSECURE
  }
}

function on_socket_error (fd) {
  close_socket(sockets.get(fd))
}

function on_socket_connect (sfd) {
  const fd = accept(sfd, 0, 0)
  if (fd > 0) {
    sockets.set(fd, create_secure_socket(fd))
    assert(loop.add(fd, on_socket_event, Loop.Readable, on_socket_error) === 0)
    stats.conn++
    return
  }
  if (lo.errno === Blocked) return
  close(fd)
}

function start_server (addr, port) {
  const fd = socket(AF_INET, SOCK_STREAM, 0)
  assert(fd > 2)
  assert(fcntl(fd, F_SETFL, O_NONBLOCK) === 0)
  assert(!setsockopt(fd, SOL_SOCKET, SO_REUSEPORT, net.on, 32))
  assert(bind(fd, sockaddr_in(addr, port), 16) === 0)
  assert(listen(fd, SOMAXCONN) === 0)
  assert(loop.add(fd, on_socket_connect) === 0)
  return fd
}

let plaintext = ''
const handle = new Uint32Array(2)
const stats = { rps: 0, conn: 0 }
const options = SSL_OP_ALL | SSL_OP_NO_RENEGOTIATION | SSL_OP_NO_SSLv3 | 
  SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1 | SSL_OP_NO_DTLSv1 | SSL_OP_NO_DTLSv1_2
const TLS_server_method = wrap(handle, libssl.TLS_server_method, 0)
const SSL_CTX_new = wrap(handle, libssl.SSL_CTX_new, 1)
const SSL_new = wrap(handle, libssl.SSL_new, 1)
const INSECURE = 0
const SECURE = 1
const BUFSIZE = 65536
const sockets = new Map()
const loop = new Loop()
update_headers()
const fd = start_server('127.0.0.1', 3000)
const method = assert(TLS_server_method())
const ctx = assert(SSL_CTX_new(method))
assert(SSL_CTX_use_PrivateKey_file(ctx, cstr('key.pem').ptr, SSL_FILETYPE_PEM) === 1)
assert(SSL_CTX_use_certificate_chain_file(ctx, cstr('cert.pem').ptr) === 1)
SSL_CTX_set_options(ctx, options)
const timer = new Timer(loop, 1000, on_timer)
while (loop.poll() > 0) {}
timer.close()
close(fd)

// we could just pre-allocate a large buffer and take slices off it
