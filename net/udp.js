import { exec_env } from 'lib/proc.js'
import { write_flags, write_mode } from 'lib/fs.js'

const { core, assert } = lo
const { dup2, open, STDOUT } = core

function spawn (name, args, env = []) {
  console.log(`${name} ${args.join(' ')}`)
  exec_env(prefix[0], [
    ...prefix.slice(1), name, ...args
  ], env)
}

let prefix = []
if (core.os === 'linux') {
  prefix = 'nice -n 20 taskset --cpu-list 6'.split(' ')
}

const deno_args = ['-A', '--unstable-net']

if (lo.args.includes('--quiet')) {
  const fd = open('./udp.log', write_flags, write_mode)
  assert(fd > 2)
  assert(dup2(fd, STDOUT) === STDOUT)
}

const runs = parseInt(lo.args[2] || '5', 10)
const sizes = [ 1, 8, 64, 256, 1024, 4096, 16384, 60000, 65507 ]
//const sizes = [ 4096, 16384, 60000, 65507 ]
const args = [1, runs]

for (const size of sizes) {
  args[0] = size
  spawn('deno', [...deno_args, 'udp-ping-pong-deno.js', ...args])
  spawn('deno', [...deno_args, 'udp-ping-pong-node.mjs', ...args])
  spawn('node', ['udp-ping-pong-node.mjs', ...args])
  spawn('bun', ['udp-ping-pong-node.mjs', ...args])
  spawn('bun', ['udp-ping-pong-bun.js', ...args])
  spawn('lo', ['udp-ping-pong.js', ...args])
}
