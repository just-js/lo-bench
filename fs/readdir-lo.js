import { mem } from 'lib/proc.js'

const { wrap, assert, readMemory, utf8Decode } = lo

const { 
  closedir, open, fstat, close, access, mkdir,
  F_OK, O_RDONLY, S_IFMT, S_IFDIR, S_IFREG
} = lo.core

const handle = new Uint32Array(2)
const opendir = wrap(handle, lo.core.opendir, 1)
const readdir = wrap(handle, lo.core.readdir, 1)
const u8 = new Uint8Array(19)
const dir_view = new DataView(u8.buffer)
const stat = new Uint8Array(160)
const stat32 = new Uint32Array(stat.buffer)

const default_options = { withFileTypes: false }

function readEntry (handle) {
  readMemory(u8, handle, 19)
  const d_ino = dir_view.getUint32(0, true)
  const d_off = dir_view.getUint32(8, true)
  const d_reclen = dir_view.getUint16(16, true)
  const d_type = u8[18]
  const name = utf8Decode(handle + 19, -1)
  return { d_ino, d_off, d_reclen, d_type, name }
}

function isTrue () {
  return true
}

function isFalse () {
  return false
}

function readdirSync (path, options = default_options, entries = []) {
  const dir = opendir(path)
  let next = readdir(dir)
  assert(next)
  while (next) {
    const entry = readEntry(next)
    if (!(entry.name === '..' || entry.name === '.')) {
      const entry_path = `${path}/${entry.name}`
      if (entry.d_type === 4) {
        entries.push({ path, name: entry_path, isDirectory: isTrue, isFile: isFalse })
        readdirSync(entry_path, options, entries)
      } else if (entry.d_type === 8) {
        entries.push({ path, name: entry.name, isDirectory: isFalse, isFile: isTrue })
      }
    }
    next = readdir(dir)
  }
  assert(closedir(dir) === 0)
}

const dir = lo.args[2] || 'openssl-3.0.12'
const entries = []
readdirSync(dir, { recursive: true, withFileTypes: true }, entries);
assert(entries.length === 4847)
for (const entry of entries) {
  //console.log(`path ${entry.path} name ${entry.name} directory ${entry.isDirectory()} file ${entry.isFile()}`)
}

const iter = 10
const runs = 500

for (let i = 0; i < iter; i++) {
  const start = Date.now()
  for (let j = 0; j < runs; j++) {
    readdirSync(dir, { recursive: true, withFileTypes: true }, []);
  }
  const elapsed = Date.now() - start
  const rate = runs / (elapsed / 1000)
  const ns = (elapsed / runs) * 1000000
  console.log(`rate ${rate} ns/iter ${ns} rss ${mem()}`)
}

