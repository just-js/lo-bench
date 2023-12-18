Deno.serve({
  port: 3000,
  reusePort: true
}, (req) => {
//    const { url, method, headers } = req
    stats.rps++
    return new Response('Hello, World!') 
})

const stats = { rps: 0 }

setInterval(() => {
  console.log(`rps ${stats.rps}`)
  stats.rps = 0
}, 1000)
