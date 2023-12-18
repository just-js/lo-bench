import { Bench } from 'lib/bench.js'

const { sqlite } = lo.load('sqlite')

const {
  step, column_int, reset, finalize, open2, exec, close2, prepare2
} = sqlite

const { assert, utf8Length } = lo

const OK = 0
const ROW = 100
const OPEN_CREATE = 0x00000004
const OPEN_READWRITE = 0x00000002
const OPEN_NOMUTEX = 0x00008000

const u32 = new Uint32Array(2)
assert(open2(':memory:', u32, OPEN_CREATE | OPEN_READWRITE | OPEN_NOMUTEX, 0) === OK)
const db = u32[0] + ((2 ** 32) * u32[1])
assert(exec(db, 'pragma user_version = 100', 0, 0, u32) === OK)
const sql = 'pragma user_version'
assert(prepare2(db, sql, utf8Length(sql), u32, 0) === OK)
const stmt = u32[0] + ((2 ** 32) * u32[1])

function get_version (stmt) {
  if(step(stmt) === ROW) {
    const v = column_int(stmt, 0)
    reset(stmt)
    return v
  }
  finalize(stmt)
  return 0
}

assert(get_version(stmt) === 100)

const runs = 15000000
const iter = 10
const bench = new Bench()

for (let i = 0; i < iter; i++) {
  bench.start('pragma user_version')
  for (let j = 0; j < runs; j++) {
    get_version(stmt)
  }
  bench.end(runs)
}

finalize(stmt)
close2(db)
