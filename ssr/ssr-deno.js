import { mem, cputime, colors } from '../lib/bench.mjs'
import Template from './hello.marko.mjs'
import data from './data.json' assert { type: 'json' };

const { AC, AD, AY } = colors

let rps = 0

Deno.serve({
  port: 3000,
  reusePort: true
}, () => {
  rps++
  return new Response(Template.renderToString(data)) 
})

setInterval(() => {
  const [ usr, , sys ] = cputime()
  console.log(`${AC}rps${AD} ${rps} ${AC}rss${AD} ${mem()} ${AY}usr${AD} ${usr.toString().padStart(3, ' ')} ${AY}sys${AD}  ${sys.toString().padStart(3, ' ')} ${AY}tot${AD} ${(usr + sys).toString().padStart(3, ' ')}`)
  rps = 0
}, 1000);

