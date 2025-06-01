import { http_get } from './lib/fetch.js'
import { Loop } from 'lib/loop.js'
import { write_flags, write_mode, dir_flags, isDir } from 'lib/fs.js'
import { inflate } from 'lib/inflate.js'
import { untar } from 'lib/untar.js'

const loop = new Loop()

const { assert, core } = lo
const { open, close, write, readFile, mkdir, chdir, unlink } = core

const disposition_rx = /attachment; filename=(.+)/

function get_filename (content_dispoition_header) {
  const match = disposition_rx.exec(content_dispoition_header)
  if (match && match.length > 1) {
    return match[1]
  }
  return ''
}

if (!isDir('tmp')) assert(mkdir('tmp', dir_flags) === 0)

http_get('https://codeload.github.com/WireGuard/wireguard-tools/tar.gz/master', loop, (err, res) => {
  if (err) throw err
  assert(res.status === 200)
  const {
    content_disposition, content_type, content_length, etag, date 
  } = res.headers
  console.log(content_disposition)
  let file_name = 'tmp/download.bin'
  if (content_disposition) {
    file_name = `tmp/${get_filename(content_disposition) || 'download.bin'}`
  }
  console.log(`file_name: ${file_name}`)
  console.log(`content_type: ${content_type}`)
  console.log(`content_length: ${content_length}`)
  console.log(`etag: ${etag}`)
  console.log(`date: ${date}`)
  const fd = open(file_name, write_flags, write_mode)
  assert(fd > 2)
  res.on_bytes = buf => {
    assert(write(fd, buf, buf.length) === buf.length)
  }
  res.on_complete = () => {
    const { content_length, body_bytes, chunked } = res
    close(fd)
    console.log(`response complete: ${body_bytes} of ${chunked ? 'unknown' : content_length}`)
    res.close()
//    const tarball = inflate(readFile(file_name))
//    assert(chdir('tmp') === 0)
//    untar(tarball)
//    assert(chdir('../') === 0)
//    assert(unlink(file_name) === 0)
  }
})

while (loop.poll() > 0) lo.runMicroTasks()
