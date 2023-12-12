import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Timer } from 'lib/timer.js'
import { RequestParser } from 'lib/pico.js'
import { mem } from 'lib/proc.js'

const { assert, utf8Length, core } = lo
const { fcntl, O_NONBLOCK, F_SETFL } = core
const { 
  socket, bind, listen, accept, recv, send_string, close, setsockopt
} = net
const {
  SOCK_STREAM, AF_INET, SOMAXCONN, SO_REUSEPORT, SOL_SOCKET
} = net
const { sockaddr_in } = net.types
const { Blocked } = Loop

function status_line (status = 200, message = 'OK') {
  return `HTTP/1.1 ${status} ${message}\r\n`
}

function on_timer () {
  console.log(`rps ${stats.rps} rss ${mem()} conn ${stats.conn} sockets ${sockets.size}`)
  stats.rps = 0
  plaintext = `Content-Type: text/plain;charset=utf-8\r\nDate: ${(new Date()).toUTCString()}\r\n`
}

function on_socket_error (fd) {
  sockets.delete(fd)
  stats.conn--
}

function on_socket_event (fd) {
  const { parser } = sockets.get(fd)
  const bytes = recv(fd, parser.rb, BUFSIZE, 0)
  if (bytes > 0) {
    const parsed = parser.parse(bytes)
    if (parsed > 0) {
      const text = 'Hello, World!'
      send_string(fd, `${status_line()}${plaintext}Content-Length: ${utf8Length(text)}\r\n\r\n${text}`)
      stats.rps++
      return
    }
    if (parsed === -2) return
  }
  if (bytes < 0 && lo.errno === Blocked) return
  loop.remove(fd)
  sockets.delete(fd)
  close(fd)
  stats.conn--
}

function on_socket_connect (sfd) {
  const fd = accept(sfd, 0, 0)
  if (fd > 0) {
    assert(fcntl(fd, F_SETFL, O_NONBLOCK) === 0)
    sockets.set(fd, create_socket(fd))
    loop.add(fd, on_socket_event, Loop.Readable, on_socket_error)
    stats.conn++
    return
  }
  if (lo.errno === Blocked) return
  close(fd)
}

function create_socket (fd) {
  return {
    parser: new RequestParser(new Uint8Array(BUFSIZE)), fd
  }
}

function start_server (addr, port) {
  const fd = socket(AF_INET, SOCK_STREAM, 0)
  assert(fd > 2)
  assert(fcntl(fd, F_SETFL, O_NONBLOCK) === 0)
  assert(!setsockopt(fd, SOL_SOCKET, SO_REUSEPORT, net.on, 32))
  assert(bind(fd, sockaddr_in(addr, port), 16) === 0)
  assert(listen(fd, SOMAXCONN) === 0)
  loop.add(fd, on_socket_connect)
  return fd
}

const sockets = new Map()
const BUFSIZE = 16384
const loop = new Loop()
const stats = { rps: 0, conn: 0 }
let plaintext = `Content-Type: text/plain;charset=utf-8\r\nDate: ${(new Date()).toUTCString()}\r\n`
const timer = new Timer(loop, 1000, on_timer)
const fd = start_server('127.0.0.1', 3000)
while (loop.poll() > 0) {}
timer.close()
close(fd)
