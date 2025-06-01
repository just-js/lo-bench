import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Timer } from 'lib/timer.js'
import { Stats } from '../lib/bench.mjs'

const { assert, core, getenv, ptr } = lo
const { fcntl, O_NONBLOCK, F_SETFL } = core
const { 
  socket, bind, listen, accept, close, setsockopt, recv2, send2
} = net
const {
  SOCK_STREAM, AF_INET, SOMAXCONN, SO_REUSEPORT, SOL_SOCKET, SOCKADDR_LEN
} = net
const { sockaddr_in } = net.types
const { Blocked } = Loop

function on_timer () {
  stats.log()
}

function close_socket (fd) {
  if (fd > 0) {
    loop.remove(fd)
    if (sockets.has(fd)) sockets.delete(fd)
    close(fd)
    stats.conn--
  }
  socket.fd = 0
}

function on_socket_drain (fd) {
  console.log('on_socket_drain')
  const towrite = pending.get(fd)
  if (towrite) {
    const written = send2(fd, towrite.ptr, towrite.length, 0)
    console.log(`pending write ${written}`)
    pending.delete(fd)
  }
  assert(!eventLoop.modify(fd, on_socket_event, Loop.Readable))
}

function handle_backpressure (fd, u8, bytes, written) {
  if (written === -1) {
    if (lo.errno === Blocked) return
    console.log(`write_buffer ${lo.errno}`)
    close_socket(fd)
    return
  }
  if (written > 0) {
    pending.set(fd, u8.slice(written, bytes))
  }
  console.log(`write_buffer partial ${written} of ${bytes}`)
  assert(loop.modify(fd, on_socket_drain, Loop.Writable | Loop.EdgeTriggered) === 0)
}

function write_buffer (fd, u8, bytes) {
  const written = send2(fd, u8.ptr, bytes, 0)
  if (written === bytes) {
    stats.send += written
    return
  }
  handle_backpressure(fd, u8, bytes, written)
}

function on_socket_event (fd) {
  if (!sockets.has(fd)) {
    close_socket(fd)
    return
  }
  const { recv_buf } = sockets.get(fd)
  const bytes = recv2(fd, recv_buf.ptr, BUFSIZE, 0)
  if (bytes > 0) {
    stats.recv += bytes 
    write_buffer(fd, recv_buf, bytes)
    return
  }
  if (bytes < 0 && lo.errno === Blocked) return
  close_socket(fd)
}

function create_socket (fd) {
  return { fd, recv_buf: ptr(new Uint8Array(BUFSIZE)) }
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
const BUFSIZE = 256 * 1024
const loop = new Loop()
const stats = new Stats()
//const timer = new Timer(loop, 1000, on_timer)
const address = getenv('ADDRESS') || '127.0.0.1'
const port = parseInt(getenv('PORT') || 3000, 10)
const fd = start_server(address, port)
while (loop.poll() > 0) {}
timer.close()
close(fd)
