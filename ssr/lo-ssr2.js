import { net } from 'lib/net.js'
import { Loop } from 'lib/loop.js'
import { Stats } from '../http/lib/stats.js'
import { Timer } from 'lib/timer.js'
import { RequestParser } from 'lib/pico.js'
import * as html from 'lib/html.js'

const { assert, utf8Length, core, getenv, ptr, uft8_encode_into } = lo
const { fcntl, O_NONBLOCK, F_SETFL, read_file } = core
const { 
  socket, bind, listen, accept, close, setsockopt, recv, send2, send_string
} = net
const {
  SOCK_STREAM, AF_INET, SOMAXCONN, SO_REUSEPORT, SOL_SOCKET, SOCKADDR_LEN
} = net
const { sockaddr_in } = net.types
const { Blocked } = Loop

function update_headers () {
  htmlx = `content-type: text/html;charset=utf-8\r\nDate: ${(new Date()).toUTCString()}\r\n`
}

function on_timer () {
  stats.log()
  update_headers()
}

function status_line (status = 200, message = 'OK') {
  return `HTTP/1.1 ${status} ${message}\r\n`
}

function close_socket (fd) {
  if (!sockets.has(fd)) return
  const socket = sockets.get(fd)
  if (fd > 0) {
    loop.remove(fd)
    if (sockets.has(fd)) sockets.delete(fd)
    close(fd)
    stats.conn--
  }
  socket.fd = 0
}

function on_socket_event (fd) {
  const socket = sockets.get(fd)
  const { parser } = socket
  const bytes = recv(fd, parser.rb, BUFSIZE, 0)
  if (bytes > 0) {
    const parsed = parser.parse(bytes)
    if (parsed > 0) {
      const data_text = data_fn.call(data)
//      send_string(fd, `${status_line()}${htmlx}Content-Length: ${utf8Length(data_text)}\r\n\r\n${data_text}`)
      send2(fd, send_buf.ptr, uft8_encode_into(
        `${status_line()}${htmlx}Content-Length: ${utf8Length(data_text)}\r\n\r\n${data_text}`, 
        send_buf), 0)
      stats.rps++
      return
    }
    if (parsed === -2) return
  }
  if (bytes < 0 && lo.errno === Blocked) return
  close_socket(fd)
}

function create_socket (fd) {
  return {
    parser: new RequestParser(new Uint8Array(BUFSIZE)), fd
  }
}

function on_socket_connect (sfd) {
  // we could use accept4 on linux and set non blocking here but macos does not have it
  const fd = accept(sfd, 0, 0)
  if (fd > 0) {
    assert(fcntl(fd, F_SETFL, O_NONBLOCK) === 0)
    sockets.set(fd, create_socket(fd))
    assert(loop.add(fd, on_socket_event, Loop.Readable, close_socket) === 0)
    stats.conn++
    return
  }
  if (lo.errno === Blocked) return
  close(fd)
}

function on_accept_error(fd, mask) {
  console.log(`accept error on socket ${fd} : ${mask}`)
}

function start_server (addr, port) {
  const fd = socket(AF_INET, SOCK_STREAM, 0)
  assert(fd > 2)
  assert(fcntl(fd, F_SETFL, O_NONBLOCK) === 0)
//  assert(!setsockopt(fd, SOL_SOCKET, SO_REUSEPORT, net.on, 32))
  assert(bind(fd, sockaddr_in(addr, port), SOCKADDR_LEN) === 0)
  assert(listen(fd, SOMAXCONN) === 0)
  assert(loop.add(fd, on_socket_connect, Loop.Readable, on_accept_error) === 0)
  return fd
}

const rows = parseInt(lo.args[2] || '10', 10)
console.log(rows)
const decoder = new TextDecoder()
const encoder = new TextEncoder()
const data = JSON.parse(decoder.decode(read_file('data.json'))).slice(0, rows)
const data_fn = html.compile(encoder.encode(`<!DOCTYPE html><html lang=en><body><table>{{#each this}}<tr><td>{{id}}</td><td>{{name}}</td></tr>{{/each}}</table></body></html>`), 'data', 'data', { rawStrings: false }).call
const send_buf = ptr(new Uint8Array(1 * 1024 * 1024))
const sockets = new Map()
const BUFSIZE = 65536
const loop = new Loop()
let htmlx = 
  `Content-Type: text/html;charset=utf-8\r\nDate: ${(new Date()).toUTCString()}\r\n`
const stats = new Stats()
const timer = new Timer(loop, 1000, on_timer)
const address = getenv('ADDRESS') || '127.0.0.1'
const port = parseInt(getenv('PORT') || 3000, 10)
const fd = start_server(address, port)
while (loop.poll() > 0) lo.runMicroTasks()
timer.close()
close(fd)
