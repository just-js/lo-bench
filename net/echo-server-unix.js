import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Timer } from 'lib/timer.js'
import { Stats } from '../lib/bench.mjs'

const { assert, core, getenv } = lo
const { fcntl, O_NONBLOCK, F_SETFL, unlink } = core
const { 
  socket, bind, listen, accept, close, recv, send
} = net
const {
  SOCK_STREAM, AF_UNIX, SOMAXCONN, SOCKADDR_LEN
} = net
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
  const bytes = recv(fd, recv_buf, BUFSIZE, 0)
  if (bytes > 0) {
    stats.recv += bytes 
    send(fd, recv_buf, bytes, 0)
    stats.send += bytes
    return
  }
  if (bytes < 0 && lo.errno === Blocked) return
  close_socket(fd)
}

function on_socket_connect (sfd) {
  // we could use accept4 on linux and set non blocking here but macos does not have it
  const fd = accept(sfd, 0, 0)
  if (fd > 0) {
    assert(fcntl(fd, F_SETFL, O_NONBLOCK) === 0)
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

function start_server (path) {
  const fd = socket(AF_UNIX, SOCK_STREAM, 0)
  assert(fd > 2)
  assert(fcntl(fd, F_SETFL, O_NONBLOCK) === 0)
//  assert(!setsockopt(fd, SOL_SOCKET, SO_REUSEPORT, net.on, 32))
//  assert(bind(fd, sockaddr_in(addr, port), SOCKADDR_LEN) === 0)
  assert(bind(fd, sockaddr_un(path), SOCKADDR_LEN) === 0)
  assert(listen(fd, SOMAXCONN) === 0)
  assert(loop.add(fd, on_socket_connect, Loop.Readable, on_accept_error) === 0)
  return fd
}

// allocate one big buffer and give sockets slices off it
// or just use same buffer for all sockets and copy when needed
// we could just use pointers and offsets
// it would still be jumping around a lot
const BUFSIZE = 256 * 1024
const loop = new Loop()
const recv_buf = new Uint8Array(BUFSIZE)
const stats = new Stats()
const timer = new Timer(loop, 1000, on_timer)
const path = getenv('LO_PATH') || './hello.sock'
unlink(path)
const fd = start_server(path)
while (loop.poll() > 0) {}
timer.close()
close(fd)
