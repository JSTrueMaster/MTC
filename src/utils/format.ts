import { isEmptyNumber } from './number'
import { multiply10NthPower } from './math'

export const formEmptyNumber = (value: number) => (isEmptyNumber(value) ? null : value)

export const formatNumber = (value: number) => {
  if (isNaN(value)) {
    return ''
  }

  if (isEmptyNumber(value)) {
    return ''
  }

  return new Intl.NumberFormat().format(value)
}
export const yen = (value: number) => `${formatNumber(value)}円`

export const percentile = (value: number) =>
  String(isEmptyNumber(value) ? 0 : Math.round(multiply10NthPower(value, 2))) +
  '%'

export const presentNumber = (value: number) =>
  String(value > 0 ? '+' + value : '' + value)

export const leftPad = (value: any, pad: any, length: number) => {
  const cleanValue = String(value ?? '')

  const text = [...new Array(length)]
    .map(() => pad)
    .concat(cleanValue)
    .join('')

  return text.substring(text.length - length)
}
