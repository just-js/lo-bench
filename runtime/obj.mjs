import { Bench } from '../lib/bench.mjs'

const obj = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9,
  j: 10
}

const bench = new Bench()
const runs = 30000000

const fn = () => ({ ...obj })

console.log(JSON.stringify(fn()))

for (let i = 0; i < 5; i++) {
  bench.start('object spread')
  for (let j = 0; j < runs; j++) {
    fn()
  }
  bench.end(runs)
}
