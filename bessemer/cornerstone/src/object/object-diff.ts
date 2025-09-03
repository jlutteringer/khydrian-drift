import { Get } from 'type-fest'
import { ConstrainObjectPathTypes, ObjectPath } from '@bessemer/cornerstone/object/object-path'

export enum ObjectDiffType {
  Add = 'Add',
  Remove = 'Remove',
  Update = 'Update',
  Move = 'Move',
}

export type AddObjectDiff<N, T extends ConstrainObjectPathTypes<N> = ConstrainObjectPathTypes<N>> = {
  type: ObjectDiffType.Add
  path: ObjectPath<T>
  value: Get<N, T>
}

export type RemoveObjectDiff<N, T extends ConstrainObjectPathTypes<N> = ConstrainObjectPathTypes<N>> = {
  type: ObjectDiffType.Remove
  path: ObjectPath<T>
  originalValue: Get<N, T>
}

export type UpdateObjectDiff<N, T extends ConstrainObjectPathTypes<N> = ConstrainObjectPathTypes<N>> = {
  type: ObjectDiffType.Update
  path: ObjectPath<T>
  value: Get<N, T>
  originalValue: Get<N, T>
}

export type MoveObjectDiff<N, T extends ConstrainObjectPathTypes<N> = ConstrainObjectPathTypes<N>> = {
  type: ObjectDiffType.Move
  path: ObjectPath<T>
  value: Get<N, T>
  position: number
  originalPosition: number
}

export type ObjectDiffEntry<N, T extends ConstrainObjectPathTypes<N> = ConstrainObjectPathTypes<N>> =
  | AddObjectDiff<N, T>
  | RemoveObjectDiff<N, T>
  | UpdateObjectDiff<N, T>
  | MoveObjectDiff<N, T>

export type ObjectDiff<N> = Array<ObjectDiffEntry<N>>

export const add = <N, T extends ConstrainObjectPathTypes<N> = ConstrainObjectPathTypes<N>>(
  path: ObjectPath<T>,
  value: Get<N, T>
): AddObjectDiff<N, T> => {
  return { type: ObjectDiffType.Add, path, value }
}

export const remove = <N, T extends ConstrainObjectPathTypes<N> = ConstrainObjectPathTypes<N>>(
  path: ObjectPath<T>,
  originalValue: Get<N, T>
): RemoveObjectDiff<N, T> => {
  return { type: ObjectDiffType.Remove, path, originalValue }
}

export const update = <N, T extends ConstrainObjectPathTypes<N> = ConstrainObjectPathTypes<N>>(
  path: ObjectPath<T>,
  value: Get<N, T>,
  originalValue: Get<N, T>
): UpdateObjectDiff<N, T> => {
  return { type: ObjectDiffType.Update, path, value, originalValue }
}
