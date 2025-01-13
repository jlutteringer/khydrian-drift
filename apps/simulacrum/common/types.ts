import { Expression } from '@bessemer/cornerstone/expression'

export enum TimeUnit {
  Day = 'Day',
  LongRest = 'LongRest',
  ShortRest = 'ShortRest',
  Encounter = 'Encounter',
  Round = 'Round',
  Turn = 'Turn',
}

export enum RelativeAmount {
  All = 'All',
  Half = 'Half',
}

export type CooldownRateMutation = {
  period?: TimeUnit
  amount?: Expression<number>
}
