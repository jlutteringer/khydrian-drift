// import {
//   Duration,
//   fromHours,
//   fromMilliseconds,
//   fromMinutes,
//   fromSeconds,
//   OneDay,
//   OneHour,
//   OneMinute,
//   OneSecond,
// } from '@bessemer/cornerstone/time/duration'
// import { now as dateNow } from '@bessemer/cornerstone/time/date'
//
// export class LocalTimeInstance {
//   readonly duration: Duration
//
//   constructor(readonly hour: number, readonly minute: number, readonly second: number, readonly millisecond: number) {
//     this.duration = ofDuration(fromHours(this.hour) + fromMinutes(this.minute) + fromSeconds(this.second) + fromMilliseconds(this.millisecond))
//   }
//
//   static now = (): LocalTimeInstance => {
//     const now = dateNow()
//     return new LocalTimeInstance(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
//   }
//
//   static fromDuration = (duration: Duration): LocalTimeInstance => {
//     const wrappedMillis = ((duration % OneDay) + OneDay) % OneDay
//
//     const newHour = Math.floor(wrappedMillis / OneHour)
//     const newMinute = Math.floor((wrappedMillis % OneHour) / OneMinute)
//     const newSecond = Math.floor((wrappedMillis % OneMinute) / OneSecond)
//     const newMillisecond = wrappedMillis % OneSecond
//
//     return new LocalTimeInstance(newHour, newMinute, newSecond, newMillisecond)
//   }
//
//   with = (builder: { hour?: number; minute?: number; second?: number; millisecond?: number }): LocalTimeInstance => {
//     return new LocalTimeInstance(
//       builder.hour ?? this.hour,
//       builder.minute ?? this.minute,
//       builder.second ?? this.second,
//       builder.millisecond ?? this.millisecond
//     )
//   }
//
//   asDuration = (): Duration => {
//     return ofDuration(fromHours(this.hour) + fromMinutes(this.minute) + fromSeconds(this.second) + fromMilliseconds(this.millisecond))
//   }
//
//   equals = (other: LocalTimeInstance): boolean => {
//     return this.asDuration() === other.asDuration()
//   }
//
//   compareTo = (other: LocalTimeInstance): number => {
//     return this.asDuration() - other.asDuration()
//   }
//
//   addDuration = (duration: Duration): LocalTimeInstance => {
//     return LocalTimeInstance.fromDuration(ofDuration(this.asDuration() + duration))
//   }
//
//   subtractDuration = (duration: Duration): LocalTimeInstance => {
//     return LocalTimeInstance.fromDuration(ofDuration(this.asDuration() - duration))
//   }
//
//   timeBetween = (other: LocalTimeInstance): Duration => {
//     return LocalTimeInstance.fromDuration(ofDuration(this.asDuration() - duration))
//   }
//
//   isBefore = (other: LocalTimeInstance): number => {
//     return LocalTimeInstance.fromDuration(ofDuration(this.asDuration() - duration))
//   }
//
//   isAfter = (other: LocalTimeInstance): number => {
//     return LocalTimeInstance.fromDuration(ofDuration(this.asDuration() - duration))
//   }
// }
