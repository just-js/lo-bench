import { fetch } from 'lib/fetch.js'
import { Loop } from 'lib/loop.js'
import { Timer } from 'lib/timer.js'
import { Stats } from '../http/lib/stats.js'

const { assert } = lo

globalThis.loop = new Loop()

async function get () {
  const res = await fetch(`https://localhost:3000/big`)
  assert(res.status == 200)
  const body = await res.bytes()
  assert(body.length === 1048576)
  res.close()
  stats.rps++
  get().catch(err => console.error(err.stack))
  return res
}

async function main () {
  const jobs = 1000
  const results = await Promise.all((new Array(jobs)).fill(0).map(e => get()))
  assert(results.length === jobs)
}

const stats = new Stats()

const timer = new Timer(loop, 1000, () => {
  stats.log()
})

main().catch(err => console.error(err.stack))

function poll () {
  if (loop.size === 0) return
  if (loop.poll(0) < 0) return
  lo.nextTick(poll)
}

lo.nextTick(poll)
