import { Bench } from 'lib/bench.mjs'
import { Worker } from 'lib/worker.js'

const { ptr } = lo
const script = `
//while(1) {}
lo.core.sleep(20)
`

function create_worker () {
  const worker = new Worker(script, [])
  worker.create(0, thread_buffer)
  return worker
}

const thread_buffer = ptr(new Uint8Array(new SharedArrayBuffer(8)))
const threads = 1
const workers = []
for (let i = 0; i < threads; i++) workers.push(create_worker())
const bench = new Bench()
const runs = 30000 * (1000 / threads)
let running = workers.length

workers.forEach(worker => worker.start())

while (1) {

  bench.start('poll')
  for (let i = 0; i < runs; i++) {
    const size = workers.length
    for (let j = 0; j < size; j++) {
      const worker = workers[j]
      if (!worker.tid) continue
      if (!worker.poll()) {
        running -= 1
        worker.tid = 0
      }
    }
    if (running === 0) break
  }
  bench.end(runs)

  if (running === 0) break
}
