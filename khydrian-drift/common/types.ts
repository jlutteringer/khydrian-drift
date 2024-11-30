import { Expression } from '@khydrian-drift/util/expression'

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
