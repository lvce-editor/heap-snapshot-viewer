export const dispose = (close: () => void = () => globalThis.close()): void => {
  setTimeout(close, 0)
}
