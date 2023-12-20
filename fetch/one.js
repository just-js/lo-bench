import { fetch } from 'lib/fetch.js'
import { Loop } from 'lib/loop.js'
import { Timer } from 'lib/timer.js'

const { assert, core } = lo
const { sleep } = core

globalThis.loop = new Loop()

const timer = new Timer(loop, 1000, async () => {
  const res = await fetch(`https://localhost:3000/big`)
  console.log('o')
  assert(res.status == 200)
  console.log(JSON.stringify(res))
  const body = await res.bytes()
  assert(body.length === 1048576)
  console.log(body.length)
})

function poll () {
  lo.runMicroTasks()
  if (loop.size === 0) {
    console.log('loop is empty')
    return
  }
  if (loop.poll(0) < 0) {
    console.log('loop has errored')
    return
  }
  lo.runMicroTasks()
  lo.nextTick(poll)
}

poll()
