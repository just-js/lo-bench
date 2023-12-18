import { Database } from 'bun:sqlite'

const db = Database.open(':memory:')
db.exec('drop table if exists foo')
db.exec('create table if not exists foo (num int)')
db.exec('insert into foo (num) values (1)')
const stmt = db.prepare('select num from foo limit 1')
if(stmt.get().num !== 1) throw new Error('Unexpected Result')

let last = 0

while (1) {
  const start = performance.now()
  for ( let i = 0; i < 5000000; i++) {
    const x = stmt.get()
//    if (x.num !== 1) throw new Error('Bad Value')
  }
  const elapsed = performance.now() - start
  console.log(elapsed)
  if (last > 0 && elapsed < (last / 10)) break
  last = elapsed
}

stmt.finalize()
db.close()
