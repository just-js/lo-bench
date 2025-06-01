import { measure } from '../fs/lib/bench.mjs'

let spawns = 0

const workerSource = `
self.onmessage = () => {
  postMessage('goodbye')
  process.exit()
}
`

const blob = new Blob([workerSource], { type: 'application/javascript' })
const url = URL.createObjectURL(blob)

function spawnWorker () {
  const worker = new Worker(url)
  worker.postMessage('hello')
  worker.onmessage = () => {
    worker.terminate()
    spawns++
    spawnWorker()
  }
}

setInterval(() => {
  measure.log(spawns)
  spawns = 0
  measure.start()
}, 1000)

measure.start()
spawnWorker()

