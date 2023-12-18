import { Bench } from 'lib/bench.js'
import { mem } from 'lib/proc.js'
import { spawn, join } from 'lib/thread.js'

const { core, utf8Length, assert } = lo
const {
  isolate_context_create, isolate_context_size,
  isolate_context_destroy, readFile, dlsym
} = core

const decoder = new TextDecoder()
const argc = 0
const argv = 0
const cleanup = 1
const on_exit = 0
const snapshot = 0
const runtime = lo.builtin('main.js')
const script_path = './test.js'
const script = decoder.decode(readFile(script_path))
const start_isolate_address = assert(dlsym(0, 'lo_start_isolate'))
const bench = new Bench(true, mem)
let iter = 20
const runs = 600

const context = new Uint8Array(isolate_context_size())
isolate_context_create(argc, argv, runtime, utf8Length(runtime), script, 
  utf8Length(script), 0, 0, 0, lo.hrtime(), 'lo', script_path, cleanup, 
  on_exit, snapshot, context)

for (let i = 0; i < iter; i++) {
  bench.start('isolate_start')
  for (let j = 0; j < runs; j++) {
    join(spawn(start_isolate_address, context))
    //core.isolate_start(context)
  }
  bench.end(runs)
}

isolate_context_destroy(context)

