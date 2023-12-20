import * as _ from '../crypto/lib/bench.mjs'

let responses = 0
let requests = 0
let bytes_in = 0

const latencies = []

function do_fetch (repeat = 1) {
  requests++
  let content_length = 0
  const started = performance.now()
  fetch('https://localhost:3000/')
    .then(res => {
      content_length = parseInt(res.headers.get('Content-Length'), 10)
      return res.text()
    })
    .then(text => {
      responses++
      bytes_in += text.length
      const finished = performance.now()
      assert(text.length === content_length)
      repeat--
      if (repeat > 0) {
        do_fetch(repeat)
        return
      }
    })
}

const start = performance.now()
const clients = parseInt(Bun.argv[2] || '1', 10)
const repeat = parseInt(Bun.argv[3] || '1', 10)

for (let i = 0; i < clients; i++) do_fetch(repeat)

