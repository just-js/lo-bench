import { Stats } from './lib/bench.mjs'

const stats = new Stats()

Deno.serve({
  port: 3000,
}, (req) => {
//    const { url, method, headers } = req
    stats.rps++
    return new Response('Hello, World!') 
})

setInterval(() => stats.log(), 1000)
