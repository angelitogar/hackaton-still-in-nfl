import type { ConfidenceInterval } from '../types/api'

const numberFormat = (digits: number): Intl.NumberFormat =>
  new Intl.NumberFormat('es-MX', { minimumFractionDigits: digits, maximumFractionDigits: digits })

const ONE_DECIMAL = numberFormat(1)
const TWO_DECIMALS = numberFormat(2)
const INTEGER = numberFormat(0)

export const formatInteger = (value: number): string => INTEGER.format(value)
export const formatNumber = (value: number): string => ONE_DECIMAL.format(value)
export const formatPrecise = (value: number): string => TWO_DECIMALS.format(value)

export function formatSigned(value: number): string {
  const text = ONE_DECIMAL.format(value)
  return value > 0 ? `+${text}` : text
}

/** Convierte una proporción 0..1 en texto de porcentaje (solo presentación). */
export const formatShare = (share: number): string => `${ONE_DECIMAL.format(share * 100)} %`

export const formatPercentile = (percentile: number): string => `P${INTEGER.format(percentile)}`

export const formatYards = (value: number): string => `${ONE_DECIMAL.format(value)} yd`

export const formatInterval = (ci: ConfidenceInterval): string =>
  `${ONE_DECIMAL.format(ci.low)} a ${ONE_DECIMAL.format(ci.high)}`
