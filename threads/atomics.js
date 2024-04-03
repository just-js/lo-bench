import { Worker } from 'lib/worker.js'

const { assert, ptr } = lo

const worker_source = `
let counter = 0
const shared = new Uint32Array(lo.buffer)
const max = shared[1]
while (1) {
  Atomics.add(shared, 0, 1)
  if (++counter === max) break
}
Atomics.store(shared, 1, counter)
`

const buffer = ptr(new Uint8Array(new SharedArrayBuffer(64)))
const shared = new Uint32Array(buffer.buffer)

function create_worker () {
  const worker = new Worker(worker_source)
  worker.create(0, buffer)
  workers.push(worker)
}

const workers = []

create_worker()
create_worker()
create_worker()
create_worker()

const max = parseInt(lo.args[2] || 20_000_000)
shared[1] = max

let counter = 0

workers.forEach(worker => assert(worker.start()))

const start = Date.now()

while (1) {
  Atomics.add(shared, 0, 1)
  if (++counter === max) break
  if (counter % 1000000 === 0) console.log(`counter ${counter} shared ${Atomics.load(shared, 0)}`)
}
workers.forEach(worker => worker.waitfor())

const elapsed = Date.now() - start

console.log(`counter ${counter} shared ${Atomics.load(shared, 0)}`)

const rate = Math.ceil(max / (elapsed / 1000))
console.log(`rate ${rate} ops/sec`)

assert(Atomics.load(shared, 0) === max * (workers.length + 1))
assert(Atomics.load(shared, 1) === max)
workers.forEach(worker => worker.free())
