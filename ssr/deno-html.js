import { mem, cputime, colors } from '../fs/lib/bench.mjs'
import { compile } from './lib/html.js'

const encoder = new TextEncoder()
const Template = compile(encoder.encode(`<!DOCTYPE html><html lang=en><body><table>{{#each this}}<tr><td>{{id}}</td><td>{{name}}</td></tr>{{/each}}</table></body></html>`), 'data', 'data', { rawStrings: false }).call
import foo from './data.json' with { type: 'json' };

const rows = parseInt(Deno.args[0] || '1', 10)
console.log(rows)
const data = foo.slice(0, rows)

const { AC, AD, AY } = colors

let rps = 0

const opts = {
  headers: { "Content-Type": "text/html;charset=utf-8" },
}

Deno.serve({
  port: 3000
}, () => {
  rps++
  return new Response(Template.call(data), opts) 
})

setInterval(() => {
  const [ usr, sys ] = cputime()
  console.log(`${AC}rps${AD} ${rps} ${AC}rss${AD} ${mem()} ${AY}usr${AD} ${usr.toString().padStart(3, ' ')} ${AY}sys${AD}  ${sys.toString().padStart(3, ' ')} ${AY}tot${AD} ${(usr + sys).toString().padStart(3, ' ')}`)
  rps = 0
}, 1000);

