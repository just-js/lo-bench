import { Database } from 'lib/sqlite.js'
import { Bench } from '../fs/lib/bench.mjs'

const db = (new Database()).open('./northwind.sqlite')
db.exec("PRAGMA auto_vacuum = none");
db.exec("PRAGMA temp_store = memory");
db.exec("PRAGMA journal_mode = off");
db.exec("PRAGMA locking_mode = exclusive");
db.exec("PRAGMA synchronous = full");
db.exec("PRAGMA mmap_size=268435456");

const rows = parseInt(args[0] || '10', 10)

const order = db.prepare(`select * from "Order" limit ${rows}`).compile('orders', true)
const product = db.prepare(`select * from "Product" limit ${rows}`).compile('products', true)
const orderDetail = db.prepare(`select * from "OrderDetail" limit ${rows}`).compile('order_details', true)

const bencher = new Bench()
const repeat = 5

//console.log(JSON.stringify(order.all().slice(0, 10)))
//console.log(JSON.stringify(product.all().slice(0, 10)))
//console.log(JSON.stringify(orderDetail.all().slice(0, 10)))

let runs = 2400000 / rows

for (let j = 0; j < repeat; j++) {
  bencher.start(`order.all (${rows})`)
  for (let i = 0; i < runs; i++) assert(order.all().length === rows)
  bencher.end(runs)
}

runs = 7200000 / rows

for (let j = 0; j < repeat; j++) {
  bencher.start(`product.all (${rows})`)
  for (let i = 0; i < runs; i++) product.all()
  bencher.end(runs)
}

runs = 10800000 / rows

for (let j = 0; j < repeat; j++) {
  bencher.start(`orderDetail.all (${rows})`)
  for (let i = 0; i < runs; i++) orderDetail.all()
  bencher.end(runs)
}

order.finalize()
product.finalize()
orderDetail.finalize()
db.close()
