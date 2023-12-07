const fs = require('node:fs')

const mem = () => Math.floor((Number((new TextDecoder()).decode(fs.readFileSync('/proc/self/stat')).split(' ')[23]) * 4096)  / (1024))

Bun.serve({
  fetch (req) {
    const { url, method, headers } = req
    stats.rps++
    return new Response('Hello, World!') 
  },
  port: 3000
})

const stats = { rps: 0 }

setInterval(() => {
  console.log(`rps ${stats.rps} rss ${mem()}`)
  stats.rps = 0
}, 1000)
