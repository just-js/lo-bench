import { Node } from 'lib/udp.js'
import { Loop } from 'lib/loop.js'
import { Timer } from 'lib/timer.js'
import { to_size_string, mem, cputime } from '../lib/bench.mjs'

// https://gist.github.com/hostilefork/f7cae3dc33e7416f2dd25a402857b6c6
/*
for multicast

    struct ip_mreq mreq;
    mreq.imr_multiaddr.s_addr = inet_addr(group);
    mreq.imr_interface.s_addr = htonl(INADDR_ANY);
    if (
        setsockopt(
            fd, IPPROTO_IP, IP_ADD_MEMBERSHIP, (char*) &mreq, sizeof(mreq)
        ) < 0
    ){
        perror("setsockopt");
        return 1;
    }



*/

function on_error (mask) {
  console.log('on_error')
}

const loop = new Loop()
const ping = new Node(loop)
const pong = new Node(loop)
const recv_buf = new Uint8Array(Node.MAX_UDP_SIZE)
const stats = {
  ping: { send: 0, recv: 0, bytes: { send: 0, recv: 0 } },
  pong: { send: 0, recv: 0, bytes: { send: 0, recv: 0 } },
}
const { AD, AG, AY, AM, AC } = colors

ping.bind('127.0.0.1', () => {
  const bytes = ping.recv(recv_buf)
  stats.ping.bytes.recv += bytes
  stats.ping.recv++
  const written = ping.send(recv_buf, bytes)
  stats.ping.send++
  stats.ping.bytes.send += written
}, 4000, on_error)

pong.bind('127.0.0.1', () => {
  const bytes = pong.recv(recv_buf)
  stats.pong.bytes.recv += bytes
  stats.pong.recv++
  const written = pong.send(recv_buf, bytes)
  stats.pong.send++
  stats.pong.bytes.send += written
}, 4001, on_error)

//ping.peer(pong.address, pong.port)
//pong.peer(ping.address, ping.port)
assert(pong.connect(ping.address, ping.port) === 0)
assert(ping.connect(pong.address, pong.port) === 0)

const encoder = new TextEncoder()

let done = 0

const timer = new Timer(loop, 1000, () => {
  const [ usr, sys ] = cputime()
  const total = stats.ping.recv + stats.ping.send + stats.pong.recv + stats.pong.send
  console.log(`${AM}ping${AD} ${AY}send${AD} ${stats.ping.send} ${AY}recv${AD} ${stats.ping.recv} ${AG}bytes${AD} ${AY}send${AD} ${to_size_string(stats.ping.bytes.send)} ${AY}recv${AD} ${to_size_string(stats.ping.bytes.recv)} ${AM}pong${AD} ${AY}send${AD} ${stats.pong.send} ${AY}recv${AD} ${stats.pong.recv} ${AG}bytes${AD} ${AY}send${AD} ${to_size_string(stats.pong.bytes.send)} ${AY}recv${AD} ${to_size_string(stats.pong.bytes.recv)} ${AC}total${AD} ${total} ${AG}rss${AD} ${mem()} ${AC}cpu${AD} ${AY}usr${AD} ${usr.toString().padStart(3, ' ')} ${AY}sys${AD}  ${sys.toString().padStart(3, ' ')} ${AY}tot${AD} ${(usr + sys).toString().padStart(3, ' ')}`)
  stats.ping.send = stats.ping.recv = stats.pong.send = stats.pong.recv = 0
  stats.ping.bytes.send = stats.ping.bytes.recv = stats.pong.bytes.send = stats.pong.bytes.recv = 0
  done++
})

const size = Math.min(parseInt(lo.args[2] || '1', 10), Node.MAX_UDP_SIZE)
const runs = parseInt(lo.args[3] || '20', 10)
ping.send(encoder.encode('1'.repeat(size)))
stats.ping.send++

while (loop.poll() > 0 && done < runs) {}

loop.close()
ping.close()
pong.close()
timer.close()
