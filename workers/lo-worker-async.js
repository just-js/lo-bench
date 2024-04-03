import { Loop } from 'lib/loop.js'
import { Worker } from 'lib/worker.js'

const { net } = lo.load('net')
const { socketpair, AF_UNIX, SOCK_STREAM } = net
const { assert, ptr } = lo

const decoder = new TextDecoder()

const worker = new Worker(`
lo.core.write_string(lo.fd, 'hello', 5)
//lo.core.close(lo.fd)
`)
const buffer = ptr(new Uint8Array(new SharedArrayBuffer(64)))
const fds = ptr(new Uint32Array(2))
assert(socketpair(AF_UNIX, SOCK_STREAM, 0, fds.ptr) === 0)
const [ hostfd, workerfd ] = fds
const iobuf = new Uint8Array(1024)


const runs = parseInt(lo.args[2] || '1000', 10)

worker.create(workerfd, buffer)

let start = Date.now()
for (let i = 0; i < runs; i++) {
  assert(worker.start())
  const res = iobuf.subarray(0, lo.core.read(hostfd, iobuf, iobuf.length))
  assert(decoder.decode(res) === 'hello')
  worker.waitfor()
//  lo.core.close(hostfd)
}
const elapsed = Date.now() - start
//worker.free()

const rate = runs / (elapsed / 1000)
console.log(rate)
