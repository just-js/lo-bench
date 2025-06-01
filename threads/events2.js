import { Worker } from 'lib/worker.js'
import { system } from 'lib/system.js'

const { assert, core, ptr, utf8_encode_into_at_offset } = lo
const { write } = core

const worker = new Worker(`
import { mem } from 'lib/proc.js'

const { fd, ptr, utf8_decode, core } = lo
const { read, write } = core

const szbuf = new Uint8Array(8)
const sz32 = new Uint32Array(lo.buffer, 0, 4)
const payload = ptr(new Uint8Array(lo.buffer, 4))

while (1) {
  const bytes = read(fd, szbuf, 8)
  if (bytes <= 0) break
  const size = sz32[0]
  const src = utf8_decode(payload.ptr, size)
  try {
    const v = eval(src)
    console.log(v)
    if(v === 100000) break
  } catch (err) {
    console.log(err.stack)
  }
}

`)

const sigbuf = new BigInt64Array([0xfffffffffffffffen])
const buf = ptr(new Uint8Array(1024 * 1024))
const szview = new DataView(buf.buffer, 0, 4)
const fd = system.eventfd(0, 0)
worker.create(fd, buf)
assert(worker.start())

let i = 0
while (1) {
  szview.setUint32(0, utf8_encode_into_at_offset(`${i++}`, buf, 4), true)
  // becasue we write the max value each time. write should block if we overflow
  // until the other side reads the current value
  assert(write(fd, sigbuf, 8) === 8)
  if (!worker.poll()) break
}

//assert(worker.waitfor()[0] === 0)
//assert(worker.exit_code === 0)
worker.free()
