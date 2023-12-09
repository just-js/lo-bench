import { dump } from 'lib/binary.js'
import { api } from 'lib/libssl/api.js'

const { libssl } = lo.load('libssl')

const { wrap, assert, ptr, addr, core, cstr } = lo
const { writeFile } = core

const handle = new Uint32Array(2)

for (const name of Object.keys(api)) {
  const def = api[name]
  if (def.result === 'pointer' || def.result === 'u64') {
    libssl[name] = wrap(handle, libssl[name], def.parameters.length)
  }
}

const {
  EVP_PKEY_CTX_new_id, EVP_PKEY_keygen_init, EVP_PKEY_keygen, EVP_PKEY_CTX_free, 
  EVP_sha512, BIO_s_mem, BIO_new, BIO_ctrl, BIO_read, PEM_write_bio_PrivateKey, 
  PEM_write_bio_PUBKEY, RSA_pkey_ctx_ctrl, EVP_PKEY_RSA, EVP_PKEY_OP_KEYGEN,
  EVP_PKEY_CTRL_RSA_KEYGEN_BITS, BIO_CTRL_PENDING, X509_new, ASN1_INTEGER_set,
  X509_get_serialNumber, X509_getm_notBefore, X509_getm_notAfter,
  X509_gmtime_adj, X509_set_pubkey, X509_sign, PEM_write_bio_X509,
  X509_get_subject_name, X509_NAME_add_entry_by_txt, X509_set_issuer_name
} = libssl

function create_keypair (bits = 2048) {
  const key_ctx = assert(EVP_PKEY_CTX_new_id(EVP_PKEY_RSA, 0))
  assert(EVP_PKEY_keygen_init(key_ctx) === 1)
  assert(RSA_pkey_ctx_ctrl(key_ctx, EVP_PKEY_OP_KEYGEN, 
    EVP_PKEY_CTRL_RSA_KEYGEN_BITS, bits, 0) > 0)
  const key = ptr(new Uint32Array(2))
  // generate key
  assert(EVP_PKEY_keygen(key_ctx, key.ptr) === 1)
  // create a place to dump the IO, in this case in memory
  EVP_PKEY_CTX_free(key_ctx)
  const biopriv = assert(BIO_new(BIO_s_mem()))
  // dump key to IO
  assert(PEM_write_bio_PrivateKey(biopriv, addr(key), 0, 0, 0, 0, 0) === 1)
  // get buffer length
  let size = BIO_ctrl(biopriv, BIO_CTRL_PENDING, 0, 0)
  assert(size > 0)
  // create char reference of private key length
  const privkey = ptr(new Uint8Array(size))
  // read the key from the buffer and put it in the char reference
  assert(BIO_read(biopriv, privkey.ptr, size) > 0)
  // extract public key as string
  // create a place to dump the IO, in this case in memory
  const biopub = assert(BIO_new(BIO_s_mem()))
  // dump key to IO
  assert(PEM_write_bio_PUBKEY(biopub, addr(key)) === 1)
  // get buffer length
  size = BIO_ctrl(biopub, BIO_CTRL_PENDING, 0, 0)
  assert(size > 0)
  // create char reference of public key length
  const pubkey = ptr(new Uint8Array(size))
  // read the key from the buffer and put it in the char reference
  assert(BIO_read(biopub, pubkey.ptr, size) > 0)
  // at this point we can save the public somewhere
  return { pubkey, privkey, key_ptr: addr(key) }
}

function generate_cert (key_ptr, opts) {
  const cert = assert(X509_new())
  assert(ASN1_INTEGER_set(assert(X509_get_serialNumber(cert)), 1) === 1)
  X509_gmtime_adj(assert(X509_getm_notBefore(cert)), 0);
  X509_gmtime_adj(assert(X509_getm_notAfter(cert)), 31536000);
  assert(X509_set_pubkey(cert, key_ptr) === 1)

  const {
    country, province, city, org, hostname
  } = opts

  const name = assert(X509_get_subject_name(cert))
  assert(X509_NAME_add_entry_by_txt(name, C.ptr, MBSTRING_ASC, 
    cstr(country).ptr, -1, -1, 0) === 1)
  assert(X509_NAME_add_entry_by_txt(name, ST.ptr, MBSTRING_ASC, 
    cstr(province).ptr, -1, -1, 0) === 1)
  assert(X509_NAME_add_entry_by_txt(name, L.ptr, MBSTRING_ASC, 
    cstr(city).ptr, -1, -1, 0) === 1)
  assert(X509_NAME_add_entry_by_txt(name, O.ptr, MBSTRING_ASC, 
    cstr(org).ptr, -1, -1, 0) === 1)
  assert(X509_NAME_add_entry_by_txt(name, CN.ptr, MBSTRING_ASC, 
    cstr(hostname).ptr, -1, -1, 0) === 1)

  assert(X509_set_issuer_name(cert, name) === 1)
  assert(X509_sign(cert, key_ptr, assert(EVP_sha512())) > 0)
  const x509pub = assert(BIO_new(BIO_s_mem()))
  assert(PEM_write_bio_X509(x509pub, cert) === 1)
  const size = BIO_ctrl(x509pub, BIO_CTRL_PENDING, 0, 0)
  assert(size > 0)
  // create char reference of public key length
  const x509 = ptr(new Uint8Array(size))
  // read the key from the buffer and put it in the char reference
  assert(BIO_read(x509pub, x509.ptr, size) > 0)
  return { x509 }
}

const C = cstr('C')
const ST = cstr('ST')
const L = cstr('L')
const O = cstr('O')
const CN = cstr('CN')
const MBSTRING_ASC = 0x1001

const { pubkey, privkey, key_ptr } = create_keypair()
const { x509 } = generate_cert(key_ptr, {
  country: 'GB',
  province: 'London',
  city: 'London',
  org: 'billywhizz.io',
  hostname: 'home.billywhizz.io'
})

//console.log(dump(pubkey))
//console.log(dump(privkey))
//console.log(dump(x509))

writeFile('cert.pem', x509)
writeFile('key.pem', privkey)
