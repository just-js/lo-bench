import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Timer } from 'lib/timer.js'
import { ResponseParser } from 'lib/pico.js'
import { mem } from 'lib/proc.js'
import { system } from 'lib/system.js'

const { libssl } = lo.load('libssl')
//const libssl = lo.load('boringssl').boringssl

const { utf8Length, wrap, core } = lo
const { fcntl, O_NONBLOCK, F_SETFL } = core
const { socket, connect, close } = net
const { sockaddr_in } = net.types
const { Blocked } = Loop
const {
  SOCK_STREAM, AF_INET, SOCK_NONBLOCK, SOCKADDR_LEN, SOMAXCONN, EINPROGRESS
} = net
const {
  SSL_OP_ALL, SSL_OP_NO_RENEGOTIATION, SSL_OP_NO_SSLv3, SSL_OP_NO_TLSv1, 
  SSL_OP_NO_TLSv1_1, SSL_OP_NO_DTLSv1, SSL_OP_NO_DTLSv1_2,
  SSL_ERROR_WANT_READ, SSL_ERROR_WANT_WRITE
} = libssl
const {
  SSL_CTX_set_options, SSL_set_fd, SSL_set_connect_state, SSL_do_handshake, 
  SSL_free, SSL_read, SSL_write_string, SSL_get_error
} = libssl

function on_timer () {
  const { rps, conn } = stats
  console.log(`rps ${rps} rss ${mem()} conn ${conn} sockets ${sockets.size}`)
  stats.rps = 0
}

const assert = (...args) => {
  return lo.assert(...[...args, err => console.log(`errno ${lo.errno}\n${system.strerror()}\n${err.stack}`)]) 
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
    const rc = SSL_do_handshake(ssl)
    if (rc === 1) {
      socket.state = SECURE
      const written = SSL_write_string(ssl, payload, utf8Length(payload)) 
      stats.rps++
    } else if (rc === 0) {
      close_socket(socket)
      return
    } else {
      const err = SSL_get_error(ssl, rc)
      if (err === SSL_ERROR_WANT_READ || 
        err === SSL_ERROR_WANT_WRITE) return
      close_socket(socket)
      return
    }
  }
  const bytes = SSL_read(ssl, parser.rb.ptr, BUFSIZE)
  if (bytes > 0) {
    const parsed = parser.parse(bytes)
    if (parsed > 0) {
      SSL_write_string(ssl, payload, utf8Length(payload)) 
      stats.rps++
      return
    }
    if (parsed === -2) return
  }
  if (bytes < 0 && lo.errno === Blocked) return
  close_socket(socket)
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

function on_socket_error (fd) {
  close_socket(sockets.get(fd))
}

function on_socket_connect (fd) {
  sockets.set(fd, create_secure_socket(fd))
  assert(loop.modify(fd, Loop.Readable | Loop.Writable, on_socket_event, on_socket_error) === 0)
  stats.conn++
}

function start_client () {
  const fd = socket(AF_INET, SOCK_STREAM, 0)
  assert(fd > 2)
  assert(fcntl(fd, F_SETFL, O_NONBLOCK) === 0)
  const rc = connect(fd, sockaddr_in(address, port), SOCKADDR_LEN)
  if (rc < 0 && lo.errno !== EINPROGRESS) throw new Error(`net.connect: ${lo.errno}`)
  assert(loop.add(fd, on_socket_connect, Loop.Writable | Loop.EdgeTriggered, on_socket_error) === 0)
}

const payload = 'GET / HTTP/1.1\r\nHost: 127.0.0.1:3000\r\nAccept: */*\r\n\r\n'
const sockets = new Map()
const BUFSIZE = 65536
const address = '127.0.0.1'
const port = 3000
const loop = new Loop()
const stats = { rps: 0, conn: 0 }
const nclient = parseInt(lo.args[2] || SOMAXCONN, 10)
const handle = new Uint32Array(2)
const TLS_client_method = wrap(handle, libssl.TLS_client_method, 0)
const SSL_CTX_new = wrap(handle, libssl.SSL_CTX_new, 1)
const SSL_new = wrap(handle, libssl.SSL_new, 1)
const options = SSL_OP_ALL | SSL_OP_NO_RENEGOTIATION | SSL_OP_NO_SSLv3 | 
  SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1 | SSL_OP_NO_DTLSv1 | SSL_OP_NO_DTLSv1_2
const INSECURE = 0
const SECURE = 1
const method = assert(TLS_client_method())
const ctx = assert(SSL_CTX_new(method))
SSL_CTX_set_options(ctx, options)
const timer = new Timer(loop, 1000, on_timer)
for (let i = 0; i < nclient; i++) start_client()
while (loop.poll() > 0) {}
timer.close()
close(fd)
