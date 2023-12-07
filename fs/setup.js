import { fetch } from 'lib/curl.js'
import { untar } from 'lib/untar.js'
import { inflate } from 'lib/inflate.js'
import { isDir, isFile } from 'lib/fs.js'

const { readFile, O_RDONLY, unlink } = lo.core

if (!isDir('openssl-3.0.12')) {
  untar(inflate(readFile('openssl.tar.gz', O_RDONLY, 
    fetch('https://www.openssl.org/source/openssl-3.0.12.tar.gz', 
      'openssl.tar.gz'))))
}
if (isFile('openssl.tar.gz')) unlink('openssl.tar.gz')

