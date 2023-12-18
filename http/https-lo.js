import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Stats } from 'lib/stats.js'
import { Timer } from 'lib/timer.js'
import { libssl } from 'lib/libssl.js'
import { RequestParser } from 'lib/pico.js'

const { assert, utf8Length, cstr, core, getenv } = lo
const { fcntl, O_NONBLOCK, F_SETFL } = core
const { socket, bind, listen, accept, close, setsockopt } = net
const { sockaddr_in } = net.types
const { Blocked } = Loop
const {
  SOCK_STREAM, AF_INET, SOMAXCONN, SO_REUSEPORT, SOL_SOCKET, SOCKADDR_LEN,
  TCP_NODELAY, IPPROTO_TCP, TCP_CORK
} = net
const {
  SSL_CTX_set_options, SSL_set_fd, SSL_set_accept_state, SSL_accept, SSL_free,
  SSL_CTX_use_certificate_chain_file, SSL_CTX_use_PrivateKey_file, 
  SSL_read, SSL_write_string, SSL_get_error, TLS_server_method, SSL_CTX_new,
  SSL_new, default_options, SSL_CTX_set_ciphersuites,
  SSL_FILETYPE_PEM
} = libssl

function update_headers () {
  plaintext = `content-type: text/plain;charset=utf-8\r\nDate: ${(new Date()).toUTCString()}\r\n`
}

function on_timer () {
  stats.log()
  update_headers()
}

function status_line (status = 200, message = 'OK') {
  return `HTTP/1.1 ${status} ${message}\r\n`
}

function close_socket (fd) {
  if (!sockets.has(fd)) return
  const socket = sockets.get(fd)
  if (socket.ssl > 0) {
    SSL_free(socket.ssl)
    socket.ssl = 0
  }
  if (fd > 0) {
    loop.remove(fd)
    sockets.delete(fd)
    close(fd)
    stats.conn--
  }
  socket.fd = 0
}

function on_socket_event (fd) {
  const socket = sockets.get(fd)
  const { parser, ssl, state } = socket
  if (state === INSECURE) {
    const rc = SSL_accept(ssl)
    if (rc === 1) {
      socket.state = SECURE
    } else if (rc === 0) {
      close_socket(fd)
      return
    } else {
      const err = SSL_get_error(ssl, rc)
      if (err === libssl.SSL_ERROR_WANT_READ || 
        err === libssl.SSL_ERROR_WANT_WRITE) return
      close_socket(fd)
      return
    }
  }
  const bytes = SSL_read(ssl, parser.rb.ptr, BUFSIZE)
  if (bytes > 0) {
    const parsed = parser.parse(bytes)
    if (parsed > 0) {
      const text = 'Hello, World!'
      if (SSL_write_string(ssl, 
        `${status_line()}${plaintext}Content-Length: ${utf8Length(text)}\r\n\r\n${text}`) > 0) {
        stats.rps++
        return
      }
    }
    if (parsed === -2) return
  }
  if (bytes < 0 && lo.errno === Blocked) return
  close_socket(fd)
}

function create_secure_socket (fd) {
  const ssl = assert(SSL_new(ctx))
  assert(SSL_set_fd(ssl, fd) === 1)
  SSL_set_accept_state(ssl)
  return {
    parser: new RequestParser(new Uint8Array(BUFSIZE)), fd, 
    ssl, state: INSECURE
  }
}

function on_socket_connect (sfd) {
  const fd = accept(sfd, 0, 0)
  if (fd > 0) {
    assert(fcntl(fd, F_SETFL, O_NONBLOCK) === 0)
    sockets.set(fd, create_secure_socket(fd))
    //assert(!setsockopt(fd, IPPROTO_TCP, TCP_NODELAY, net.on, 4))
    //assert(!setsockopt(fd, IPPROTO_TCP, TCP_CORK, net.on, 4))
    assert(loop.add(fd, on_socket_event, Loop.Readable, close_socket) === 0)
    stats.conn++
    return
  }
  if (lo.errno === Blocked) return
  close(fd)
}

function on_accept_error(fd, mask) {
  console.log(`accept error on socket ${fd} : ${mask}`)
}

function start_server (addr, port) {
  const fd = socket(AF_INET, SOCK_STREAM, 0)
  assert(fd > 2)
  assert(fcntl(fd, F_SETFL, O_NONBLOCK) === 0)
  assert(!setsockopt(fd, SOL_SOCKET, SO_REUSEPORT, net.on, 32))
  assert(bind(fd, sockaddr_in(addr, port), SOCKADDR_LEN) === 0)
  assert(listen(fd, SOMAXCONN) === 0)
  assert(loop.add(fd, on_socket_connect, Loop.Readable, on_accept_error) === 0)
  return fd
}

let plaintext = ''
const stats = new Stats()
const INSECURE = 0
const SECURE = 1
const BUFSIZE = 65536
const sockets = new Map()
const loop = new Loop()
update_headers()
const address = getenv('ADDRESS') || '127.0.0.1'
const port = parseInt(getenv('PORT') || 3000, 10)
const fd = start_server(address, port)

const method = assert(TLS_server_method())
const ctx = assert(SSL_CTX_new(method))
assert(SSL_CTX_use_PrivateKey_file(ctx, cstr('key.pem').ptr, 
  SSL_FILETYPE_PEM) === 1)
assert(SSL_CTX_use_certificate_chain_file(ctx, cstr('cert.pem').ptr) === 1)
//SSL_CTX_set_options(ctx, default_options | libssl.SSL_OP_NO_COMPRESSION | libssl.SSL_MODE_RELEASE_BUFFERS)
//assert(SSL_CTX_set_ciphersuites(ctx, 
//  'TLS_CHACHA20_POLY1305_SHA256:TLS_AES_256_GCM_SHA384:TLS_AES_128_GCM_SHA256') === 1)
const timer = new Timer(loop, 1000, on_timer)
console.log(stats.runtime)
// it takes ~12 milliseconds to boostrap to here as a new process
while (loop.poll() > 0) {}
timer.close()
close(fd)
