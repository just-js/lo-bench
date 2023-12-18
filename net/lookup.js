import { Resolver } from 'lib/dns/dns.js'
import { Loop } from 'lib/loop.js'

const loop = new Loop()
const resolver = new Resolver(loop)

resolver.lookup(lo.args[2] || 'google.com', (err, ip) => {
  if (err) {
    console.error(err.stack)
    return
  }
  console.log(ip)  
})

while (loop.poll() > 0) {}
