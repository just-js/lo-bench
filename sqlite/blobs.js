import { Database } from 'lib/sqlite.js'
import { Bench } from '../fs/lib/bench.mjs'

const { assert } = lo

const decoder = new TextDecoder()
const db = (new Database()).open('/dev/shm/blobs.db')
//db.exec("PRAGMA auto_vacuum = none");
//db.exec("PRAGMA temp_store = memory");
db.exec("PRAGMA journal_mode = off");
//db.exec("PRAGMA locking_mode = exclusive");
//db.exec("PRAGMA synchronous = full");
//db.exec("PRAGMA mmap_size=268435456");
db.exec('CREATE TABLE IF NOT EXISTS entry (key TEXT PRIMARY KEY, payload BLOB)')
const createAsset = db.prepare('INSERT OR IGNORE INTO entry (key, payload) values (@key, @payload)')

const SIZE = 1024
const src = new Uint8Array(SIZE)
const key = 'hellobuffer'

assert(createAsset.bindText(1, key) === 0, db.error)
assert(createAsset.bindBlob(2, src) === 0, db.error)
assert(createAsset.step() === 101, db.error)

const blob = db.writableBlob('entry', 'payload', 1)
let size = blob.bytes()
assert(size === SIZE)
let u8 = new Uint8Array(size)
blob.read(u8, size)
assert(decoder.decode(u8).length === size)

//const ro_blob = db.readableBlob('entry', 'payload', 1)
//size = ro_blob.bytes()
//assert(size === SIZE)
//u8 = new Uint8Array(size)
//ro_blob.read(u8, size)
//assert(decoder.decode(u8).length === size)

const errorHandler = () => db.error()

function write_blob () {
  assert(createAsset.reset() === 0)
  assert(createAsset.bindBlob(1, src) === 0, errorHandler)
  assert(createAsset.step() === 101, errorHandler)
}

let runs = 30000000
const iter = 5
const bench = new Bench()
/*
for (let i = 0; i < iter; i++) {
  bench.start(`ro_blob.read (${size})`)
  for (let j = 0; j < runs; j++) {
    ro_blob.read(u8, size)
  }
  bench.end(runs)
}
*/
for (let i = 0; i < iter; i++) {
  bench.start(`blob.read (${size})`)
  for (let j = 0; j < runs; j++) {
    blob.read(u8, size)
  }
  bench.end(runs)
}

for (let i = 0; i < iter; i++) {
  bench.start(`blob.write (${size})`)
  for (let j = 0; j < runs; j++) {
    blob.write(u8, size)
  }
  bench.end(runs)
}
/*
runs = 3000000

for (let i = 0; i < iter; i++) {
  bench.start(`write_blob (${size})`)
  for (let j = 0; j < runs; j++) {
    write_blob()
  }
  bench.end(runs)
}
*/
createAsset.finalize()
blob.close()
ro_blob.close()
db.close()
