import { Bench } from './lib/bench.mjs'

const { stdfs } = lo.load('stdfs')

const { copy } = stdfs

// https://en.cppreference.com/w/cpp/filesystem/copy_options
// https://github.com/nodejs/node/pull/53541/files
/*
enum class copy_options {
    none
    skip_existing
    overwrite_existing
    update_existing
    recursive
    copy_symlinks
    skip_symlinks
    directories_only
    create_symlinks
    create_hard_links
};
*/

const skip_existing = 1
const overwrite_existing = 2
const update_existing = 4
const recursive = 8
const copy_symlinks = 16
const skip_symlinks = 32
const directories_only = 64
const create_symlinks = 128
const create_hard_links = 256

const dest_dir = args[0] || '/dev/shm'
const opts = recursive | overwrite_existing | copy_symlinks
copy(`${dest_dir}/test`, `${dest_dir}/test2`, opts)

const iter = 5
const bench = new Bench()
const runs = 14000

for (let i = 0; i < iter; i++) {
  bench.start('copy')
  for (let j = 0; j < runs; j++) {
    copy(`${dest_dir}/test`, `${dest_dir}/test2`, opts)
  }
  bench.end(runs)
}
