import { Worker } from 'lib/worker.js'

const { assert, ptr } = lo

const worker = new Worker(`
let counter = 0
const size = new Int32Array(lo.buffer, 8, 12)
const max = size[0]
while (1) {
  Atomics.wait(size, 0, 0)
  if (++counter === max) break
}

size[0] = counter
`)

const buffer = ptr(new Uint8Array(new SharedArrayBuffer(64)))
const size = new Int32Array(buffer.buffer, 8, 12)

worker.create(0, buffer)
assert(worker.start())

const max = parseInt(lo.args[2] || 10_000_000)
size[0] = max

let notifications = 0
const start = Date.now()
while (1) {
  if (!worker.poll()) break
  Atomics.notify(size, 0, 1)
  notifications++
}
const elapsed = Date.now() - start
assert(size[0] === max)
const rate = Math.ceil(max / (elapsed / 1000))
console.log(`rate ${rate} ops/sec`)
console.log(notifications)
//worker.free()
