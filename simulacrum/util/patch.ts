import { ExpressionReference } from '@simulacrum/util/expression'

export type MergePatch<T> = {
  value: T
  reducer: ExpressionReference<T, [Array<T>]>
}

export type Patch<T> = T | MergePatch<T>

export type PatchRequest<T> = {
  [P in keyof T]?: Patch<T[P]>
}
