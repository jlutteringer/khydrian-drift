import { NominalType } from '@bessemer/cornerstone/types'

export type Millisecond = NominalType<number, 'Millisecond'>
export type Second = NominalType<number, 'Second'>
export type Minute = NominalType<number, 'Minute'>
export type Hour = NominalType<number, 'Hour'>
export type Day = NominalType<number, 'Day'>

export type Duration = {
  value: Millisecond
}

export const ofMilliseconds = (value: Millisecond) => {
  return {
    value,
  }
}

export const inMilliseconds = (duration: Duration) => {
  return duration.value
}

export const ofSeconds = (value: Second) => {
  return ofMilliseconds(value * 1000)
}

export const inSeconds = (duration: Duration) => {
  return inMilliseconds(duration) / 1000
}

export const ofMinutes = (value: Minute) => {
  return ofSeconds(value * 60)
}

export const inMinutes = (duration: Duration) => {
  return inSeconds(duration) / 60
}

export const ofHours = (value: Hour) => {
  return ofMinutes(value * 60)
}

export const inHours = (duration: Duration) => {
  return inMinutes(duration) / 60
}

export const ofDays = (value: Day) => {
  return ofHours(value * 24)
}

export const inDays = (duration: Duration) => {
  return inHours(duration) / 24
}

export const Zero = ofMilliseconds(0)
export const OneDay = ofDays(1)
export const OneHour = ofHours(1)
