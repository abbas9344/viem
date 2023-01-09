import type { ByteArray, Hex } from '../../types'

type TrimOptions = {
  dir?: 'left' | 'right'
}

export function trim(
  hexOrBytes: Hex | ByteArray,
  { dir = 'left' }: TrimOptions = {},
) {
  let data =
    typeof hexOrBytes === 'string' ? hexOrBytes.replace('0x', '') : hexOrBytes

  let sliceLength = 0
  for (let i = 0; i < data.length - 1; i++) {
    if (data[dir === 'left' ? i : data.length - i - 1].toString() === '0')
      sliceLength++
    else break
  }
  data =
    dir === 'left'
      ? data.slice(sliceLength)
      : data.slice(0, data.length - sliceLength)

  if (typeof hexOrBytes === 'string') {
    if (data.length === 1 && dir === 'right') data = data + '0'
    return `0x${data}`
  }
  return data
}
