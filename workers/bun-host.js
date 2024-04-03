const workerURL = new URL('bun-worker.js', import.meta.url).href

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
  const worker = new Worker(workerURL)
  worker.postMessage('hello')
  worker.onmessage = () => {
//    worker.terminate()
    spawns++
    spawnWorker()
  }
}

setInterval(() => {
  console.log(spawns)
  spawns = 0
}, 1000)

spawnWorker()

