import { mem } from 'lib/proc.js'

const { assert, core, ptr, latin1Decode } = lo
const { 
  open, close, getdents, strnlen, O_RDONLY, O_DIRECTORY
} = core

const default_options = { withFileTypes: false }

let depth = 0

const records = (new Array(64)).fill(0).map(v => {
  const dir = ptr(new Uint8Array(65536))
  const view = new DataView(dir.buffer)
  return { view, dir, dir_len: dir.length, dir_ptr: dir.ptr }
})

function readdir (path, options = default_options, entries = []) {
  const fd = open(path, O_RDONLY | O_DIRECTORY)
  assert(fd > 2)
  const { view, dir, dir_len, dir_ptr } = records[depth]
  dir.fill(0)
  assert(getdents(fd, dir_ptr, dir_len) > 0)
  let off = 0
  let d_ino = view.getUint32(off, true)
  depth++
  while (d_ino > 0) {
    const d_reclen = view.getUint16(off + 16, true)
    const d_type = dir[off + 18]
    const name = latin1Decode(dir_ptr + off + 19, strnlen(dir_ptr + off + 19, 1024))
    if (!(name === '..' || name === '.')) {
      const entry_path = `${path}/${name}`
      if (d_type === 4) {
        entries.push({ path, name: entry_path, type: d_type })
        readdir(entry_path, options, entries)
      } else if (d_type === 8) {
        entries.push({ path, name, type: d_type })
      }
    }
    off += d_reclen
    d_ino = view.getUint32(off, true)
  }
  depth--
  close(fd)
}

const dir = lo.args[2] || 'openssl-3.0.12'
const entries = []
readdir(dir, { recursive: true, withFileTypes: true }, entries);
assert(entries.length === 4847)
for (const entry of entries) {
  console.log(`path ${entry.path} name ${entry.name} directory ${entry.type === 4} file ${entry.type === 8}`)
}

const iter = 10
const runs = 500

for (let i = 0; i < iter; i++) {
  const start = Date.now()
  for (let j = 0; j < runs; j++) {
    readdir(dir, { recursive: true, withFileTypes: true }, []);
  }
  const elapsed = Date.now() - start
  const rate = runs / (elapsed / 1000)
  const ns = (elapsed / runs) * 1000000
  console.log(`rate ${rate} ns/iter ${ns} rss ${mem()}`)
}
