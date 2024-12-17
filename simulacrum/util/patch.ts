import { ArrayExpressions, EvaluateExpression, Expression, Expressions, NumericExpressions, ReducingExpression } from '@simulacrum/util/expression'
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

export type PatchValue<T> = {
  value: T
  patch: Patch<T>
}

export type Patchable<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Patch<U[]> | Patchable<U[]>
    : T[P] extends object | undefined
    ? Patch<T[P]> | Patchable<T[P]>
    : Patch<T[P]> | T[P]
}

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

export const patch = <T extends GenericRecord, N extends Patchable<T> = Patchable<T>>(patch: N): Patch<T> => {
  return {
    _PatchType: PatchType.Patch,
    patch,
  }
}

export const sum = (value: Expression<number>): Patch<number> => {
  return apply(value, Expressions.reference(NumericExpressions.SumExpression))
}

export const multiply = (value: Expression<number>): Patch<number> => {
  return apply(value, Expressions.reference(NumericExpressions.MultiplyExpression))
}

export const concatenate = <T extends Array<Expression<unknown>>>(value: Expression<T>): Patch<T> => {
  return apply(value, Expressions.reference(ArrayExpressions.ConcatenateExpression)) as Patch<T>
}

export type ResolvePatchesResult<T> = {
  value: T
  patchValues: Array<PatchValue<T>>
}

export const resolveWithDetails = <T>(value: T, patches: Array<Patch<T>>, evaluate: EvaluateExpression): ResolvePatchesResult<T> => {
  let currentValue: T = value

  const patchValues = patches.map((patch) => {
    switch (patch._PatchType) {
      case PatchType.Set:
        currentValue = evaluate(patch.value)
        break
      case PatchType.Apply:
        currentValue = evaluate(Expressions.dereference(patch.reducer, [currentValue, patch.value]))
        break
      case PatchType.Patch:
        currentValue = applyPatch(currentValue, patch.patch, evaluate)
        break
      default:
        Preconditions.isUnreachable(() => `Unrecognized PatchType for value: ${JSON.stringify(it)}`)
    }

    return { value: currentValue, patch }
  })

  return { value: currentValue, patchValues }
}

export const resolve = <T>(value: T, patches: Array<Patch<T>>, evaluate: EvaluateExpression): T => {
  return resolveWithDetails(value, patches, evaluate).value
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
