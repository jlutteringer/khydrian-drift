import { Expression } from '@bessemer/cornerstone/expression'

export enum GameTimeUnit {
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
  period?: GameTimeUnit
  amount?: Expression<number>
}
