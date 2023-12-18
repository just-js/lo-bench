import { exec_env } from 'lib/proc.js'
import { isFile, write_flags, write_mode } from 'lib/fs.js'

const { core, assert, colors, getenv } = lo
const { dup2, open, STDOUT } = core
const { AM, AD } = colors

function spawn (name, args, env = []) {
  exec_env(prefix[0], [
    ...prefix.slice(1), name, ...args
  ], env)
}

let prefix = []
if (core.os === 'linux') {
  prefix = 'nice -n 20 taskset --cpu-list 0'.split(' ')
}

const LO_HOME = getenv('LO_HOME')

if (core.os === 'linux') {
  const CC = getenv('CC') || 'gcc'
//  if (!isFile('./hash-c')) spawn(CC, ['-O3', '-mtune=native', '-march=native', '-msse4', '-mavx2', '-o', 'hash-c', 'hash-c.c', '-lcrypto'])
  if (!isFile('./hash-c')) spawn(CC, ['-O3', '-mtune=native', '-march=native', '-msse4', '-mavx2', '-o', 'hash-c', 'hash-c.c', `${LO_HOME}/lib/libssl/deps/openssl/libcrypto.a`])
  if (!isFile('./hash-c-boring')) spawn(CC, ['-O3', '-mtune=native', '-march=native', '-msse4', '-mavx2', '-o', 'hash-c-boring', 'hash-c.c', `${LO_HOME}/lib/boringssl/deps/boringssl/build/crypto/libcrypto.a`])
} else if (core.os === 'mac') {
  const CC = getenv('CC') || 'clang'
  if (!isFile('./hash-c')) spawn(CC, ['-I/opt/homebrew/opt/openssl@3/include', 'L/opt/homebrew/opt/openssl@3/lib', '-O3', '-mtune=native', '-march=native', '-msse4', '-mavx2', '-o', 'hash-c', 'hash-c.c', '-lcrypto'])
}

const iter = parseInt(lo.args[2] || '1', 10)
const runs = parseInt(lo.args[3] || '1000000', 10)
const total = parseInt(lo.args[4] || '1', 10)
const args = [ iter, runs, total ]

const fd = open('./crypto.log', write_flags, write_mode)
assert(fd > 2)
assert(dup2(fd, STDOUT) === STDOUT)

console.log(`${AM}deno-native${AD}`)
spawn('deno', ['run', '-A', 'hash-deno.js', ...args])

console.log(`${AM}C (openssl)${AD}`)
spawn('./hash-c', [...args])

console.log(`${AM}C (boringssl)${AD}`)
spawn('./hash-c-boring', [...args])

console.log(`${AM}lo (openssl)${AD}`)
spawn('lo', ['hash-lo.js', ...args])

//console.log(`${AM}lo (openssl)${AD}`)
//spawn('lo', ['hash-lo.js', ...args], [['LOSSL', 'openssl']])

console.log(`${AM}lo-lo (openssl)${AD}`)
spawn('lo', ['hash-lo-lo.js', ...args])

//console.log(`${AM}lo-lo (openssl)${AD}`)
//spawn('lo', ['hash-lo-lo.js', ...args], [['LOSSL', 'openssl']])

console.log(`${AM}node 20${AD}`)
spawn('node', ['hash-node.mjs', ...args])

console.log(`${AM}bun-node${AD}`)
spawn('bun', ['hash-node.mjs', ...args])

console.log(`${AM}deno-node${AD}`)
spawn('deno', ['run', '-A', 'hash-node.mjs', ...args])

console.log(`${AM}bun-native${AD}`)
spawn('bun', ['hash-bun.js', ...args])

console.error('all done')
