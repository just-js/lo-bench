import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { system } from 'lib/system.js'
import { dump } from 'lib/binary.js'
import { 
  create_request, WebSocket, create_response, create_parser
} from './socket.js'

// TODO: abstract away send/recv so we can replace with TLS stream or some other
// backing stream

const { assert, ptr } = lo
const {
  socket, setsockopt, bind, listen, close, accept4, recv2, on, send2
} = net
const { 
  SOCK_STREAM, AF_INET, SOCK_NONBLOCK, SOL_SOCKET, SO_REUSEPORT, 
  SOCKADDR_LEN, SOMAXCONN, O_NONBLOCK
} = net.constants
const { sockaddr_in } = net.types
const { SystemError } = system

function closeSocket (fd) {
  loop.remove(fd)
  close(fd)
}

function serve (req) {
  console.log(JSON.stringify(req.headers))
  const key = assert(req.headers['Sec-WebSocket-Key']).trim()
  const res = create_response(key)
  const written = send2(req.fd, res.ptr, res.size, 0)
  const sock_buf = ptr(new Uint8Array(maxMessageSize))
  const sock = new WebSocket(sock_buf)
  const { fd } = req
  loop.modify(fd, Loop.Readable, () => {
    const bytes = recv2(fd, sock.next, sock.available, 0)
    if (bytes && sock.message(bytes)) {
      sock.unmask()
      const written = send2(fd, sock.addr, sock.start + sock.len, 0)
      sock.next = sock.addr
      sock.available = sock.size
      if (sock.op_code === 8) closeSocket(fd)
      return
    }
    if (bytes < 0 && lo.errno === Loop.Blocked) return
    if (bytes < 0) console.error(new SystemError('loop'))
    closeSocket(fd)
  })
}

let off = 0

function onSocketEvent (fd) {
  // TODO: we need to check the masks on the fd events
  const bytes = recv2(fd, recv_buf.ptr + off, recv_buf.size - off, 0)
  console.log(bytes)
  if (bytes > 0) {
    console.log(dump(recv_buf.subarray(0, off + bytes)))
    const parsed = parser.parse(bytes + off)
    console.log(parsed)
    if (parsed === bytes + off) {
      off = 0
      try {
        serve(create_request(recv_buf, bytes, fd))
      } catch (err) {
        console.error(err.stack)
        closeSocket(fd)
      }
      return
    } else if (parsed === -2) {
      off += bytes
      return
    }
  }
  off = 0
  if (bytes < 0 && spin.errno === Loop.Blocked) return
  if (bytes < 0) console.error(new SystemError('onSocketEvent'))
  closeSocket(fd)
}

function onConnect (sfd) {
  const fd = accept4(sfd, 0, 0, O_NONBLOCK)
  if (fd > 0) {
    loop.add(fd, onSocketEvent)
    return
  }
  if (lo.errno === Loop.Blocked) return
  closeSocket(fd)
}

const maxMessageSize = 65536 * 2
const recv_buf = ptr(new Uint8Array(16384))
const parser = create_parser(recv_buf)
const fd = socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK, 0)
assert(fd !== -1)
assert(!setsockopt(fd, SOL_SOCKET, SO_REUSEPORT, on, 32))
assert(!bind(fd, sockaddr_in('127.0.0.1', 3000), SOCKADDR_LEN))
assert(!listen(fd, SOMAXCONN))
const loop = new Loop()
assert(!loop.add(fd, onConnect))
while (loop.poll(-1) > 0) {}
