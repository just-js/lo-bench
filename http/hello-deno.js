const mem = () => Math.floor((Number((new TextDecoder()).decode(Deno.readFileSync('/proc/self/stat')).split(' ')[23]) * 4096)  / (1024))

Deno.serve({
  port: 3000
}, (req) => {
    const { url, method, headers } = req
    stats.rps++
    return new Response('Hello, World!') 
})

const stats = { rps: 0 }

setInterval(() => {
  console.log(`rps ${stats.rps} rss ${mem()}`)
  stats.rps = 0
}, 1000)
