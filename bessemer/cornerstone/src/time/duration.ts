import { NominalType } from '@bessemer/cornerstone/types'
import Zod from 'zod'

export type Duration = NominalType<number, 'Duration'>

export const fromMilliseconds = (value: number): Duration => {
  return value as Duration
}

export const Schema = Zod.number().transform(fromMilliseconds)

export const toMilliseconds = (duration: Duration): number => {
  return duration
}

export const fromSeconds = (value: number): Duration => {
  return fromMilliseconds(value * 1000)
}

export const toSeconds = (duration: Duration): number => {
  return toMilliseconds(duration) / 1000
}

export const fromMinutes = (value: number): Duration => {
  return fromSeconds(value * 60)
}

export const toMinutes = (duration: Duration): number => {
  return toSeconds(duration) / 60
}

export const fromHours = (value: number): Duration => {
  return fromMinutes(value * 60)
}

export const toHours = (duration: Duration): number => {
  return toMinutes(duration) / 60
}

export const fromDays = (value: number): Duration => {
  return fromHours(value * 24)
}

export const toDays = (duration: Duration): number => {
  return toHours(duration) / 24
}

export const Zero = fromMilliseconds(0)
export const OneDay = fromDays(1)
export const OneHour = fromHours(1)
export const OneMinute = fromMinutes(1)
export const OneSecond = fromSeconds(1)
