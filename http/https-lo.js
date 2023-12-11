import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Timer } from 'lib/timer.js'
import { RequestParser } from 'lib/pico.js'
import { mem } from 'lib/proc.js'

const { libssl } = lo.load('libssl')

const { assert, utf8Length, wrap, cstr } = lo
const {
  socket, setsockopt, bind, listen, close, accept4, send_string, recv, on
} = net
const { 
  SOCK_STREAM, AF_INET, SOCK_NONBLOCK, SOL_SOCKET, SO_REUSEPORT, 
  SOCKADDR_LEN, SOMAXCONN, O_NONBLOCK
} = net.constants
const { sockaddr_in } = net.types
const EAGAIN = 11
const sockets = new Map()

const {
  SSL_OP_ALL, SSL_OP_NO_RENEGOTIATION, SSL_OP_NO_SSLv3, SSL_OP_NO_TLSv1, SSL_OP_NO_TLSv1_1, SSL_OP_NO_DTLSv1, SSL_OP_NO_DTLSv1_2, SSL_FILETYPE_PEM
} = libssl
const {
  SSL_CTX_set_options, SSL_set_fd, SSL_set_accept_state, SSL_accept, SSL_get_error, SSL_CTX_use_certificate_chain_file, SSL_CTX_use_PrivateKey_file, SSL_read, SSL_do_handshake
} = libssl

const handle = new Uint32Array(2)
const TLS_server_method = wrap(handle, libssl.TLS_server_method, 0)
const SSL_CTX_new = wrap(handle, libssl.SSL_CTX_new, 1)
const SSL_new = wrap(handle, libssl.SSL_new, 1)

function status_line (status = 200, message = 'OK') {
  return `HTTP/1.1 ${status} ${message}\r\n`
}

let preamble_text = `content-type: text/plain;charset=utf-8\r\nDate: ${(new Date()).toUTCString()}\r\n`

function onSocketEvent (fd) {
  const socket = sockets.get(fd)
  const { parser, ssl, state } = sockets.get(fd)
  if (ssl && state === ACCEPT_WAIT) {
    SSL_set_accept_state(ssl)
    const rc = SSL_accept(ssl)
    if (rc === 1) {
      socket.state = HANDSHAKED
    } else if (rc === -1) {
      const err = SSL_get_error(ssl, rc)
      if (err === libssl.SSL_ERROR_WANT_READ) return
    }
    socket.state = ACCEPTED
    return
  } else if (ssl && state === ACCEPTED) {
    const rc = SSL_do_handshake(ssl)
    if (rc === 1) {
      socket.state = HANDSHAKED
    } else if (rc === -1) {
      const err = SSL_get_error(ssl, rc)
      if (err === libssl.SSL_ERROR_WANT_READ) return
    }
    return
  }
  const bytes = SSL_read(ssl, parser.rb, BUFSIZE)
  //const bytes = recv(fd, parser.rb, BUFSIZE, 0)
  if (bytes > 0) {
    const parsed = parser.parse(bytes)
    if (parsed > 0) {
      const { path, method, headers } = parser
      //console.log(JSON.stringify({ path, method, headers }, null, '  '))
      //const raw_headers = latin1Decode(parser.rb.ptr, parsed)
      const text = 'Hello, World!'
      const written = send_string(fd, `${status_line()}${preamble_text}Content-Length: ${utf8Length(text)}\r\n\r\n${text}`)
      stats.rps++
      return
    }
    if (parsed === -2) {
      // we don't have full headers yet
      return
    }
  }
  if (bytes < 0 && lo.errno === EAGAIN) return
  if (bytes < 0) console.error('socket_error')
  eventLoop.remove(fd)
  sockets.delete(fd)
  close(fd)
  stats.conn--
}

const ACCEPT_WAIT = 0
const ACCEPTED = 1
const HANDSHAKED = 2

function create_secure_socket (fd) {
  const ssl = assert(SSL_new(ctx))
  SSL_set_fd(ssl, fd)
  return {
    parser: new RequestParser(new Uint8Array(BUFSIZE)), 
    fd,
    ssl,
    state: ACCEPT_WAIT
  }
}

function create_socket (fd) {
  return {
    parser: new RequestParser(new Uint8Array(BUFSIZE)), 
    fd,
  }
}

function on_socket_error (fd) {
  sockets.delete(fd)
  stats.conn--
}

function onConnect (sfd) {
  const fd = accept4(sfd, 0, 0, O_NONBLOCK)
  if (fd > 0) {
    sockets.set(fd, ctx ? create_secure_socket(fd) : create_socket(fd))
    eventLoop.add(fd, onSocketEvent, Loop.Readable | Loop.EdgeTriggered, on_socket_error)
    stats.conn++
    return
  }
  if (lo.errno === EAGAIN) return
  close(fd)
}

let ctx
const BUFSIZE = 16384
const address = '127.0.0.1'
const port = 3000
const fd = socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK, 0)
assert(fd !== -1)
assert(!setsockopt(fd, SOL_SOCKET, SO_REUSEPORT, on, 32))
assert(!bind(fd, sockaddr_in(address, port), SOCKADDR_LEN))
assert(!listen(fd, SOMAXCONN))
const eventLoop = new Loop()
assert(!eventLoop.add(fd, onConnect))

  const options = SSL_OP_ALL | SSL_OP_NO_RENEGOTIATION | SSL_OP_NO_SSLv3 | SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1 | SSL_OP_NO_DTLSv1 | SSL_OP_NO_DTLSv1_2
  const method = assert(TLS_server_method())
  ctx = assert(SSL_CTX_new(method))
  assert(SSL_CTX_use_PrivateKey_file(ctx, cstr('key.pem').ptr, SSL_FILETYPE_PEM) === 1)
  assert(SSL_CTX_use_certificate_chain_file(ctx, cstr('cert.pem').ptr) === 1)

  SSL_CTX_set_options(ctx, options)

const stats = {
  rps: 0, conn: 0
}

const timer = new Timer(eventLoop, 1000, () => {
  console.log(`rps ${stats.rps} rss ${mem()} conn ${stats.conn} sockets ${sockets.size}`)
  stats.rps = 0
  preamble_text = `content-type: text/plain;charset=utf-8\r\nDate: ${(new Date()).toUTCString()}\r\n`
})

while (1) {
  if (eventLoop.poll(-1) <= 0) break
}

timer.close()
net.close(fd)
