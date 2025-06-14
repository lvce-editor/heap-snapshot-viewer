const getIsTest = () => {
  // @ts-ignore
  if (typeof process === 'undefined') {
    return false
  }
  // @ts-ignore
  return process.env.NODE_ENV === 'test'
}

export const isTest = getIsTest()
