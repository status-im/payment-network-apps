export const compressedAddress = (a) =>
  `${a.slice(0, 6)}...${a.slice(a.length - 4)}`

const emptyAddress = "0x0000000000000000000000000000000000000000"
export const isEmptyAddress = (a) =>
  a == emptyAddress

