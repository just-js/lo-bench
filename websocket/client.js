import { Loop } from 'lib/loop.js'
import { WebSocket } from './websocket.js'

function createSocket (port = 3000, address = '127.0.0.1') {
  const sock = new WebSocket(loop, port, address)

  let sent = 0
  sock.onopen = () => {
    const msg = WebSocket.createMessage(0, 1)
    sock.send(msg)
  }

  sock.onmessage = len => {
    console.log(sock.rb.subarray(0, len))
    if (sent === 0) {
      const msg = WebSocket.createMessage(len, 1)
      msg.set(sock.rb.subarray(0, len), msg.off)
      sock.send(msg)
      sent = 1
    }
  }

  sock.connect()
  return sock
}

const loop = new Loop()

createSocket(3000)

while (1) {
  lo.runMicroTasks()
  loop.poll(-1)
}
