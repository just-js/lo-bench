import { fetch } from 'lib/fetch.js'
import { Loop } from 'lib/loop.js'

globalThis.loop = new Loop()

async function main () {
  const results = await Promise.all((new Array(100)).fill(0).map(e => fetch(`https://localhost:3000/`)))
  for (const res of results) {
    const body = await res.bytes()
    console.log(body.length)
    res.close()
  }
}

main().catch(err => console.error(err.stack))

function poll () {
  let tasks = lo.runMicroTasks()
  if (tasks > 0) console.log(tasks)
  if (loop.size === 0) return
  if (loop.poll(0) < 0) return
  tasks = lo.runMicroTasks()
  if (tasks > 0) console.log(tasks)
  lo.nextTick(poll)
}

lo.nextTick(poll)
