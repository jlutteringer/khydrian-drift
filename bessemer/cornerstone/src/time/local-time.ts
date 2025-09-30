// import { TaggedType } from '@bessemer/cornerstone/types'
// import { Result, tryValue } from '@bessemer/cornerstone/result'
// import Zod from 'zod'
// import { Duration } from '@bessemer/cornerstone/time/duration'
// import { LocalTimeInstance } from '@bessemer/cornerstone/time/LocalTimeInstance'
//
// export type LocalTime = TaggedType<string, 'LocalTimeLiteral'>
//
// export const of = (value: string): LocalTime => {
//   return value as LocalTime
// }
//
// export const Schema = Zod.string()
//   .regex(/^\d{2}:\d{2}:\d{2}(?:\.\d{3})?$/)
//   .transform(of)
//
// export const fromString = (value: string): LocalTime => {
//   return Schema.parse(value)
// }
//
// export const parseString = (value: string): Result<LocalTime> => {
//   return tryValue(() => fromString(value))
// }
//
// export const fromInstance = (value: LocalTimeInstance): LocalTime => {
//   return null!
// }
//
// export const asInstance = (value: LocalTime | LocalTimeInstance): LocalTimeInstance => {
//   if (value instanceof LocalTimeInstance) {
//     return value
//   }
// }
//
// export const now = (): LocalTime => {
//   return fromInstance(LocalTimeInstance.now())
// }
//
// export const addDuration = (time: LocalTime | LocalTimeInstance, duration: Duration): LocalTime => {
//   return fromInstance(asInstance(time).addDuration(duration))
// }
//
// export const subtractDuration = (time: LocalTime | LocalTimeInstance, duration: Duration): LocalTime => {
//   return fromInstance(asInstance(time).subtractDuration(duration))
// }
