export const cartesianProduct = <T>(...arrays: Array<Array<T>>): Array<Array<T>> => {
  return arrays.reduce<Array<Array<T>>>((acc, array) => acc.flatMap((product) => array.map((element) => [...product, element])), [[]])
}

export const permute = <T>(values: Array<T>): Array<Array<T>> => {
  let result: Array<Array<T>> = []

  const permuteInternal = (arr: Array<T>, m: Array<T> = []) => {
    if (arr.length === 0) {
      result.push(m)
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice()
        let next = curr.splice(i, 1)
        permuteInternal(curr.slice(), m.concat(next))
      }
    }
  }

  permuteInternal(values)
  return result
}

export const properPowerSet = <T>(values: Array<T>): Array<Array<T>> => {
  const powerSet: Array<Array<T>> = []

  const totalSubsets = 1 << values.length // 2^n, where n is the size of the set

  for (let i = 1; i < totalSubsets; i++) {
    // Start from 1 to exclude the empty set
    const subset: T[] = []
    for (let j = 0; j < values.length; j++) {
      if (i & (1 << j)) {
        // Check if the j-th element is in the subset
        subset.push(values[j])
      }
    }
    powerSet.push(subset)
  }

  return powerSet
}

export const powerSet = <T>(values: Array<T>): Array<Array<T>> => {
  return [[], ...properPowerSet(values)]
}
