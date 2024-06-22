const api = {
  base64_decode: {
    parameters: ['pointer', 'u32', 'string', 'u32'],
    override: [, , , { param: 2, fastfield: '->length', slowfield: '.length()' }],
    pointers: ['char*', , 'const char*'],
    result: 'u32'
  },
}

const preamble = `
size_t base64_decode(char* dst, const size_t dstlen,
                     const char* src, const size_t srclen) {
  size_t written_len = dstlen;
  auto result = simdutf::base64_to_binary_safe(
    src,
    srclen,
    dst,
    written_len,
    simdutf::base64_url);
  if (result.error == simdutf::error_code::SUCCESS) {
    return written_len;
  } else {
    return -1;
  }
}
`
const name = 'simdtext'
const includes = ['simdutf.h']
const include_paths = ['deps/simdutf/include']
const obj = ['deps/simdutf/build/src/libsimdutf.a']

const constants = {}

export { name, api, constants, preamble, include_paths, includes, obj }
