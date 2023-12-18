import { Bench } from 'lib/bench.js'

const { assert, core, wrap, wrapMemory, unwrapMemory, ptr } = lo

const { free } = core

const handle = new Uint32Array(2)
const calloc = wrap(handle, core.calloc, 2)

assert(wrapMemory(calloc(1, 1024), 1024, 0).length === 1024)

function create_buffer_calloc (size) {
  return ptr(wrapMemory(calloc(1, size), size, 1))
}

function create_buffer (size) {
  return new Uint8Array(size)
}

const iter = 5
const runs = 1000000
const bench = new Bench()
const size = 16384

while (1) {

for (let i = 0; i < iter; i++) {
  bench.start('create_buffer')
  for (let j = 0; j < runs; j++) {
    const u8 = create_buffer(size)
    if (u8.length !== size) throw new Error('UhOh')
//    unwrapMemory(u8.buffer)
  }
  bench.end(runs)
}

for (let i = 0; i < iter; i++) {
  bench.start('create_buffer_calloc')
  for (let j = 0; j < runs; j++) {
    const u8 = create_buffer_calloc(size)
    if (u8.length !== size) throw new Error('UhOh')
//    unwrapMemory(u8.buffer)
//    free(u8.ptr)
  }
  bench.end(runs)
}


}
