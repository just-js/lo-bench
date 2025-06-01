import { Assembler, Compiler, Registers } from 'lib/asm.js'
import { bind } from 'lib/ffi.js'
import { Bench } from 'lib/bench.js'

const { system } = lo.load('system')

const { core, assert, ptr, hrtime } = lo
const { dlopen, dlsym, RTLD_DEFAULT } = core
const { rax, rdi, rsi } = Registers
const { clock_gettime, CLOCK_MONOTONIC, CLOCK_REALTIME, CLOCK_BOOTTIME } = system

const vdso_handle = dlopen('linux-vdso.so.1', core.RTLD_LAZY | core.RTLD_LOCAL | core.RTLD_NOLOAD)
const vdso_clock_gettime_sym = assert(dlsym(assert(vdso_handle), '__vdso_clock_gettime'))
const vdso_getcpu_sym = assert(dlsym(assert(vdso_handle), '__vdso_getcpu'))
const vdso_gettimeofday_sym = assert(dlsym(assert(vdso_handle), '__vdso_gettimeofday'))
const vdso_time_sym = assert(dlsym(assert(vdso_handle), '__vdso_time'))

const getcpu_sym = assert(dlsym(RTLD_DEFAULT, 'getcpu'))
const getcpu = bind(getcpu_sym, 'i32', ['pointer', 'pointer'])
const getcpu_buffers = bind(getcpu_sym, 'i32', ['buffer', 'buffer'])

const asm = new Assembler()
const compiler = new Compiler()

const cpu = ptr(new Uint8Array(16))
const node = ptr(cpu.subarray(8))

asm.reset()
asm.movabs(cpu.ptr, rdi)
asm.movreg(rdi, rsi)
asm.add(rsi, 8)
//asm.movabs(cpu.ptr + 8, rsi)
asm.jmp(vdso_getcpu_sym)
//console.log(asm.src)
const vdso_getcpu = bind(compiler.compile(asm.bytes()), 'i32', [])

const timespec = ptr(new Uint32Array(4))
asm.reset()
asm.movabs(CLOCK_BOOTTIME, rdi)
asm.movabs(timespec.ptr, rsi)
asm.jmp(vdso_clock_gettime_sym)
//console.log(asm.src)
const vdso_clock_gettime = bind(compiler.compile(asm.bytes()), 'i32', [])

assert(vdso_getcpu() === 0)
assert(getcpu(cpu.ptr, cpu.ptr + 8) === 0)
assert(getcpu_buffers(cpu, node) === 0)

assert(vdso_clock_gettime() === 0)

assert(clock_gettime(CLOCK_BOOTTIME, timespec.ptr) === 0)

const bench = new Bench()
const iter = 5

// this is ~45% faster = 63m v 45m ops/sec
{
  const runs = 100000000
  for (let i = 0; i < iter; i++) {
    bench.start('vdso_getcpu')
    for (let j = 0; j < runs; j++) {
      assert(vdso_getcpu() === 0)
    }
    bench.end(runs)
  }
}

{
  const runs = 100000000
  for (let i = 0; i < iter; i++) {
    bench.start('vdso_clock_gettime')
    for (let j = 0; j < runs; j++) {
      assert(vdso_clock_gettime() === 0)
    }
    bench.end(runs)
  }
}

{
  const runs = 100000000
  for (let i = 0; i < iter; i++) {
    bench.start('clock_gettime')
    for (let j = 0; j < runs; j++) {
      assert(clock_gettime(CLOCK_BOOTTIME, timespec.ptr) === 0)
    }
    bench.end(runs)
  }
}

{
  const runs = 100000000
  for (let i = 0; i < iter; i++) {
    bench.start('getcpu_buffers')
    for (let j = 0; j < runs; j++) {
      assert(getcpu_buffers(cpu, node) === 0)
    }
    bench.end(runs)
  }
}

{
  const runs = 100000000
  for (let i = 0; i < iter; i++) {
    bench.start('getcpu')
    for (let j = 0; j < runs; j++) {
      assert(getcpu(cpu.ptr, node.ptr) === 0)
    }
    bench.end(runs)
  }
}
