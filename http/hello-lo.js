import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Timer } from 'lib/timer.js'
import { RequestParser } from 'lib/pico.js'
import { mem } from 'lib/proc.js'

const { assert, utf8Length, latin1Decode } = lo
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

function status_line (status = 200, message = 'OK') {
  return `HTTP/1.1 ${status} ${message}\r\n`
}
let preamble_text = `content-type: text/plain;charset=utf-8\r\nDate: ${(new Date()).toUTCString()}\r\n`

function onSocketEvent (fd) {
  const { parser } = sockets.get(fd)
  const bytes = recv(fd, parser.rb, BUFSIZE, 0)
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

function create_socket (fd) {
  return {
    parser: new RequestParser(new Uint8Array(BUFSIZE)), fd
  }
}

function on_socket_error (fd) {
  sockets.delete(fd)
  stats.conn--
}

function onConnect (sfd) {
  const fd = accept4(sfd, 0, 0, O_NONBLOCK)
  if (fd > 0) {
    sockets.set(fd, create_socket(fd))
    eventLoop.add(fd, onSocketEvent, Loop.Readable, on_socket_error)
    stats.conn++
    return
  }
  if (lo.errno === EAGAIN) return
  close(fd)
}

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
