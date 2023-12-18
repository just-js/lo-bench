import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Stats } from 'lib/stats.js'
import { Timer } from 'lib/timer.js'
import { libssl } from 'lib/libssl.js'
import { ResponseParser } from 'lib/pico.js'

const { assert, getenv } = lo
const { socket, connect, close, setsockopt } = net
const { sockaddr_in } = net.types
const { Blocked } = Loop
const { 
  SOCK_STREAM, AF_INET, SOCKADDR_LEN, EINPROGRESS, SOCK_NONBLOCK, IPPROTO_TCP, 
  TCP_NODELAY, TCP_CORK
} = net
const {
  SSL_CTX_set_options, SSL_set_fd, SSL_set_connect_state, SSL_do_handshake, 
  SSL_free, SSL_read, SSL_write_string, SSL_get_error, TLS_client_method,
  SSL_CTX_new, SSL_new, SSL_CTX_set_verify,
  SSL_ERROR_WANT_READ, SSL_ERROR_WANT_WRITE, SSL_VERIFY_NONE,
  default_options
} = libssl

function on_timer () {
  stats.log()
  stats.rps = 0
}

function close_socket (fd) {
  if (!sockets.has(fd)) return
  const socket = sockets.get(fd)
  if (socket.ssl > 0) SSL_free(socket.ssl)
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
  if (state === INSECURE && set_secure(socket)) {
    SSL_write_string(socket.ssl, payload)
    return
  }
  const bytes = SSL_read(ssl, parser.rb.ptr, BUFSIZE)
  if (bytes > 0) {
    const parsed = parser.parse(bytes)
    if (parsed > 0) {
      SSL_write_string(ssl, payload)
      stats.rps++
      return
    }
    if (parsed === -2) return
  }
  if (bytes < 0 && lo.errno === Blocked) return
  close_socket(fd)
}

function create_secure_socket (fd) {
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
    close_socket(socket)
    return false
  }
  const err = SSL_get_error(ssl, rc)
  if (err === SSL_ERROR_WANT_READ || 
    err === SSL_ERROR_WANT_WRITE) return false
  close_socket(fd)
  return false
}

function on_socket_connect (fd) {
  const socket = create_secure_socket(fd)
  //assert(!setsockopt(fd, IPPROTO_TCP, TCP_NODELAY, net.on, 4))
  assert(loop.modify(fd, on_socket_event, Loop.Readable, close_socket) === 0)
  sockets.set(fd, socket)
  stats.conn++
  if (set_secure(socket)) SSL_write_string(socket.ssl, payload)
}

function start_client () {
  const fd = socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK, 0)
  assert(fd > 2)
  assert(connect(fd, sockaddr_in(address, port), SOCKADDR_LEN) > 0 || 
    lo.errno === EINPROGRESS)
  assert(loop.add(fd, on_socket_connect, Loop.Writable | Loop.EdgeTriggered, 
    close_socket) === 0)
}

const payload = 'GET / HTTP/1.1\r\nHost: 127.0.0.1:3000\r\nAccept: */*\r\n\r\n'
const sockets = new Map()
const BUFSIZE = 65536
const address = getenv('ADDRESS') || '127.0.0.1'
const port = parseInt(getenv('PORT') || 3000, 10)
const loop = new Loop()
const stats = new Stats()

const INSECURE = 0
const SECURE = 1
const method = assert(TLS_client_method())
const ctx = assert(SSL_CTX_new(method))
//SSL_CTX_set_options(ctx, default_options | libssl.SSL_OP_NO_COMPRESSION | libssl.SSL_MODE_RELEASE_BUFFERS)
//SSL_CTX_set_verify(ctx, SSL_VERIFY_NONE, 0)
const timer = new Timer(loop, 1000, on_timer)
const nclient = parseInt(lo.args[2] || 128, 10)
for (let i = 0; i < nclient; i++) start_client()
console.log(stats.runtime)
while (loop.poll() > 0) {}
timer.close()
close(fd)
