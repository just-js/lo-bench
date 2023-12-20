import { http_get } from 'lib/fetch.js'
import { Loop } from 'lib/loop.js'
import { write_flags, write_mode } from 'lib/fs.js'

const loop = new Loop()

const { assert, core } = lo
const { open, close, write, readFile } = core

http_get('https://localhost:3000/big', loop, (err, res) => {
  if (err) throw err
  const file_name = '/dev/shm/big.bin'
  assert(res.status === 200)
  const fd = open(file_name, write_flags, write_mode)
  assert(fd > 2)
  res.on_bytes = buf => {
    assert(write(fd, buf, buf.length) === buf.length)
  }
  res.on_complete = () => {
    const { content_length, body_bytes, chunked } = res
    close(fd)
    //console.log(`response complete: ${body_bytes} of ${chunked ? 'unknown' : content_length}`)
    assert(chunked ? true : body_bytes === content_length)
    assert(readFile(file_name).length === content_length)
    res.close()
  }
})

while (loop.poll() > 0) lo.runMicroTasks()
