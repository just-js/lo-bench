import { Stats } from '../lib/bench.mjs'
import { connect } from 'bun'

const BUFSIZE = 256 * 1024
const msg = new ArrayBuffer(BUFSIZE)
const sizes = {}

const handlers = {
  open(socket) {
    stats.conn++
    if (!socket.write(msg)) {
      socket.data = { pending: msg }
      return
    }
    stats.send += BUFSIZE
  },
  data(socket, buffer) {
    const len = buffer.byteLength
    if (!sizes[len]) {
      sizes[len] = 1
    } else {
      sizes[len] += 1
    }
    stats.recv += len
    if (!socket.write(buffer)) {
      socket.data = { pending: buffer }
      return
    }
    stats.send += len
  },
  drain(socket) {
    const pending = socket.data?.pending
    if (!pending) return
    if (socket.write(pending)) {
      stats.send += pending.byteLength
      socket.data = undefined
      return
    }
  },
  close () {
    stats.conn--
  }
}

const stats = new Stats()
setInterval(() => {
  stats.log()
  console.log(JSON.stringify(sizes))
}, 1000)

for (let i = 0; i < 64; i++) {
  await connect({
    socket: handlers,
    hostname: 'localhost',
    port: 3000,
  })
}
