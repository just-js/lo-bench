import { exec } from 'lib/proc.js'
import { write_flags, write_mode } from 'lib/fs.js'

const { core, assert, colors } = lo
const { dup2, open, STDOUT } = core
const { AM, AD } = colors

function spawn (...args) {
  exec(prefix[0], [
    ...prefix.slice(1), ...args, iter, runs, total
  ])
}

const prefix = 'nice -n 20 taskset --cpu-list 0'.split(' ')
const iter = parseInt(lo.args[2] || '5', 10)
const runs = parseInt(lo.args[3] || '3000000', 10)
const total = parseInt(lo.args[4] || '3', 10)

const fd = open('./crypto.log', write_flags, write_mode)
assert(fd > 2)
assert(dup2(fd, STDOUT) === STDOUT)

console.log(`${AM}node 20${AD}`)
spawn('/home/andrew/.node/20/bin/node', 'crypto/hash-node.mjs')
console.log(`${AM}node 21${AD}`)
spawn('/home/andrew/.node/21/bin/node', 'crypto/hash-node.mjs')
console.log(`${AM}bun-node${AD}`)
spawn('bun', 'crypto/hash-node.mjs')
console.log(`${AM}deno-node${AD}`)
spawn('deno', 'run', '-A', 'crypto/hash-node.mjs')
console.log(`${AM}bun-native${AD}`)
spawn('bun', 'crypto/hash-bun.js')
console.log(`${AM}deno-native${AD}`)
spawn('deno', 'run', '-A', 'crypto/hash-deno.js')
console.log(`${AM}lo${AD}`)
spawn('lo', 'crypto/hash-lo.js')
