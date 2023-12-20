Bun.serve({
  fetch (req) {
		const url = req.url,
			s = url.indexOf('/', 11),
			q = url.indexOf('?', s + 1),
			path = q === -1 ? url.substring(s) : url.substring(s, q)
    stats.rps++
    if (path === '/') {
      return new Response('Hello, World!') 
    } else if (path === '/big') {
      return new Response(new Uint8Array(1024 * 1024))
    } else if (path === '/bigstring') {
      const text = '💩0000'.repeat(65536 * 2)
      return new Response(text) 
    }
    return new Response('Not Found', { status: 404 })
  },
  port: 3000,
//  reusePort: true,
  certFile: './cert.pem',
  keyFile: './key.pem'
})

const stats = { rps: 0 }

setInterval(() => {
  console.log(`rps ${stats.rps}`)
  stats.rps = 0
}, 1000)
