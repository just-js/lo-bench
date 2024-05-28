import { Bench } from '../lib/bench.mjs'

const bench = new Bench()
const runs = 6000000

const url = 'https://codeload.github.com/WireGuard/wireguard-tools/tar.gz/master'
const expected = url

while (1) {

  for (let i = 0; i < 5; i++) {
    bench.start('(new URL()).href')
    for (let j = 0; j < runs; j++) {
      assert((new URL(url)).href === expected)
    }
    bench.end(runs)
  }

  for (let i = 0; i < 5; i++) {
    bench.start('URL.canParse')
    for (let j = 0; j < runs; j++) {
      assert(URL.canParse(url))
    }
    bench.end(runs)
  }

}
