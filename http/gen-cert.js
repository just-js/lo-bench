import { dump } from 'lib/binary.js'
import { generate_cert, create_keypair } from 'lib/libssl.js'

const { pubkey, privkey, key_ptr } = create_keypair()

const { x509 } = generate_cert(key_ptr, {
  country: 'GB',
  province: 'London',
  city: 'London',
  org: 'billywhizz.io',
  hostname: 'home.billywhizz.io'
})

const { write_file } = lo.core
const { AY, AD } = lo.colors
console.log(`${AY}public key${AD}`)
console.log(dump(pubkey))
console.log(`${AY}private key${AD}`)
console.log(dump(privkey))
console.log(`${AY}x509 cert${AD}`)
console.log(dump(x509))

write_file('cert.pem', x509)
write_file('key.pem', privkey)
