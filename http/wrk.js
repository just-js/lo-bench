import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Stats } from 'lib/stats.js'
import { Timer } from 'lib/timer.js'
import { ResponseParser } from 'lib/pico.js'

const { assert, getenv } = lo
const { socket, close, send_string, recv, connect } = net
const { SOCK_STREAM, AF_INET, SOCK_NONBLOCK, EINPROGRESS, SOCKADDR_LEN } = net
const { sockaddr_in } = net.types
const { Blocked } = Loop

function on_timer () {
  stats.log()
  stats.rps = 0
}

function close_socket (fd) {
  if (!sockets.has(fd)) return
  const socket = sockets.get(fd)
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
  const { parser } = socket
  const bytes = recv(fd, parser.rb, BUFSIZE, 0)
  if (bytes > 0) {
    const parsed = parser.parse(bytes)
    if (parsed > 0) {
      send_string(fd, payload)
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
    parser: new ResponseParser(new Uint8Array(BUFSIZE)), fd
  }
}

function on_socket_connect (fd) {
  sockets.set(fd, create_socket(fd))
  assert(loop.modify(fd, on_socket_event, Loop.Readable, close_socket) === 0)
  send_string(fd, payload)
  stats.conn++
}

function start_client () {
  const fd = socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK, 0)
  assert(fd > 2)
  assert(connect(fd, sockaddr_in(address, port), SOCKADDR_LEN) > 0 || 
    lo.errno === EINPROGRESS)
  //if (rc < 0 && lo.errno !== EINPROGRESS) throw new Error(`net.connect: ${lo.errno}`)
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

const timer = new Timer(loop, 1000, on_timer)
const nclient = parseInt(lo.args[2] || '64', 10)
for (let i = 0; i < nclient; i++) start_client()
// 7 ms from cold start
console.log(lo.hrtime() - lo.start)
while (loop.poll() > 0) {}
timer.close()
close(fd)
