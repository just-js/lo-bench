import { Worker } from 'lib/worker.js'
import { system } from 'lib/system.js'

// https://topic.alibabacloud.com/a/linux-eventfd-analysis_1_16_30154644.html

const { assert, core, ptr } = lo
const { write, close, O_NONBLOCK, EAGAIN } = core

const worker = new Worker(`
const { fd, ptr, utf8_decode, core } = lo
const { read, write, close, EAGAIN } = core

const sig = new Uint8Array(8)
const size = new Uint32Array(lo.buffer, 8, 12)

let counter = size[0]
size[0] = 0

while (1) {
  const bytes = read(fd, sig, 8)
  if (bytes < 0 && lo.errno === EAGAIN) continue
  if (bytes !== 8) break
  if (--counter === 0) break
}

close(fd)

`)

const buffer = ptr(new Uint8Array(64))
const sig = new BigInt64Array([0xfffffffffffffffen])
const size = new Uint32Array(buffer.buffer, 8, 12)

const fd = system.eventfd(0, O_NONBLOCK)
assert(fd > 0)
worker.create(fd, buffer)
assert(worker.start())

const max = parseInt(lo.args[2] || 10_000_00)
size[0] = max

const start = Date.now()
while (1) {
  if (!worker.poll()) break
  const written = write(fd, sig, 8)
  if (written === 8 || (written === -1 && lo.errno === EAGAIN)) continue
  break
}
const elapsed = Date.now() - start
close(fd)
//worker.stop()
assert(size[0] === 0)
const rate = Math.ceil(max / (elapsed / 1000))
console.log(`rate ${rate} ops/sec`)
//worker.free()
