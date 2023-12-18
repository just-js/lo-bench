import { Loop } from 'lib/loop.js'
import { make_args } from 'lib/proc.js'
import { Timer } from 'lib/timer.js'
import { system } from 'lib/system.js'
import { Monitor } from './monitor.js'

const { assert, core, getenv } = lo
const { fork, execvp, waitpid, WNOHANG } = core
const { sysconf, _SC_NPROCESSORS_ONLN, exit } = system

function spawn (name, ...args) {
  const state = make_args([name, ...args])
  const pid = fork()
  const proc_state = new Int32Array(2)
  if (pid === 0) {
    if (execvp(name, state.args) !== 0) return Promise.reject(new Error(`bad status ${lo.errno} for ${pid}`))
  }
  if (pid > 0) {
    const status = waitpid(pid, proc_state, WNOHANG)
    if (status > 0) return Promise.resolve({ pid, status })
    if (status < 0) return Promise.reject(new Error(`bad status ${status} for ${pid}`))
    // return an object with an async waitfor method
    const monitor = new Monitor(loop)
    monitor.open(pid)
    return new Promise ((resolve, reject) => {
      const timer = new Timer(loop, 100, () => {
        const status = waitpid(pid, proc_state, WNOHANG)
        if (status > 0) { 
          timer.close()
          monitor.close()
          return resolve({ pid, status: proc_state[1], stats: monitor.stats })
        }
        if (status < 0) {
          timer.close()
          monitor.close()
          reject(new Error(`bad status ${status} for ${pid}`))
        }
      })
    })
  }
  if (pid < 0) return Promise.reject(new Error(`bad status ${lo.errno} for ${pid}`))
}

const loop = new Loop()
const count = parseInt(getenv('LOCHLD') || sysconf(_SC_NPROCESSORS_ONLN), 10)
const args = lo.args.slice(2)
if (!args.length) throw new Error('nothing to run')

async function main () {
  const instances =  await Promise.all((new Array(count)).fill(0).map(() => spawn(...args)))
  for (const instance of instances) {
    const { pid, status } = instance
    console.log(`${pid} status ${status}`)
  }
  return instances
}

main()
  .then(instances => {
    console.log(JSON.stringify(instances, null, '  '))
  })
  .catch(err => {
    console.error(err.stack)
  })

while (loop.poll() > 0) {
  lo.runMicroTasks()
}

