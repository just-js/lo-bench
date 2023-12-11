Bun.serve({
  fetch () {
    stats.rps++
    return new Response('Hello, World!') 
  },
  port: 3000,
  certFile: './cert.pem',
  keyFile: './key.pem'
})

const stats = { rps: 0 }

setInterval(() => {
  console.log(`rps ${stats.rps}`)
  stats.rps = 0
}, 1000)
