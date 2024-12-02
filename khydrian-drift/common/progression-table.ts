import { Effect } from '@khydrian-drift/common/effect'

export type ProgressionTable<T> = Record<number, T>
export type EffectProgressionTable = ProgressionTable<Array<Effect>>
