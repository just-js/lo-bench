const fs = require('node:fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
}

require('node:https')
  .createServer(options, (req, res) => {
//    const { url, method, headers } = req
    res.end('Hello, World')
  })
  .listen(3000, '127.0.0.1', () => {})
