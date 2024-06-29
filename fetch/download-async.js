import { http_get } from './lib/fetch.js'
import { Loop } from 'lib/loop.js'
import { write_flags, write_mode, dir_flags, is_dir } from 'lib/fs.js'

const loop = new Loop()

const { assert, core } = lo
const { open, close, write, mkdir } = core

const tmp_dir = '/dev/shm/tmp'
if (!is_dir(tmp_dir)) assert(mkdir(tmp_dir, dir_flags) === 0)
const file_name = `${tmp_dir}/wireguard-tools-master.tar.gz`

http_get('https://codeload.github.com/WireGuard/wireguard-tools/tar.gz/master', loop, (err, res) => {
  if (err) throw err
  assert(res.status === 200)
  const fd = open(file_name, write_flags, write_mode)
  assert(fd > 2)
  res.on_bytes = buf => {
    assert(write(fd, buf, buf.length) === buf.length)
  }
  res.on_complete = () => {
    close(fd)
    res.close()
  }
})

while (loop.poll() > 0) lo.runMicroTasks()
