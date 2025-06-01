import { Bench } from '../lib/bench.mjs'

const tests = require('./urltestdata.json')

for (const test of tests) {
  if (test.constructor.name === 'String') continue
  const { input, href, base, failure } = test
//  console.log(input)
  try {
    if (base) {
      const parsed = new URL(input, base)
      assert(parsed.href === href)
    } else {
      const parsed = new URL(input)
      assert(parsed.href === href)
    }
  } catch (err) {
    if (!failure) throw err
  }
}

