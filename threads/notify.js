import { Worker } from 'lib/worker.js'

const { assert, ptr } = lo

const worker = new Worker(`
const size = new Int32Array(lo.buffer)
const max = Atomics.load(size, 0)
let counter = 0

while (Atomics.wait(size, 1, 1) === 'ok') {
  if (++counter === max) break
}

Atomics.store(size, 2, counter)
`)

const buffer = ptr(new Uint8Array(new SharedArrayBuffer(64)))
const size = new Int32Array(buffer.buffer)

worker.create(0, buffer)
assert(worker.start())

const max = parseInt(lo.args[2] || 1_000_00)
size[0] = max
size[1] = 1

const start = Date.now()
let calls = 0
while (1) {
  if (Atomics.notify(size, 1, 1) === 1) {
    calls++
  }
  if (!worker.poll()) break
}
const elapsed = Date.now() - start
const result = Atomics.load(size, 2)
assert(result === max)
const rate = Math.ceil(max / (elapsed / 1000))
console.log(`rate ${rate} ops/sec`)
//worker.free()
assert(calls === result)
assert(calls >= result)
