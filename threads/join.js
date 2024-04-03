import { Bench } from 'lib/bench.mjs'
import { Worker } from 'lib/worker.js'

const script = `
lo.core.sleep(20)
`
const worker = new Worker(script, [])
worker.create()

const bench = new Bench()

const runs = 300000000

worker.start()
while (1) {

  let done = false

  bench.start('poll')
  for (let i = 0; i < runs; i++) {
    done = !worker.poll()
    if (done) break
  }
  bench.end(runs)

  if (done) break
}

worker.waitfor()
worker.free()
