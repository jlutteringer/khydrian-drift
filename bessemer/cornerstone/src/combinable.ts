import { Arrays, Sets } from '@bessemer/cornerstone'

export interface Combinable {
  combinability: Combinability
}

export type Combinability = {
  type: CombinabilityType
  class: CombinabilityClass
}

export enum CombinabilityType {
  Stackable = 'Stackable',
  Singleton = 'Singleton',
  Totalitarian = 'Totalitarian',
}

export type CombinabilityClass = string | null

export const DefaultCombinability: Combinability = {
  type: CombinabilityType.Stackable,
  class: null,
}

export const combinations = <T extends Combinable>(combinables: Array<T>): Array<Array<T>> => {
  const classMap = Arrays.groupBy(combinables, (it) => it.combinability.class)

  const classCombinations: Array<Array<Array<T>>> = Object.entries(classMap).map(([_, values]) => {
    const totalitarianCombinations = values.filter((it) => it.combinability.type === CombinabilityType.Totalitarian).map((it) => [it])
    if (!Arrays.isEmpty(totalitarianCombinations)) {
      return totalitarianCombinations
    }

    const singletonCombinations = values.filter((it) => it.combinability.type === CombinabilityType.Singleton).map((it) => [it])
    const stackableCombination = values.filter((it) => it.combinability.type === CombinabilityType.Stackable)
    return [stackableCombination, ...singletonCombinations]
  })

  return Sets.cartesianProduct(...classCombinations).flatMap((it) => it)
}
