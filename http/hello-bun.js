import { Stats } from './lib/bench.mjs'

const stats = new Stats()

Bun.serve({
  fetch () {
    stats.rps++
    return new Response('Hello, World!') 
  },
  port: 3000,
  reusePort: true
})

setInterval(() => stats.log(), 1000)
