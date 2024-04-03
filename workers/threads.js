import { spawn, join } from 'lib/thread.js'
import { system } from 'lib/system.js'

const { core, utf8Length, assert, colors, args } = lo
const {
  isolate_context_create, isolate_context_size, isolate_context_destroy, 
  readFile, dlsym
} = core
const { sysconf, _SC_NPROCESSORS_ONLN, exit } = system
const { AM, AY, AD, AC } = colors

function die_usage () {
  console.log(`${AY}Usage${AD}: lo threads.js <${AC}script${AD}> ${AC}<threads>${AD}

  Spawn the JS script passed as last argument in multiple threads.
  By default, the script will be spawned 

${AM}Arguments${AD}:
  <${AC}script${AD}>:                  script to spawn
  <${AC}threads${AD}>:                 number of threads to spawn
                             the default is number of online processors
                             from sysconf
`)
  exit(1)
}

const script_path = args[2]
if (!script_path) die_usage()
const threads = parseInt(args[3] || sysconf(_SC_NPROCESSORS_ONLN), 10)
const decoder = new TextDecoder()
const argc = 0
const argv = 0
const cleanup = 1
const on_exit = 0
const snapshot = 0
const runtime = lo.builtin('main.js')
const script = decoder.decode(readFile(script_path))
const start_isolate_address = assert(dlsym(0, 'lo_start_isolate'))
const buf = 0
const buflen = 0
const fd = 0

const tids = []

const context = new Uint8Array(isolate_context_size())
isolate_context_create(argc, argv, runtime, utf8Length(runtime), script, 
  utf8Length(script), buf, buflen, fd, lo.hrtime(), 'lo', script_path, cleanup, 
  on_exit, snapshot, context)

for (let i = 0; i < threads; i++) {
  tids.push(assert(spawn(start_isolate_address, context)))
}

tids.forEach(join)

isolate_context_destroy(context)
