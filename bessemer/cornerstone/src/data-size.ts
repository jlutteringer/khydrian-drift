import { TaggedType } from '@bessemer/cornerstone/types'
import Zod, { ZodType } from 'zod'

export type DataSize = TaggedType<number, 'DataSize'>
export const DataSizeSchema: ZodType<DataSize> = Zod.number() as any

export const fromBytes = (value: number): DataSize => {
  return value as DataSize
}

export const toBytes = (byte: DataSize): number => {
  return byte
}

export const fromKilobytes = (value: number): DataSize => {
  return fromBytes(value * 1000)
}

export const toKilobytes = (byte: DataSize): number => {
  return toBytes(byte) / 1000
}

export const fromMegabytes = (value: number): DataSize => {
  return fromKilobytes(value * 1000)
}

export const toMegabytes = (byte: DataSize): number => {
  return toKilobytes(byte) / 1000
}

export const fromGigabytes = (value: number): DataSize => {
  return fromMegabytes(value * 1000)
}

export const toGigabytes = (byte: DataSize): number => {
  return toMegabytes(byte) / 1000
}
