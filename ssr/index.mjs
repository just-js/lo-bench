import { mem, cputime, colors } from '../lib/bench.mjs'
import { createServer } from 'node:http'
import Template from './hello.marko.mjs'
import data from './data.json' assert { type: 'json' };

const { AC, AD, AY } = colors

let rps = 0

createServer((req, res) => {
    res.setHeader("content-type", "text/html");
    res.end(Template.renderToString(data));
    rps++
  })
  .listen(3000)

setInterval(() => {
  const [ usr, , sys ] = cputime()
  console.log(`${AC}rps${AD} ${rps} ${AC}rss${AD} ${mem()} ${AY}usr${AD} ${usr.toString().padStart(3, ' ')} ${AY}sys${AD}  ${sys.toString().padStart(3, ' ')} ${AY}tot${AD} ${(usr + sys).toString().padStart(3, ' ')}`)
  rps = 0
}, 1000);

