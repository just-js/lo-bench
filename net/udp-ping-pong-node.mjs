import * as dgram from 'node:dgram'
import { to_size_string, mem, cputime } from '../lib/bench.mjs'

const { AD, AG, AY, AM, AC } = colors

const ping = dgram.createSocket('udp4')
const pong = dgram.createSocket('udp4')
const encoder = new TextEncoder()
const size = Math.min(parseInt(args[0] || '1', 10), 65507)
const runs = parseInt(args[1] || '20', 10)

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

let done = 0

const timer = setInterval(() => {
  const [ usr, sys ] = cputime()
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

