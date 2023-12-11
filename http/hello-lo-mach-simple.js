import { RequestParser } from 'lib/pico.js'
import { net } from 'lib/net.js'

const { machkq } = lo.load('machkq')

const { assert, ptr, utf8Length, core } = lo
const { fcntl, O_NONBLOCK, F_SETFL } = core
const { 
  socket, bind, listen, accept, recv, send_string, close, 
  EAGAIN, SOCK_STREAM, AF_INET, SOMAXCONN
} = net
const { sockaddr_in } = net.types
const { 
  kqueue, kevent, 
  EVFILT_READ, EV_ADD, EV_ENABLE, EV_ERROR
} = machkq


function ev_set (ident, filter, flags) {
  const event = ptr(new Uint32Array(8))
  const view = new DataView(event.buffer)
  view.setUint32(0, ident, true)
  view.setInt16(8, filter, true)
  view.setUint16(10, flags, true)
  return event
}

function poll () {
  const n = kevent(kq, 0, 0, events.ptr, nevents, 0);
  let off = 0
  for (let i = 0; i < n; i++) {
    if ((events[off + 2] && 0xff) === EV_ERROR) {
      close(events[off])
      off += 8
      continue
    }
    handles.get(events[off])()
    off += 8
  }
}

function register (fd, callback) {
  set[0] = fd
  assert(kevent( kq, set.ptr, 1, 0, 0, 0) === 0)
  handles.set(fd, callback)
}

function status_line (status = 200, message = 'OK') {
  return `HTTP/1.1 ${status} ${message}\r\n`
}

function start (addr, port) {
  const sfd = socket(AF_INET, SOCK_STREAM, 0)
  assert(sfd > 2)
  assert(fcntl(sfd, F_SETFL, O_NONBLOCK) === 0)
  assert(bind(sfd, sockaddr_in(addr, port), 16) === 0)
  assert(listen(sfd, SOMAXCONN) === 0)
  register(sfd, () => {
    const fd = accept(sfd, 0, 0)
    if (fd <= 0) return
    assert(fcntl(fd, F_SETFL, O_NONBLOCK) === 0)
    const parser = new RequestParser(new Uint8Array(bufSize))
    const { rb } = parser
    register(fd, () => {
      const bytes = recv(fd, rb, bufSize, 0)
      if (bytes > 0) {
        const parsed = parser.parse(bytes)
        if (parsed > 0) {
          const text = 'Hello, World!'
          send_string(fd, `${status_line()}${plaintext}Content-Length: ${utf8Length(text)}\r\n\r\n${text}`)
          return
        }
        if (parsed === -2) return
      }
      if (bytes < 0 && lo.errno === EAGAIN) return
      close(fd)
    })
  })
}

const kq = assert(kqueue())
const set = ev_set(0, EVFILT_READ, EV_ADD | EV_ENABLE)
const nevents = 4096
const EVENT_SIZE = 8
const events = ptr(new Uint32Array(EVENT_SIZE * nevents))
const handles = new Map()
const bufSize = 4 * 1024
let plaintext = `content-type: text/plain;charset=utf-8\r\nDate: ${(new Date()).toUTCString()}\r\n`
start('127.0.0.1', 3000)
while (true) poll()
