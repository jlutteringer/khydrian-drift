import { Expression } from '@simulacrum/util/expression'

export enum TimeUnit {
  Day = 'Day',
  LongRest = 'LongRest',
  ShortRest = 'ShortRest',
  Encounter = 'Encounter',
  Round = 'Round',
  Turn = 'Turn',
}

export type CooldownRate = {
  period: TimeUnit
  amount: Expression<number>
}

export type CooldownRateMutation = {
  period?: TimeUnit
  amount?: Expression<number>
}
