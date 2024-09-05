const getIsTest = () => {
  if (typeof process === 'undefined') {
    return false
  }
  return process.env.NODE_ENV === 'test'
}

export const isTest = getIsTest()
