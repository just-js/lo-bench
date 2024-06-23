import { colors, to_size_string }  from './lib/bench.mjs'

function uniq (value, index, array) {
  return array.indexOf(value) === index
}

function get_max_rate (runtime, name) {
  return sizes.map(size => Math.max(...scores.filter(score => score.runtime === runtime).filter(score => score.size === size).filter(score => score.name === name).map(score => score.rate_core)))
}

function header (name, size = 12) {
  return `${AG}${name.toString().padEnd(size, ' ')}${AD}`
}

function rowheader (name, size = 12) {
  return `${AY}${name.toString().padEnd(size, ' ')}${AD}`
}

function field (val, size = 12) {
  return `${val.toString().padStart(size, ' ')}`
}

function pc_field (val, size = 12) {
  return `${((Math.floor(val * 100) / 100).toString().padStart(size, ' '))}`
}

const { AM, AY, AG, AD, AC } = colors
const decoder = new TextDecoder()
const results = decoder.decode(readFileSync('./results.txt'))
const lines = results.split('\n').filter(l => l)
const rx = /(\w+)\s+([\w\.]+)\s+(\d+)\s+[\w\/]+\s+([\d\.]+)\s+[\w\/]+\s+([\d\.]+)\s+[\w\/]+\s+([\d\.]+)\s+[\w\/]+\s+([\d\.]+)\s+[\w\/]+\s+([\d\.]+)\s+[\w\/]+\s+([\d\.]+)\s+[\w\/]+\s+([\d\.]+)\s+[\w\/]+\s+([\d\.]+)/
const scores = new Array(lines.length)
for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  const match = rx.exec(line)
  if (!match) throw new Error('Bad Input')
  const parts = match.slice(1)
  const [ runtime, name ] = parts
  const [ size, time, rate, rate_core, ns_iter, rss, usr, sys, tot ] = parts.slice(2).map(v => Number(v))
  scores[i] = { runtime: runtime.toLowerCase(), name, size, time, rate, rate_core, ns_iter, rss, usr, sys, tot }
}
const sizes = scores.map(score => score.size).filter(uniq)

function display (name, a, b) {
  console.log('')
  console.log(`${AC}${a} v ${b} (${name})${AD}`)
  console.log('')
  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i]
    console.log(`${header(size)} ${header('ops/sec/core')} ${header('thru/core')} ${header('ratio', 6)}`)
    const a_max = get_max_rate(a, name)[i]
    const b_max = get_max_rate(b, name)[i]
    const max = Math.max(a_max, b_max)
    const a_max_pc = (a_max / max)
    const b_max_pc = (b_max / max)
    console.log(`${rowheader(a)} ${field(a_max)} ${field(to_size_string(a_max * size))} ${pc_field(a_max_pc / b_max_pc, 6)} ${'🟢'.repeat(Math.ceil(a_max_pc * 30))}`)
    console.log(`${rowheader(b)} ${field(b_max)} ${field(to_size_string(b_max * size))} ${pc_field(b_max_pc / a_max_pc, 6)} ${'🟣'.repeat(Math.ceil(b_max_pc * 30))}`)
  }
}

display('Buffer.from', 'node', 'bun')
display('Buffer.from', 'node', 'deno')
display('Buffer.from', 'bun', 'deno')
display('Buffer.write', 'node', 'bun')
display('Buffer.write', 'node', 'deno')
display('Buffer.write', 'node', 'lo')
display('Buffer.write', 'bun', 'deno')
display('Buffer.write', 'bun', 'lo')
display('Buffer.write', 'deno', 'lo')
