import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Timer } from 'lib/timer.js'
import { ResponseParser } from 'lib/pico.js'
import { mem } from 'lib/proc.js'

const { assert, utf8Length, latin1Decode } = lo
const {
  socket, setsockopt, bind, listen, close, send_string, recv, on,
  connect
} = net
const { 
  SOCK_STREAM, AF_INET, SOCK_NONBLOCK, SOL_SOCKET, SO_REUSEPORT, 
  SOMAXCONN, O_NONBLOCK, EAGAIN, EINPROGRESS
} = net
const SOCKADDR_LEN = 16
const { sockaddr_in } = net.types
const sockets = new Map()

function onSocketEvent (fd) {
  const { parser } = sockets.get(fd)
  const bytes = recv(fd, parser.rb, BUFSIZE, 0)
  if (bytes > 0) {
    const parsed = parser.parse(bytes)
    if (parsed > 0) {
      //const { status, headers } = parser
      //const raw_headers = latin1Decode(parser.rb.ptr, parsed)
      const written = send_string(fd, `GET / HTTP/1.1\r\nHost: 127.0.0.1:3000\r\n\r\n`)
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
    parser: new ResponseParser(new Uint8Array(BUFSIZE)), fd
  }
}

function onConnect (fd) {
  sockets.set(fd, create_socket(fd))
  assert(!eventLoop.modify(fd, Loop.Readable, onSocketEvent, on_socket_error))
  const written = send_string(fd, `GET / HTTP/1.1\r\nHost: 127.0.0.1:3000\r\nAccept: */*\r\n\r\n`)
  stats.conn++
}

const BUFSIZE = 16384
const address = '127.0.0.1'
const port = 3000

function on_socket_error (fd) {
  sockets.delete(fd)
  stats.conn--
}

function client () {
  const fd = socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK, 0)
  assert(fd !== -1)
  const rc = connect(fd, sockaddr_in(address, port), SOCKADDR_LEN)
  if (rc < 0 && lo.errno !== EINPROGRESS) throw new Error(`net.connect: ${lo.errno}`)
  assert(!eventLoop.add(fd, onConnect, Loop.Writable | Loop.EdgeTriggered, on_socket_error))
}

const eventLoop = new Loop()

const stats = {
  rps: 0, conn: 0
}

const timer = new Timer(eventLoop, 1000, () => {
  console.log(`rps ${stats.rps} rss ${mem()} conn ${stats.conn} sockets ${sockets.size}`)
  stats.rps = 0
})

const nclient = parseInt(lo.args[2] || '64', 10)

for (let i = 0; i < nclient; i++) client()

while (1) {
  if (eventLoop.poll(-1) <= 0) break
}

timer.close()
net.close(fd)
