import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Timer } from 'lib/timer.js'
import { ResponseParser } from 'lib/pico.js'
import { mem } from 'lib/proc.js'

const { assert } = lo
const { socket, close, send_string, recv, connect } = net
const { SOCK_STREAM, AF_INET, SOCK_NONBLOCK, EINPROGRESS } = net
const { sockaddr_in } = net.types
const { Blocked } = Loop
const SOCKADDR_LEN = 16

function on_timer () {
  console.log(`rps ${stats.rps} rss ${mem()} conn ${stats.conn} sockets ${sockets.size}`)
  stats.rps = 0
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
      send_string(fd, `GET / HTTP/1.1\r\nHost: 127.0.0.1:3000\r\n\r\n`)
      stats.rps++
      return
    }
    if (parsed === -2) return
  }
  if (bytes < 0 && lo.errno === Blocked) return
  if (bytes < 0) console.error('socket_error')
  loop.remove(fd)
  sockets.delete(fd)
  close(fd)
  stats.conn--
}

function on_socket_connect (fd) {
  sockets.set(fd, create_socket(fd))
  assert(!loop.modify(fd, Loop.Readable, on_socket_event, on_socket_error))
  send_string(fd, `GET / HTTP/1.1\r\nHost: 127.0.0.1:3000\r\n\r\n`)
  stats.conn++
}

function create_socket (fd) {
  return {
    parser: new ResponseParser(new Uint8Array(BUFSIZE)), fd
  }
}

function start_client () {
  const fd = socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK, 0)
  assert(fd > 2)
  const rc = connect(fd, sockaddr_in(address, port), SOCKADDR_LEN)
  if (rc < 0 && lo.errno !== EINPROGRESS) throw new Error(`net.connect: ${lo.errno}`)
  loop.add(fd, on_socket_connect, Loop.Writable | Loop.EdgeTriggered, on_socket_error)
}

const sockets = new Map()
const BUFSIZE = 16384
const address = '127.0.0.1'
const port = 3000
const loop = new Loop()
const stats = { rps: 0, conn: 0 }
const timer = new Timer(loop, 1000, on_timer)
const nclient = parseInt(lo.args[2] || '64', 10)
for (let i = 0; i < nclient; i++) start_client()
while (loop.poll() > 0) {}
timer.close()
net.close(fd)
