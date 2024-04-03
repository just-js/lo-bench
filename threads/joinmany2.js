import { Bench } from 'lib/bench.mjs'
import { Worker } from 'lib/worker.js'

const script = `
//while(1) {}
lo.core.sleep(20)
`

function create_worker () {
  const worker = new Worker(script, [])
  worker.create()
  return worker
}

const threads = 100
const workers = new Set()
for (let i = 0; i < threads; i++) workers.add(create_worker())
console.log(workers.values())
const bench = new Bench()
const runs = 30000 * (1000 / threads)
let running = workers.length

workers.forEach(worker => worker.start())

while (1) {
  bench.start('poll')
  for (let i = 0; i < runs; i++) {
    if (workers.size === 0) break
    for (let worker of workers) {
      if (!worker.poll()) {
        workers.delete(worker)
      }
    }
  }
  bench.end(runs)
  if (workers.size === 0) break
}
