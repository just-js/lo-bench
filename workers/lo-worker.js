import { Worker } from 'lib/worker.js'
import { net } from 'lib/net.js'

// https://man7.org/linux/man-pages/man7/unix.7.html
// SEQPACKET guarantees message boundaries are preserved on writes and that
// messages are delivered in order they are sent
// max size is 65536
const { socketpair, send_string, recv2, AF_UNIX, SOCK_SEQPACKET, close } = net
const { assert, ptr } = lo

const decoder = new TextDecoder()
const buf = ptr(new Uint8Array(1024))
const runs = parseInt(lo.args[2] || '5000', 10)

const worker = new Worker(`
const { net } = lo.load('net')
const { assert, core, fd, ptr } = lo
const { send_string, recv2 } = net

const buf = ptr(new Uint8Array(1024))
const decoder = new TextDecoder()
assert(decoder.decode(buf.subarray(0, recv2(fd, buf.ptr, buf.size))) === 'hello')
assert(send_string(fd, 'goodbye') === 7)
`)

const buffer = ptr(new Uint8Array(new SharedArrayBuffer(64)))
const fds = ptr(new Uint32Array(2))
assert(socketpair(AF_UNIX, SOCK_SEQPACKET, 0, fds.ptr) === 0)
const [ hostfd, workerfd ] = fds
worker.create(workerfd, buffer)

let start = Date.now()
for (let i = 0; i < runs; i++) {
  assert(worker.start())
  assert(send_string(hostfd, 'hello') === 5)
  assert(decoder.decode(buf.subarray(0, recv2(hostfd, buf.ptr, buf.size))) === 'goodbye')
  assert(worker.waitfor()[0] === 0)
}
const elapsed = Date.now() - start

worker.free()
close(hostfd)
close(workerfd)

const rate = runs / (elapsed / 1000)
console.log(rate)

