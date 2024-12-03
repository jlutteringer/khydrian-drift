import { Effect } from '@khydrian-drift/common/effect'
import { Arrays, Objects } from '@khydrian-drift/util'

export type ProgressionTable<T> = Record<number, Array<T>>
export type EffectProgressionTable = ProgressionTable<Effect>

export const fromRecord = <T>(sparseRecord: Record<number, Array<T>>, maxLevel: number): ProgressionTable<T> => {
  const entries = Arrays.range(1, maxLevel + 1).map((level) => {
    const existingValue = sparseRecord[level]

    if (Objects.isUndefined(existingValue)) {
      return [level, []]
    } else {
      return [level, existingValue]
    }
  })

  return Object.fromEntries(entries)
}

export const fromMapping = <T>(values: Array<T>, mapper: (value: T) => number, maxLevel: number): ProgressionTable<T> => {
  const result = Arrays.groupBy(values, mapper)
  return fromRecord(result, maxLevel)
}

export const getValuesForLevel = <T>(table: ProgressionTable<T>, level: number): Array<T> => {
  return Arrays.range(1, level + 1)
    .map((index) => table[index] ?? null)
    .filter((it) => it != null)
    .flatMap((it) => it)
}
