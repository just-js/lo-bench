import { Bench } from '../fs/lib/bench.mjs'
import { Database } from "jsr:@db/sqlite@0.12"

const db = new Database(':memory:', { unsafeConcurrency: true })
db.exec('drop table if exists foo')
db.exec('create table if not exists foo (num int)')
db.exec('insert into foo (num) values (1)')
const stmt = db.prepare('select num from foo limit 1')
if(stmt.get().num !== 1) throw new Error('Unexpected Result')

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
