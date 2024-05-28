import { Socket } from './lib/socket.js'
import { Loop } from 'lib/loop.js'

const loop = new Loop()
const server = new Socket(loop)

server.bind(3000)
server.listen(128)

async function handle_socket (sock) {
  const recv_buf = new Uint8Array(65536)
  let bytes = await sock.recv(recv_buf)
  console.log(bytes)
  while (bytes > 0) {
    await sock.send(recv_buf.subarray(0, bytes))
    bytes = await sock.recv(recv_buf)
  }
}

async function acceptor () {
  let sock = await server.accept()
  while (sock) {
    console.log(sock.fd)
    handle_socket(sock).catch(err => console.error(err.stack))
    sock = await server.accept()
  }
}

acceptor().catch(err => console.error(err.stack))

while (loop.poll()) {}
