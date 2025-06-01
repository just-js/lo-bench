import { Bench } from 'lib/bench.mjs'

const { assert, core, wrap, wrapMemory, unwrapMemory, ptr } = lo

const { munmap, free, calloc, mmap, aligned_alloc, malloc } = core
const { PROT_WRITE, PROT_READ, MAP_ANONYMOUS, MAP_PRIVATE } = core

const u32 = new Uint32Array(2)

assert(wrapMemory(calloc(1, 1024), 1024, 0).length === 1024)
assert(wrapMemory(malloc(1024), 1024, 0).length === 1024)
assert(wrapMemory(aligned_alloc(8, 1024), 1024, 0).length === 1024)
assert(wrapMemory(mmap(0, 1024, PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_PRIVATE, -1, u32), 1024, 0).length === 1024)


//console.log(mmap(0, 1024, PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_PRIVATE, -1, u32))

function create_buffer_calloc (size) {
//  return ptr(wrapMemory(malloc(size), size, 1))
  return ptr(wrapMemory(aligned_alloc(8, size), size, 0))
//  return ptr(wrapMemory(mmap(0, size, PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_PRIVATE, -1, u32), size, 0))
//  return ptr(wrapMemory(calloc(1, size), size, 1))
}

function create_buffer (size) {
  return new Uint8Array(size)
}

const iter = 5
const runs = 3000000
const bench = new Bench()
const size = 16384

while (1) {

for (let i = 0; i < iter; i++) {
  bench.start('create_buffer')
  for (let j = 0; j < runs; j++) {
    const u8 = create_buffer(size)
    if (u8.length !== size) throw new Error('UhOh')
    unwrapMemory(u8.buffer)
  }
  bench.end(runs, size)
}

for (let i = 0; i < iter; i++) {
  bench.start('create_buffer_calloc')
  for (let j = 0; j < runs; j++) {
    const u8 = create_buffer_calloc(size)
    if (u8.length !== size) throw new Error('UhOh')
    unwrapMemory(u8.buffer)
//    munmap(u8.ptr)
    free(u8.ptr)
  }
  bench.end(runs, size)
}


}
