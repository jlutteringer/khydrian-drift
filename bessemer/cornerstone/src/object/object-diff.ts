import { ObjectPath } from '@bessemer/cornerstone/object/object-path'
import { ObjectPathType, TypePathGet, TypePathType } from '@bessemer/cornerstone/object/type-path-type'
import { matches as typePathMatches, TypePath } from '@bessemer/cornerstone/object/type-path'

export enum ObjectDiffType {
  Add = 'Add',
  Remove = 'Remove',
  Update = 'Update',
  Move = 'Move',
}

export type AddObjectDiff<N, T extends TypePathType> = {
  type: ObjectDiffType.Add
  path: ObjectPath<T>
  value: TypePathGet<T, N>
}

export type RemoveObjectDiff<N, T extends TypePathType> = {
  type: ObjectDiffType.Remove
  path: ObjectPath<T>
  originalValue: TypePathGet<T, N>
}

export type UpdateObjectDiff<N, T extends TypePathType> = {
  type: ObjectDiffType.Update
  path: ObjectPath<T>
  value: TypePathGet<T, N>
  originalValue: TypePathGet<T, N>
}

export type MoveObjectDiff<N, T extends TypePathType> = {
  type: ObjectDiffType.Move
  path: ObjectPath<T>
  value: TypePathGet<T, N>
  position: number
  originalPosition: number
}

export type ObjectDiffEntry<N, T extends TypePathType = TypePathType> =
  | AddObjectDiff<N, T>
  | RemoveObjectDiff<N, T>
  | UpdateObjectDiff<N, T>
  | MoveObjectDiff<N, T>

export type ObjectDiff<N> = Array<ObjectDiffEntry<N>>

export const add = <N, T extends ObjectPathType>(path: ObjectPath<T>, value: TypePathGet<T, N>): AddObjectDiff<N, T> => {
  return { type: ObjectDiffType.Add, path, value }
}

export const remove = <N, T extends ObjectPathType>(path: ObjectPath<T>, originalValue: TypePathGet<T, N>): RemoveObjectDiff<N, T> => {
  return { type: ObjectDiffType.Remove, path, originalValue }
}

export const update = <N, T extends ObjectPathType>(
  path: ObjectPath<T>,
  value: TypePathGet<T, N>,
  originalValue: TypePathGet<T, N>
): UpdateObjectDiff<N, T> => {
  return { type: ObjectDiffType.Update, path, value, originalValue }
}

export const matchesPath = <N, T extends TypePathType>(diff: ObjectDiffEntry<N>, path: TypePath<T>): diff is ObjectDiffEntry<N, T> => {
  return typePathMatches(diff.path, path)
}
