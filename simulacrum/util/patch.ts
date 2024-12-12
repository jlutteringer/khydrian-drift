import { EvaluateExpression, Expression, Expressions, NumericExpressions, ReducingExpression } from '@simulacrum/util/expression'
import { Objects, Preconditions } from '@simulacrum/util/index'
import { GenericRecord } from '@simulacrum/util/types'

export enum PatchType {
  Set = 'Set',
  Apply = 'Apply',
  Patch = 'Patch',
}

export type SetPatch<T> = {
  _PatchType: PatchType.Set
  value: Expression<T>
}

export type ApplyPatch<T> = {
  _PatchType: PatchType.Apply
  value: Expression<T>
  reducer: ReducingExpression<T, T>
}

export type PatchPatch<T> = {
  _PatchType: PatchType.Patch
  patch: Patchable<T>
}

export type Patch<T> = SetPatch<T> | ApplyPatch<T> | PatchPatch<T>

export type Patchable<T> = {
  [P in keyof T]?: T[P] extends Array<infer U> ? Patch<Patchable<U>[]> : T[P] extends object | undefined ? Patchable<T[P]> | Patch<T[P]> : Patch<T[P]> | T[P]
}

// export const set = <T, N extends Required<Patchable<T>>>(value: Expression<T>): Patch<N> => {
//   return {
//     _PatchType: PatchType.Set,
//     value: value as any,
//   }
// }

export const set = <T>(value: Expression<T>): Patch<T> => {
  return {
    _PatchType: PatchType.Set,
    value: value as any,
  }
}

export const apply = <T>(value: Expression<T>, reducer: ReducingExpression<T, T>): Patch<T> => {
  return {
    _PatchType: PatchType.Apply,
    value,
    reducer,
  }
}

export const patch = <T extends GenericRecord>(patch: Patchable<T>): Patch<T> => {
  return {
    _PatchType: PatchType.Patch,
    patch,
  }
}

export const merge = <T>(value: T): Patch<T> => {
  return apply(value, null!) // JOHN merge function
}

export const sum = (value: Expression<number>): Patch<number> => {
  return apply(value, Expressions.reference(NumericExpressions.SumExpression))
}

export const multiply = (value: Expression<number>): Patch<number> => {
  return apply(value, Expressions.reference(NumericExpressions.MultiplyExpression))
}

export const resolve = <T>(value: T, patches: Array<Patch<T>>, evaluate: EvaluateExpression): T => {
  let currentValue: T = value

  patches.forEach((it) => {
    switch (it._PatchType) {
      case PatchType.Set:
        currentValue = evaluate(it.value)
        return
      case PatchType.Apply:
        currentValue = evaluate(Expressions.dereference(it.reducer, [currentValue, it.value]))
        return
      case PatchType.Patch:
        currentValue = applyPatch(currentValue, it.patch, evaluate)
        return
      default:
        Preconditions.isUnreachable(() => `Unrecognized PatchType for value: ${JSON.stringify(it)}`)
    }
  })

  return currentValue
}

const applyPatch = <T>(value: T, patch: Patchable<T>, evaluate: EvaluateExpression): T => {
  return Objects.mergeWith(value, patch, (value, patch) => {
    if (Objects.isNil(patch)) {
      return value
    }

    if (!Objects.isObject(patch) || !('_PatchType' in patch)) {
      return undefined
    }

    return evaluate(resolve(value, [patch as Patch<T>], evaluate))
  })
}
