import { to_size_string, mem } from '../crypto/lib/bench.mjs'

const { AD, AG, AY, AM, AC } = colors

const ping = Deno.listenDatagram({port: 4000, transport: 'udp' })
const pong = Deno.listenDatagram({ port: 4001, transport: 'udp' })

const stats = {
  ping: { send: 0, recv: 0, bytes: { send: 0, recv: 0 } },
  pong: { send: 0, recv: 0, bytes: { send: 0, recv: 0 } },
}

async function start_ping () {
  let msg = await ping.receive()
  while (msg) {
    stats.ping.recv++
    stats.ping.bytes.recv += msg[0].length
    await ping.send(msg[0], msg[1])
    stats.ping.send++
    stats.ping.bytes.send += msg[0].length
    msg = await ping.receive()
  }
}

async function start_pong () {
  let msg = await pong.receive()
  while (msg) {
    stats.pong.recv++
    stats.pong.bytes.recv += msg[0].length
    await pong.send(msg[0], msg[1])
    stats.pong.send++
    stats.pong.bytes.send += msg[0].length
    msg = await pong.receive()
  }
}

const encoder = new TextEncoder()
const size = Math.min(parseInt(Deno.args[0] || '1', 10), 65507)
const runs = parseInt(Deno.args[1] || '5', 10)

start_ping().catch(err => {
  if (err.message !== 'operation canceled') console.error(err.stack)
})
start_pong().catch(err => {
  if (err.message !== 'operation canceled') console.error(err.stack)
})

await ping.send(encoder.encode('1'.repeat(size)), pong.addr)

const last = [0, 0]
const cpuUsage = () => ({ user: 0, system: 0 })
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

