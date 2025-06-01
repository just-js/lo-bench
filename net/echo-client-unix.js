import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Timer } from 'lib/timer.js'
import { Stats } from '../lib/bench.mjs'

const { assert, getenv } = lo
const { socket, close, send, recv, connect } = net
const { SOCK_STREAM, AF_UNIX, SOCK_NONBLOCK, EINPROGRESS, SOCKADDR_LEN } = net
const { sockaddr_un } = net.types
const { Blocked } = Loop

function on_timer () {
  stats.log()
}

function close_socket (fd) {
  if (fd > 0) {
    loop.remove(fd)
    close(fd)
    stats.conn--
  }
  socket.fd = 0
}

function on_socket_event (fd) {
  const bytes = recv(fd, payload, BUFSIZE, 0)
  if (bytes > 0) {
    stats.recv += bytes 
    send(fd, payload, bytes, 0)
    stats.send += bytes
    return
  }
  if (bytes < 0 && lo.errno === Blocked) return
  close_socket(fd)
}

function on_socket_connect (fd) {
  assert(loop.modify(fd, on_socket_event, Loop.Readable, close_socket) === 0)
  send(fd, payload, payload.length, 0)
  stats.send += payload.length
  stats.conn++
}

function start_client () {
  const fd = socket(AF_UNIX, SOCK_STREAM | SOCK_NONBLOCK, 0)
  assert(fd > 2)
  assert(connect(fd, sockaddr_un(path), SOCKADDR_LEN) === 0 || 
    lo.errno === EINPROGRESS)
  assert(loop.add(fd, on_socket_connect, Loop.Writable, 
    close_socket) === 0)
}

const stats = new Stats()
const BUFSIZE = 256 * 1024;
const payload = new Uint8Array(BUFSIZE)
//const path = '\0hello'
const path = getenv('LO_PATH') || './hello.sock'
const loop = new Loop()
const timer = new Timer(loop, 1000, on_timer)
const nclient = parseInt(lo.args[2] || '64', 10)
for (let i = 0; i < nclient; i++) start_client()
while (loop.poll() > 0) {}
timer.close()
close(fd)
