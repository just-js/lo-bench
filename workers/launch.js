import { Process } from 'lib/pmon.js'

const { assert, colors } = lo
const { AM, AY, AD } = colors

function create_process (affinity) {
  const child = new Process(exe_path, args, env)
  child.cwd = cwd
  child.affinity = affinity
  processes.push(child)
  return child
}

const exe_path = '/home/andrew/.lo/bin/lo'
const env = ['LO_HOME=/media/andrew/OCZ/source2023/just-js/lo']
const cwd = './'
const args = ['lo-worker.js']
const processes = []
const affinities = [
  [0, 1], 
//  [2, 3],
//  [4, 5],
  [6, 7]
]
affinities.forEach(affinity => assert(create_process(affinity).run() > 0))

while (1) {
  let running = 0
  for (const process of processes) {
    if (process.poll() === 0) {
      running++
      const { pid, usr, sys, rss, started } = process
      const usage = usr + sys
      console.log(`${AM}pid${AD} ${pid} ${AY}cpu${AD} ${usage} ${AY}rss${AD} ${rss} ${AY}start${AD} ${started}`)
      const { err, out } = process.dump()
      if (out.length) console.log(out)
      if (err.length) console.error(err)
      continue
    }
    const { err, out } = process.dump()
    if (out.length) console.log(out)
    if (err.length) console.error(err)
    process.exit()
  }
  if (running === 0) break
  lo.core.sleep(1)
}

