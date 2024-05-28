import { fetch } from 'lib/fetch.js'
import { Loop } from 'lib/loop.js'

const { assert } = lo

globalThis.loop = new Loop()

function fetch_tarball (org = 'just-js', project = 'lo', tag = 'main', format = 'tar.gz') {
  return fetch(`https://codeload.github.com/${org}/${project}/${format}/${tag}`)
}

async function main () {
  const res = await fetch_tarball('WireGuard', 'wireguard-tools', 'master')
  assert(res.status === 200)
  assert(res.minor_version === 1)
  const body = await res.bytes()
  const { content_length, body_bytes } = res
  console.log(body_bytes)
  console.log(JSON.stringify(res.headers, null, '  '))
  assert(content_length === 0 || content_length === body_bytes)
  assert(body.length === body_bytes)
}

main().catch(err => console.error(err.stack))

function poll () {
  lo.runMicroTasks()
  if (loop.poll() <= 0) return
  lo.nextTick(poll)
}

lo.nextTick(poll)
//while (loop.poll() > 0) lo.runMicroTasks()
