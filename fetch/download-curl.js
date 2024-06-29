import { fetch } from 'lib/curl.js'
import { dir_flags, is_dir } from 'lib/fs.js'

const { assert, core } = lo
const { mkdir } = core

const tmp_dir = '/dev/shm/tmp'
if (!is_dir(tmp_dir)) assert(mkdir(tmp_dir, dir_flags) === 0)
const file_name = `${tmp_dir}/wireguard-tools-master.tar.gz`

fetch('https://codeload.github.com/WireGuard/wireguard-tools/tar.gz/master', file_name)
