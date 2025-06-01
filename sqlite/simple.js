import { Database } from 'lib/sqlite.js'
import { Bench } from '../fs/lib/bench.mjs'

const db = new Database().open(':memory:')
db.exec('drop table if exists foo')
db.exec('create table if not exists foo (num int)')
db.exec('insert into foo (num) values (1)')
const stmt = db.prepare('select num from foo limit 1').compile('foo_num', true)

assert(stmt.get().num === 1)

const runs = 10000000
const iter = 10
const bench = new Bench()

for (let i = 0; i < iter; i++) {
  bench.start('select num from foo limit 1')
  for (let j = 0; j < runs; j++) {
    if (stmt.get().num !== 1) throw new Error('Bad Value')
  }
  bench.end(runs)
}

stmt.finalize()
db.close()
