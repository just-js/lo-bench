require('node:http')
  .createServer((req, res) => {
    //const { url, method, headers } = req
    //res.removeHeader('Connection')
    res.end('Hello, World')
  })
  .listen(3000, '127.0.0.1', () => {})
