import { Stats } from '../lib/bench.mjs'
import { listen } from "bun";

const handlers = {
  data(socket, buffer) {
    const len = buffer.byteLength;
    stats.recv += len;
    if (!socket.write(buffer)) {
      socket.data = { pending: buffer };
      return;
    }
    stats.send += len;
  },
  drain(socket) {
    const pending = socket.data?.pending;
    if (!pending) return;
    if (socket.write(pending)) {
      stats.send += pending.byteLength;
      socket.data = undefined;
      return;
    }
  },
  open (socket) {
    stats.conn++
  },
  close (socket) {
    stats.conn--
  }
};

const stats = new Stats()

setInterval(() => {
  stats.log()
}, 1000);

const server = listen({
  socket: handlers,
  hostname: "localhost",
  port: 3000,
  data: {
    isServer: true,
  },
});
