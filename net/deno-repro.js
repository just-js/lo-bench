function assert (condition, message, ErrorType = Error) {
  if (!condition) {
    if (message && message.constructor.name === 'Function') {
      throw new ErrorType(message(condition))
    }
    throw new ErrorType(message || "Assertion failed")
  }
  return condition
}


async function start_pong () {
  let msg = await pong.receive()
  while (msg) {
    assert(msg[0].length === size, () => `${msg[0].length} !== ${size}`)
    console.log(`pong_receive ${msg[0].length}`)
    break
//    msg = await pong.receive()
  }
  pong.close()
}

const encoder = new TextEncoder()

const ping_address = {port: 4000, transport: "udp"}
const pong_address = {port: 4001, transport: "udp"}
const ping = Deno.listenDatagram({port: 4000, transport: 'udp' })
const pong = Deno.listenDatagram({ port: 4001, transport: 'udp' })
const size = Math.min(parseInt(Deno.args[0] || '1', 10), 65507)
start_pong().catch(err => console.error(err.stack))

const buf = encoder.encode('1'.repeat(size))
assert(buf.length === size)
await ping.send(buf, pong.addr)
ping.close()
