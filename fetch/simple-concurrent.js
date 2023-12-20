import { http_get } from 'lib/fetch.js'
import { Loop } from 'lib/loop.js'
import { to_size_string } from '../crypto/lib/bench.mjs'

const loop = new Loop()

const { assert } = lo

let responses = 0
let requests = 0
let bytes_in = 0

const latencies = []

function fetch (repeat = 1) {
  requests++
  const started = lo.hrtime()
  http_get('https://localhost:3000/', loop, (err, res) => {
    if (err) throw err
    assert(res.status === 200)
    let received = 0
    res.on_bytes = buf => {
      received += buf.length
    }
    res.on_complete = () => {
      const { content_length, body_bytes, chunked } = res
      //console.log(`response complete: ${body_bytes} of ${chunked ? 'unknown' : content_length}`)
      const finished = lo.hrtime()
      //latencies.push(finished - started)
      assert(chunked ? true : body_bytes === content_length)
      assert(received === body_bytes)
      responses++
      bytes_in += received
      repeat--
      if (repeat > 0) {
        fetch(repeat)
        return
      }
      res.close()
    }
  })
}

const start = Date.now()
const clients = parseInt(lo.args[2] || '1', 10)
const repeat = parseInt(lo.args[3] || '1', 10)

for (let i = 0; i < clients; i++) fetch(repeat)

function run_loop () {
  if (loop.size === 0) {
    assert(responses === requests)
    const elapsed = Date.now() - start
    console.log(`${responses} responses received for ${requests} requests`)
    console.log(`received ${to_size_string(bytes_in)} in ${elapsed} milliseconds`)
    const rps = Math.floor(responses / (elapsed / 1000))
    const thru = Math.floor(bytes_in / (elapsed / 1000))
    console.log(`rps ${rps} thru ${to_size_string(thru)}`)
//    console.log(latencies)
    return
  }
  loop.poll()
  lo.runMicroTasks()
  lo.nextTick(run_loop)
}

run_loop()
