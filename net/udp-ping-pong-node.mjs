import * as dgram from 'node:dgram'
import * as process from 'node:process'
import { to_size_string, mem } from '../crypto/lib/bench.mjs'

const { AD, AG, AY, AM, AC } = colors

const ping = dgram.createSocket('udp4')
const pong = dgram.createSocket('udp4')
const encoder = new TextEncoder()
const size = Math.min(parseInt(process.argv[2] || '1', 10), 65507)
const runs = parseInt(process.argv[3] || '5', 10)

const last = [0, 0]
const stats = {
  ping: { send: 0, recv: 0, bytes: { send: 0, recv: 0 } },
  pong: { send: 0, recv: 0, bytes: { send: 0, recv: 0 } },
}

ping.on('message', msg => {
  stats.ping.recv++
  stats.ping.bytes.recv += msg.byteLength
  ping.send(msg, 0, msg.length)
  stats.ping.send++
  stats.ping.bytes.send += msg.byteLength
})

ping.on('connect', () => {
  ping.send(encoder.encode('1'.repeat(size)), 0, size)
})

pong.on('message', msg => {
  stats.pong.recv++
  stats.pong.bytes.recv += msg.byteLength
  pong.send(msg, 0, msg.length)
  stats.pong.send++
  stats.pong.bytes.send += msg.byteLength
})

ping.bind(4000)
pong.bind(4001)

ping.connect(4001)
pong.connect(4000)

let cpuUsage
if (process.cpuUsage) {
  cpuUsage = process.cpuUsage
} else {
  cpuUsage = () => ({ user: 0, system: 0 })
}

let done = 0

const timer = setInterval(() => {
  const { user, system } = cpuUsage()
  const usr = Math.floor(((user - last[0]) / 1e6) * 100)
  const sys = Math.floor(((system - last[1]) / 1e6) * 100)
  last[0] = user
  last[1] = system
  const total = stats.ping.recv + stats.ping.send + stats.pong.recv + stats.pong.send
  console.log(`${AM}ping${AD} ${AY}send${AD} ${stats.ping.send} ${AY}recv${AD} ${stats.ping.recv} ${AG}bytes${AD} ${AY}send${AD} ${to_size_string(stats.ping.bytes.send)} ${AY}recv${AD} ${to_size_string(stats.ping.bytes.recv)} ${AM}pong${AD} ${AY}send${AD} ${stats.pong.send} ${AY}recv${AD} ${stats.pong.recv} ${AG}bytes${AD} ${AY}send${AD} ${to_size_string(stats.pong.bytes.send)} ${AY}recv${AD} ${to_size_string(stats.pong.bytes.recv)} ${AC}total${AD} ${total} ${AG}rss${AD} ${mem()} ${AC}cpu${AD} ${AY}usr${AD} ${usr.toString().padStart(3, ' ')} ${AY}sys${AD}  ${sys.toString().padStart(3, ' ')} ${AY}tot${AD} ${(usr + sys).toString().padStart(3, ' ')}`)
  stats.ping.send = stats.ping.recv = stats.pong.send = stats.pong.recv = 0
  stats.ping.bytes.send = stats.ping.bytes.recv = stats.pong.bytes.send = stats.pong.bytes.recv = 0
  done++
  if (done === runs) {
    clearInterval(timer)
    ping.close()
    pong.close()
  }
}, 1000)

