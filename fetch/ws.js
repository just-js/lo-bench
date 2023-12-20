//https://websocketking.com/
import { fetch } from 'lib/fetch.js'
import { Loop } from 'lib/loop.js'

globalThis.loop = new Loop()

async function main () {
  const res = await fetch('https://websocketking.com/')
  console.log(JSON.stringify(res))
  res.close()
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
