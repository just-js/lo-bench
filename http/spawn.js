import { Loop } from 'lib/loop.js'
import { make_args } from 'lib/proc.js'
import { Timer } from 'lib/timer.js'
import { system } from 'lib/system.js'
import { Monitor } from './monitor.js'

const { assert, core } = lo
const { fork, execvp, waitpid, WNOHANG, SIGTERM } = core
const { sysconf, _SC_NPROCESSORS_ONLN, exit } = system

class Process {
  pid = -1
  loop = undefined
  stats = []
  status = 0
  state = new Int32Array(2)

  contructor (loop) {
    this.loop = loop
  }

  spawn (program, args, env) {
    const state = make_args([program, ...args])
    const pid = fork()
    if (pid > 0) {
      this.pid = pid
      return pid
    }
    if (pid === 0) {
      if (execvp(program, state.args) !== 0) throw new Error(`bad status ${lo.errno} for ${pid}`)
    }
    throw new Error(`bad status ${lo.errno} for ${pid}`)
  }

  waitfor () {
    const self = this
    const { pid, loop, stats, state } = self
    const status = waitpid(pid, state, WNOHANG)
    self.status = status
    if (status > 0) return Promise.resolve({ pid, status })
    if (status < 0) return Promise.reject(new Error(`bad status ${status} for ${pid}`))
    // return an object with an async waitfor method
    const monitor = new Monitor(loop, stats)
    monitor.open(pid)
    return new Promise ((resolve, reject) => {
      const timer = new Timer(loop, 1000, () => {
        const status = waitpid(pid, state, WNOHANG)
        self.status = status
        if (status > 0) { 
          timer.close()
          monitor.close()
          resolve()
          return
        }
        if (status < 0) {
          timer.close()
          monitor.close()
          reject(new Error(`bad status ${status} for ${pid}`))
        }
      })
    })
  }

  kill () {
    return core.kill(this.pid, SIGTERM)
  }
}

const loop = new Loop()
const count = sysconf(_SC_NPROCESSORS_ONLN)
//const count = 4
const args = lo.args.slice(2)
if (!args.length) throw new Error('nothing to run')

const children = []

async function main () {
  for (let i = 0; i < count; i++) {
    const child = new Process(loop)
    child.spawn(args[0], args.slice(1))
    children.push(child)
  }
  console.log(children.length)
  await Promise.all(children.map(child => child.waitfor()))
  return children
}

let iter = 0

const timer = new Timer(loop, 1000, () => {
  for (const child of children) {
    const { status, pid, stats } = child
    const stat = stats[stats.length - 1]
    console.log(JSON.stringify(stat))
    if (iter === 5) child.kill()
  }
  iter += 1
})

main().catch(err => console.error(err.stack))
while (loop.poll() > 0) {
  lo.runMicroTasks()
}

timer.close()
