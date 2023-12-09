const le = (() => {
  const buffer = new ArrayBuffer(2);
  new DataView(buffer).setInt16(0, 256, true);
  return new Int16Array(buffer)[0] === 256;
})();

import { net } from 'lib/net.js'
const { socket, setsockopt, bind, listen, accept, recv, send, close } = net

const { mach } = lo.load('mach')
const { system } = lo.load('system')

const { assert, ptr } = lo
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
  const buf = new ArrayBuffer(32);
  const w = new DataView(buf);
  w.setBigUint64(0, BigInt(ident), le);
  w.setInt16(8, filter, le);
  w.setUint16(10, flags, le);
  w.setUint32(12, fflags, le);
  w.setBigUint64(16, BigInt(data), le);
  w.setBigUint64(24, BigInt(udata), le);
  return ptr(new Uint8Array(buf));
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

const buf = new ArrayBuffer(bufSize);
const u8 = new Uint8Array(buf);

const { sockaddr_in } = net.types

const res = "HTTP/1.1 200 OK\r\nContent-Length: 13\r\n\r\nHello, World!";
const resUi8 = new Uint8Array(res.split("").map((x) => x.charCodeAt(0)));

function connect(addr, port) {
  const sfd = socket(AF_INET, SOCK_STREAM, 0);
  assert(sfd > 2)
  assert(bind(sfd, sockaddr_in(addr, port), 16) === 0)
  assert(listen(sfd, 128) === 0)
  register(sfd, (event) => {
    if (event & EPOLLERR || event & EPOLLHUP) {
      close(sfd)
    }
    const newfd = accept(sfd, 0, 0, O_NONBLOCK);
    register(newfd, (event) => {
      if (event & EPOLLERR || event & EPOLLHUP) {
        close(newfd)
      }
      handles[newfd] = () => {
        const bytes = recv(newfd, u8, bufSize, 0);
        if (bytes > 0) {
          send(newfd, resUi8, resUi8.length, 0);
          return;
        }
        close(newfd);
      };
    });
  });
}

connect("127.0.0.1", 3000);

while (true) {
  poll();
}
