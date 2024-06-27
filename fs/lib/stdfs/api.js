const api = {
  copy: {
    parameters: ['string', 'string', 'i32'],
    result: 'void',
    casts: [, , '(copy_options)'],
    name: 'copy'
  },
}

const name = 'stdfs'
const constants = {}
const includes = ['filesystem']
const preamble = `using std::filesystem::copy;
using std::filesystem::copy_options;
`

export { name, api, constants, includes, preamble }
