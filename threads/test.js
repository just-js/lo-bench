import { spawn, pthread } from 'lib/thread.js'
import { system } from 'lib/system.js'

const { core, utf8Length, assert, colors, args, builtin } = lo
const {
  isolate_context_create, isolate_context_size, isolate_context_destroy, 
  readFile, dlsym, sleep
} = core
const { EBUSY } = pthread
const { sysconf, _SC_NPROCESSORS_ONLN, exit } = system


const argc = 0
const argv = 0
const cleanup = 1
const on_exit = 0
const snapshot = 0
const start_isolate_address = assert(dlsym(0, 'lo_start_isolate'))
const runtime = lo.builtin('main.js')
const runtime_len = utf8Length(runtime)

/* from lo.h
struct isolate_context {
  int rc;
  int argc;
  int fd;
  int buflen;
  int cleanup;
  int onexit;
  unsigned int main_len;
  unsigned int js_len;
  uint64_t start;
  char** argv;
  char* main;
  char* js;
  char* buf;
  char* globalobj;
  char* scriptname;
  void* startup_data;
  void* isolate;
};


*/

function makeArgs (args) {
  const argb = new Array(args.length)
  if (!args.length) return { args: new Uint8Array(0) }
  const b64 = new BigUint64Array(args.length + 1)
  for (let i = 0; i < args.length; i++) {
    const str = argb[i] = cstr(args[i])
    // @ts-ignore
    b64[i] = BigInt(str.ptr)
  }
  return {
    args: ptr(new Uint8Array(b64.buffer)),
    cstrings: argb
  }
}

class Worker {
  tid = -1
  context = new Uint8Array(isolate_context_size())
  status = new Uint32Array(2)
  argc = 0
  argv = 0
  cleanup = 1
  on_exit = 0
  snapshot = 0
  start_address = start_isolate_address
  runtime = builtin('main.js')

  constructor (src) {
    
    isolate_context_create(argc, argv, runtime, runtime_len, src, 
      utf8Length(src), 0, 0, 0, lo.hrtime(), 'lo', script_path, cleanup, 
      on_exit, snapshot, this.context)
  }

  poll () {
    const rc = pthread.tryJoin(this.tid, this.status)
    if (rc === EBUSY) return false
    return true
  }

  spawn () {
    this.tid = spawn(this.start_address, this.context)
  }

  kill () {

  }

  destroy () {
    isolate_context_destroy(this.context)
  }
}

function create_worker (src, script_path = 'thread.js') {
  const worker = new Worker()
  isolate_context_create(argc, argv, runtime, runtime_len, src, 
    utf8Length(src), 0, 0, 0, lo.hrtime(), 'lo', script_path, cleanup, 
    on_exit, snapshot, worker.context)
  worker.spawn()
  return worker
}

const script = `
console.log('hello')
`
const worker = create_worker(script)

console.log(worker.tid)

while (!worker.poll()) {
  console.log(worker.status)
  sleep(1)
}


/*
const tids = []

const context = new Uint8Array(isolate_context_size())
isolate_context_create(argc, argv, runtime, utf8Length(runtime), script, 
  utf8Length(script), 0, 0, 0, lo.hrtime(), 'lo', script_path, cleanup, 
  on_exit, snapshot, context)

for (let i = 0; i < threads; i++) {
  tids.push(assert(spawn(start_isolate_address, context)))
}

tids.forEach(join)

isolate_context_destroy(context)
*/
