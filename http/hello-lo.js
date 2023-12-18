import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Stats } from 'lib/stats.js'
import { Timer } from 'lib/timer.js'
import { RequestParser } from 'lib/pico.js'

const { assert, utf8Length, core, getenv } = lo
const { fcntl, O_NONBLOCK, F_SETFL } = core
const { 
  socket, bind, listen, accept, close, setsockopt, recv, send_string
} = net
const {
  SOCK_STREAM, AF_INET, SOMAXCONN, SO_REUSEPORT, SOL_SOCKET, SOCKADDR_LEN
} = net
const { sockaddr_in } = net.types
const { Blocked } = Loop

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
  if (fd > 0) {
    loop.remove(fd)
    if (sockets.has(fd)) sockets.delete(fd)
    close(fd)
    stats.conn--
  }
  socket.fd = 0
}

function on_socket_event (fd) {
  const socket = sockets.get(fd)
  const { parser } = socket
  const bytes = recv(fd, parser.rb, BUFSIZE, 0)
  if (bytes > 0) {
    const parsed = parser.parse(bytes)
    if (parsed > 0) {
      const text = 'Hello, World!'
      send_string(fd, 
        `${status_line()}${plaintext}Content-Length: ${utf8Length(text)}\r\n\r\n${text}`)
      stats.rps++
      return
    }
    if (parsed === -2) return
  }
  if (bytes < 0 && lo.errno === Blocked) return
  close_socket(fd)
}

function create_socket (fd) {
  return {
    parser: new RequestParser(new Uint8Array(BUFSIZE)), fd
  }
}

function on_socket_connect (sfd) {
  // we could use accept4 on linux and set non blocking here but macos does not have it
  const fd = accept(sfd, 0, 0)
  if (fd > 0) {
    assert(fcntl(fd, F_SETFL, O_NONBLOCK) === 0)
    sockets.set(fd, create_socket(fd))
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

const sockets = new Map()
const BUFSIZE = 65536
const loop = new Loop()
let plaintext = 
  `Content-Type: text/plain;charset=utf-8\r\nDate: ${(new Date()).toUTCString()}\r\n`
const stats = new Stats()
const timer = new Timer(loop, 1000, on_timer)
const address = getenv('ADDRESS') || '127.0.0.1'
const port = parseInt(getenv('PORT') || 3000, 10)
const fd = start_server(address, port)
// 6 ms from cold start
console.log(stats.runtime)
while (loop.poll() > 0) {}
console.log('done')
timer.close()
close(fd)
