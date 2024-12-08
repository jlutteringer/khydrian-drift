import { Expression } from '@simulacrum/util/expression'

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

export type Cooldown =
  | {
      size: Expression<number>
      refresh: Array<CooldownRate>
    }
  | 'None'

export type CooldownRate = {
  period: TimeUnit
  amount: Expression<number> | RelativeAmount
}

export type CooldownRateMutation = {
  period?: TimeUnit
  amount?: Expression<number>
}
