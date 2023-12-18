import { mem, cputime } from 'lib/proc.js'

const { colors } = lo
const { AY, AC, AD } = colors

class Stats {
  rps = 0
  conn = 0

  log () {
    const { rps, conn } = this
    const [ usr, , sys ] = cputime()
    console.log(`${AC}rps${AD} ${rps} ${AC}rss${AD} ${mem()} ${AC}con${AD} ${conn} ${AY}usr${AD} ${usr.toString().padStart(3, ' ')} ${AY}sys${AD}  ${sys.toString().padStart(3, ' ')} ${AY}tot${AD} ${(usr + sys).toString().padStart(3, ' ')}`)
    this.rps = 0
  }

  get runtime () {
    return lo.hrtime() - lo.start
  }
}

export { Stats }
