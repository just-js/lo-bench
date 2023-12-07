import { readdirSync } from "fs";
import { readdir } from "fs/promises";
import { argv } from "process";

const dir = argv.length > 2 ? argv[2] : 'openssl-3.0.12';


//const entries = readdirSync(dir, { recursive: true, withFileTypes: true });
//const entries = await readdir(dir, { recursive: true });
const entries = readdirSync(dir, { recursive: true, withFileTypes: true });
console.log(entries.length)
for (const entry of entries) {
//  console.log(entry)
  //console.log(`path ${entry.path} name ${entry.name} directory ${entry.isDirectory()} file ${entry.isFile()}`)
}

const iter = 10
const runs = 500

const opts = { recursive: true, withFileTypes: true }

for (let i = 0; i < iter; i++) {
  const start = Date.now()
  for (let j = 0; j < runs; j++) {
    //await readdir(dir, { recursive: true });
    readdirSync(dir, opts);
    //readdirSync(dir, { recursive: true, withFileTypes: true });
  }
  const elapsed = Date.now() - start
  const rate = runs / (elapsed / 1000)
  const ns = (elapsed / runs) * 1000000
  console.log(`rate ${rate} ns/iter ${ns}`)
}

