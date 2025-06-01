import { colors, to_size_string }  from './lib/bench.mjs'

function uniq (value, index, array) {
  return array.indexOf(value) === index
}

function get_max_rate (runtime, name) {
  return sizes.map(size => Math.max(...scores
    .filter(score => score.runtime === runtime)
    .filter(score => score.size === size)
    .filter(score => score.name === name)
    .map(score => score.rate_core)))
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

function field_left (val, size = 12) {
  return `${val.toString().padEnd(size, ' ')}`
}

function pc_field (val, size = 12) {
  return `${((Math.floor(val * 100) / 100).toString().padStart(size, ' '))}`
}

function head2head (name, a, b, name2 = name) {
  console.log('')
  console.log(`${AC}${a} (${name}) v ${b} (${name2})${AD}`)
  console.log('')
  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i]
    console.log(`${header(size)} ${header('ops/sec/core')} ${header('thru/core')} ${header('ratio', 6)}`)
    const a_max = get_max_rate(a, name)[i]
    const b_max = get_max_rate(b, name2)[i]
    const max = Math.max(a_max, b_max)
    const a_max_pc = (a_max / max)
    const b_max_pc = (b_max / max)
    console.log(`${rowheader(a)} ${field(a_max)} ${field(to_size_string(a_max * size))} ${pc_field(a_max_pc / b_max_pc, 6)} ${icon[a].repeat(Math.floor(a_max_pc * 30))}`)
    console.log(`${rowheader(b)} ${field(b_max)} ${field(to_size_string(b_max * size))} ${pc_field(b_max_pc / a_max_pc, 6)} ${icon[b].repeat(Math.floor(b_max_pc * 30))}`)
  }
  console.log('')
}

function get_scores (lines) {
  const scores = new Array(lines.length)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = rx.exec(line)
    if (!match) throw new Error('Bad Input')
    const parts = match.slice(1)
    const [ runtime, name ] = parts
    const [ 
      size, time, rate, rate_core, ns_iter, rss, usr, sys, tot 
    ] = parts.slice(2).map(v => Number(v))
    scores[i] = { 
      runtime: runtime.toLowerCase(), name, size, time, rate, rate_core, ns_iter, 
      rss, usr, sys, tot 
    }
  }
  return scores
}

function get_thru_scores () {
  const thru_scores = {}
  for (const score of scores) {
    const { runtime, name, rate_core, size } = score
    const key = `${runtime} ${name} ${size}`
    const thru = rate_core * size
    if (!thru_scores[key] || thru_scores[key].thru < thru) {
      thru_scores[key] = { runtime, name, size, thru }
    }
  }
  return Object.keys(thru_scores)
    .map(k => thru_scores[k])
    .sort((a, b) => b.thru - a.thru)
}

function throughput (size) {
  console.log('')
  console.log(`${AC}Base64 Decoding Throughput Rankings${AD}`)
  console.log('')
  console.log(`${header('runtime', 8)} ${header('name', 20)} ${header('size', 8)} ${header('thru', 13)} ${header('ratio', 8)}`)
  console.log('')
  let thru = get_thru_scores()
  if (size) thru = thru.filter(v => v.size === size)
  const max_thru = thru[0].thru
  for (const score of thru) {
    const { runtime, name, size, thru } = score
    const pc_max = (thru / max_thru)
    console.log(`${AY}${field_left(runtime, 8)}${AD} ${AM}${field_left(name, 20)}${AD} ${field_left(size, 8)} ${to_size_string(thru)} ${field((Math.ceil(pc_max * 10000) / 100).toFixed(2), 6)} % ${icon[runtime].repeat(Math.ceil(pc_max * 50))}`)
  }
  console.log('')
}

const { AM, AY, AG, AD, AC } = colors
const icon = { lo: '🟠', deno:  '🟣', node: '🟢', bun: '🟡' }
const decoder = new TextDecoder()
const file_name = args[0] || './results-linux2.txt'
const results = decoder.decode(readFileSync(file_name))
const lines = results.split('\n').filter(l => l)
const rx = /(\w+)\s+([\w\.]+)\s+(\d+)\s+[\w\/]+\s+([\d\.]+)\s+[\w\/]+\s+([\d\.]+)\s+[\w\/]+\s+([\d\.]+)\s+[\w\/]+\s+([\d\.]+)\s+[\w\/]+\s+([\d\.]+)\s+[\w\/]+\s+([\d\.]+)\s+[\w\/]+\s+([\d\.]+)\s+[\w\/]+\s+([\d\.]+)/
const scores = get_scores(lines)
const sizes = scores.map(score => score.size).filter(uniq)
head2head('Buffer.from', 'node', 'deno')
head2head('Buffer.write', 'node', 'deno')
head2head('Buffer.write', 'node', 'lo', 'base64_decode')
// bun does not run on raspberry pi 3B+ so we don't report on it for the pi results
if (args[0].slice(-7) !== '-pi.txt') {
  head2head('Buffer.from', 'node', 'bun')
  head2head('Buffer.from', 'bun', 'deno')
  head2head('Buffer.write', 'node', 'bun')
  head2head('Buffer.write', 'bun', 'deno')
  head2head('Buffer.write', 'bun', 'lo', 'base64_decode')
}
head2head('Buffer.write', 'deno', 'lo', 'base64_decode')
head2head('base64_decode', 'lo', 'lo', 'base64_decode_str')

//head2head('Buffer.from', 'node', 'lo', 'buffer_from')
//head2head('Buffer.from', 'deno', 'lo', 'buffer_from')
//head2head('Buffer.from', 'bun', 'lo', 'buffer_from')

throughput(parseInt(args[1] || '0', 10))
