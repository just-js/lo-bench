const tests = require('./urltestdata.json')

for (const test of tests) {
  if (test.constructor.name === 'String') continue
  const { input, href, base, failure } = test
  if (base) {
    if (URL.canParse(input, base)) continue
  } else {
    if (URL.canParse(input)) continue
  }
  if (failure) continue
  throw new Error(`invalid url ${input} ${base}`)
}

