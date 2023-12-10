const le = (() => {
  const buffer = new ArrayBuffer(2);
  new DataView(buffer).setInt16(0, 256, true);
  return new Int16Array(buffer)[0] === 256;
})();

import { RequestParser } from 'lib/pico.js'
import { net } from 'lib/net.js'

const { socket, bind, listen, accept, recv, send_string, close, EAGAIN } = net

const { mach } = lo.load('mach')
const { system } = lo.load('system')

const { assert, ptr, utf8Length } = lo
const { kqueue, kevent } = mach

const decoder = new TextDecoder()

function wrapStrError () {
  const eb = new Uint8Array(1024)
  const { strerror_r } = system
  system.strerror = (errnum = lo.errno) => {
    const rc = strerror_r(errnum, eb, 1024)
    if (rc !== 0) return
    return decoder.decode(eb)
  }
}

wrapStrError()

function ev_set(ident, filter, flags, fflags, data, udata) {
  const buf = new ArrayBuffer(32)
  const w = new DataView(buf)
  w.setBigUint64(0, BigInt(ident), true)
  w.setInt16(8, filter, true)
  w.setUint16(10, flags, true)
  w.setUint32(12, fflags, true)
  w.setBigUint64(16, BigInt(data), true)
  w.setBigUint64(24, BigInt(udata), true)
  return ptr(new Uint8Array(buf))
}

const kq = kqueue()
assert(kq > 2)

const nevents = 1;
const evbuf = new ArrayBuffer(nevents * 32);
const evu8 = ptr(new Uint8Array(evbuf));
const events = new Uint32Array(evbuf);
const handles = {};

const EVFILT_READ = -1;
const EV_ADD = 0x1;
const EV_ENABLE = 0x4;

function poll() {
  const rc = kevent(kq, 0, 0, evu8.ptr, nevents, 0);
  if (rc > 0) {
    let offset = 0;
    for (let i = 0; i < rc; i++) {
      const fd = events[offset];
      const event = events[offset + 1];
      offset += 6;
      handles[fd] && handles[fd](event);
    }
  } else {
    console.log(system.strerror())
  }
}

function register(fd, callback) {
  assert(kevent(
    kq,
    ev_set(fd, EVFILT_READ, EV_ADD | EV_ENABLE, 0, 0, 0).ptr,
    1,
    0,
    0,
    0,
  ) === 0)
  handles[fd] = callback;
}


const EPOLLERR = 0x8;
const EPOLLHUP = 0x10;

const bufSize = 16 * 1024;
const AF_INET = 2;
const SOCK_STREAM = 1;
const O_NONBLOCK = 2048;

const { sockaddr_in } = net.types

function status_line (status = 200, message = 'OK') {
  return `HTTP/1.1 ${status} ${message}\r\n`
}
let preamble_text = `content-type: text/plain;charset=utf-8\r\nDate: ${(new Date()).toUTCString()}\r\n`


function connect(addr, port) {
  const sfd = socket(AF_INET, SOCK_STREAM, 0);
  assert(sfd > 2)
  assert(bind(sfd, sockaddr_in(addr, port), 16) === 0)
  assert(listen(sfd, 128) === 0)
  register(sfd, (event) => {
    if (event & EPOLLERR || event & EPOLLHUP) {
      close(sfd)
      return
    }
    const newfd = accept(sfd, 0, 0, O_NONBLOCK);
    register(newfd, (event) => {
      if (event & EPOLLERR || event & EPOLLHUP) {
        close(newfd)
        return
      }
      const parser = new RequestParser(new Uint8Array(bufSize))
      handles[newfd] = () => {
        const bytes = recv(newfd, parser.rb, bufSize, 0);
        if (bytes > 0) {
          const parsed = parser.parse(bytes)
          if (parsed > 0) {
            const text = 'Hello, World!'
            const written = send_string(newfd, `${status_line()}${preamble_text}Content-Length: ${utf8Length(text)}\r\n\r\n${text}`)
            return
          }
          if (parsed === -2) return
        }
        if (bytes < 0 && lo.errno === EAGAIN) return
        close(newfd);
      };
    });
  });
}

connect("127.0.0.1", 3000);

while (true) {
  poll();
}
