import { Bench } from 'lib/bench.js'

function parse_url (url) {
  const protocolEnd = url.indexOf(':')
  const protocol = url.slice(0, protocolEnd)
  const hostnameEnd = url.indexOf('/', protocolEnd + 3)
  let hostname = url.slice(protocolEnd + 3, hostnameEnd)
  const path = url.slice(hostnameEnd)
  let port = 80
  if (protocol === 'https') port = 443
  if (hostname.indexOf(':') > -1) {
    const parts = hostname.split(':')
    hostname = parts[0]
    port = parseInt(parts[1], 10)
  }
  return { protocol, hostname, path, port }
}

const iter = 5
const runs = 30000000
const bench = new Bench()

const url = 'https://codeload.github.com/WireGuard/wireguard-tools/tar.gz/master'

console.log(JSON.stringify(parse_url(url)))

for (let i = 0; i < iter; i++) {
  bench.start('parse_url')
  for (let j = 0; j < runs; j++) {
    parse_url(url)
  }
  bench.end(runs)
}
