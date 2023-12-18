import { Bench } from 'lib/bench.js'

const { ptr } = lo

const bench = new Bench()
const iter = 5
let runs = 0

const noop = () => {}


console.log(Object.getOwnPropertyNames(lo))
/*
const { hrtime } = lo

runs = 50000000

for (let i = 0; i < iter; i++) {
  bench.start('hrtime')
  for (let j = 0; j < runs; j++) {
    hrtime()
  }
  bench.end(runs)
}

const { getAddress } = lo
const u8 = new Uint8Array(256)

runs = 150000000

for (let i = 0; i < iter; i++) {
  bench.start('getAddress')
  for (let j = 0; j < runs; j++) {
    getAddress(u8)
  }
  bench.end(runs)
}

const { version } = lo

runs = 150000000

for (let i = 0; i < iter; i++) {
  bench.start('version')
  for (let j = 0; j < runs; j++) {
    const x = lo.version
  }
  bench.end(runs)
}

*/

// print

// this is broken
/*
const { runMicroTasks } = lo

runs = 6000000

for (let i = 0; i < iter; i++) {
  bench.start('runMicroTasks')
  for (let j = 0; j < runs; j++) {
    lo.nextTick(noop)
  }
  bench.end(runs)
  runMicroTasks()
}

const { arch } = lo

runs = 15000000

for (let i = 0; i < iter; i++) {
  bench.start('arch')
  for (let j = 0; j < runs; j++) {
    const x = arch()
  }
  bench.end(runs)
}

const { os } = lo

runs = 15000000

for (let i = 0; i < iter; i++) {
  bench.start('os')
  for (let j = 0; j < runs; j++) {
    const x = os()
  }
  bench.end(runs)
}


runs = 15000000

for (let i = 0; i < iter; i++) {
  bench.start('errno')
  for (let j = 0; j < runs; j++) {
    const x = lo.errno
  }
  bench.end(runs)
}


const { builtins } = lo
runs = 1000000000

for (let i = 0; i < iter; i++) {
  bench.start('builtins')
  for (let j = 0; j < runs; j++) {
    const x = builtins()
  }
  bench.end(runs)
}


const { builtin } = lo
runs = 100000000

for (let i = 0; i < iter; i++) {
  bench.start('builtins')
  for (let j = 0; j < runs; j++) {
    const x = builtin('main.js')
  }
  bench.end(runs)
}


const { libraries } = lo
runs = 1000000000

for (let i = 0; i < iter; i++) {
  bench.start('libraries')
  for (let j = 0; j < runs; j++) {
    const x = libraries()
  }
  bench.end(runs)
}


const { load } = lo
runs = 100000000

for (let i = 0; i < iter; i++) {
  bench.start('load')
  for (let j = 0; j < runs; j++) {
    const x = load('core')
  }
  bench.end(runs)
}

const { setModuleCallbacks } = lo
runs = 30000000

for (let i = 0; i < iter; i++) {
  bench.start('setModuleCallbacks')
  for (let j = 0; j < runs; j++) {
    setModuleCallbacks(noop, noop)
  }
  bench.end(runs)
}

{

const { latin1Decode } = lo
runs = 30000000

const encoder = new TextEncoder()
const bytes = ptr(encoder.encode('hello'))

const { length } = bytes
const bptr = bytes.ptr

for (let i = 0; i < iter; i++) {
  bench.start('latin1Decode')
  for (let j = 0; j < runs; j++) {
    latin1Decode(bptr, length)
  }
  bench.end(runs)
}

}

{

const { utf8Decode } = lo
runs = 30000000

const encoder = new TextEncoder()
const bytes = ptr(encoder.encode('hello'))

const { length } = bytes
const bptr = bytes.ptr

for (let i = 0; i < iter; i++) {
  bench.start('utf8Decode')
  for (let j = 0; j < runs; j++) {
    utf8Decode(bptr, length)
  }
  bench.end(runs)
}

}

*/


/*
utf8Decode
utf8Encode
utf8Length
utf8EncodeInto
utf8EncodeIntoAtOffset
wrapMemory
unwrapMemory
getAddress
readMemory
readMemoryAtOffset
setFlags
getMeta
runScript
registerCallback
args
argv
argc
start
colors
load
assert
moduleCache
libCache
requireCache
wrap
cstr
ptr
addr
core
getenv
getcwd

*/
