import { NominalType } from '@bessemer/cornerstone/types'

// JOHN finish this class... consider if we should store in millis?
export type Millisecond = NominalType<number, 'Millisecond'>
export type Second = NominalType<number, 'Second'>
export type Minute = NominalType<number, 'Minute'>
export type Hour = NominalType<number, 'Hour'>
export type Day = NominalType<number, 'Day'>

export type Duration = {
  value: number
}

export const ofMilliseconds = (value: Millisecond) => {
  return {
    value,
  }
}

export const inMilliseconds = (duration: Duration) => {
  return duration.value
}

export const ofSeconds = (value: Second) => {}

export const ofMinutes = (value: Minute) => {}

export const ofHours = (value: Hour) => {}

export const ofDays = (value: Day) => {}
