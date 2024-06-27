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

copy('/dev/shm/test', '/dev/shm/test2', recursive | skip_existing)

const iter = 5
const bench = new Bench()
const runs = 100

for (let i = 0; i < iter; i++) {
  bench.start('copy')
  for (let j = 0; j < runs; j++) {
    copy('/dev/shm/test', '/dev/shm/test2', recursive | skip_existing)
  }
  bench.end(runs)
}
