import { fetch } from 'lib/curl.js'
import { isFile } from 'lib/fs.js'

if (!isFile('openssl.tar.gz')) {
  fetch('https://www.openssl.org/source/openssl-3.0.12.tar.gz', 'openssl.tar.gz')
}

if (!isFile('lo.tar.gz')) {
  fetch('https://codeload.github.com/just-js/lo/tar.gz/0.0.13-pre', 'lo.tar.gz')
}
