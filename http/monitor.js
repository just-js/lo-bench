import { Timer } from 'lib/timer.js'
import { system } from 'lib/system.js'

const { core, ptr, latin1Decode } = lo
const { lseek, SEEK_SET, read, close, open, O_RDONLY } = core
const { SystemError } = system

class Monitor {
  constructor (loop, stats = [], opts = { bufferSize: 16384, interval: 1000 }) {
    this.stats = stats
    this.loop = loop
    this.bufferSize = opts.bufferSize || 16384
    this.buffer = ptr(new Uint8Array(this.bufferSize))
    this.interval = opts.interval || 100
    this.timer = 0
    this.pid = 0
    this.fd = 0
    this.path = ''
  }

  read () {
    const { stats, pid, buffer, fd, bufferSize } = this
    lseek(fd, 0, SEEK_SET)
    // todo: stat the file and create a buffer of correct size
    let bytes = read(fd, buffer, bufferSize)
    const parts = []
    while (bytes > 0) {
      parts.push(latin1Decode(buffer.ptr, bytes))
      bytes = read(fd, buffer, bufferSize)
    }
    const fields = parts.join('').split(' ')
    const comm = fields[1]
    const state = fields[2]
    const [
      ppid,
      pgrp,
      session,
      ttyNr,
      tpgid,
      flags,
      minflt,
      cminflt,
      majflt,
      cmajflt,
      utime,
      stime,
      cutime,
      cstime,
      priority,
      nice,
      numThreads,
      itrealvalue,
      starttime,
      vsize,
      rssPages,
      rsslim,
      startcode,
      endcode,
      startstack,
      kstkesp,
      kstkeip,
      signal,
      blocked,
      sigignore,
      sigcatch,
      wchan,
      nswap,
      cnswap,
      exitSignal,
      processor,
      rtPriority,
      policy,
      delayacctBlkioTicks,
      guestTime,
      cguestTime,
      startData,
      endData,
      startBrk,
      argStart,
      argEnd,
      envStart,
      envEnd,
      exitCode
    ] = fields.slice(3).map(v => Number(v))
    stats.push({
      pid,
      comm,
      state,
      ppid,
      pgrp,
      session,
      ttyNr,
      tpgid,
      flags,
      minflt,
      cminflt,
      majflt,
      cmajflt,
      utime,
      stime,
      cutime,
      cstime,
      priority,
      nice,
      numThreads,
      itrealvalue,
      starttime,
      vsize,
      rssPages,
      rsslim,
      startcode,
      endcode,
      startstack,
      kstkesp,
      kstkeip,
      signal,
      blocked,
      sigignore,
      sigcatch,
      wchan,
      nswap,
      cnswap,
      exitSignal,
      processor,
      rtPriority,
      policy,
      delayacctBlkioTicks,
      guestTime,
      cguestTime,
      startData,
      endData,
      startBrk,
      argStart,
      argEnd,
      envStart,
      envEnd,
      exitCode
    })
  }

  open (pid) {
    const { loop } = this
    this.close()
    this.path = `/proc/${pid}/stat`
    this.fd = open(this.path, O_RDONLY)
    if (this.fd <= 0) throw new SystemError(`could not open ${this.path}`)
    this.timer = new Timer(loop, this.interval, () => this.read())
  }

  close () {
    if (this.fd) {
      close(this.fd)
      this.fd = 0
      this.timer.close()
    }
    this.pid = 0
  }
}

export { Monitor }
