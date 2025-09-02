import { Get } from 'type-fest'
import { ConstrainObjectPaths } from '@bessemer/cornerstone/object/object-path'

export enum ObjectDiffType {
  Add = 'Add',
  Remove = 'Remove',
  Update = 'Update',
  Move = 'Move',
}

export type AddObjectDiff<N, T extends ConstrainObjectPaths<N> = ConstrainObjectPaths<N>> = {
  type: ObjectDiffType.Add
  path: T
  value: Get<N, T>
}

export type RemoveObjectDiff<N, T extends ConstrainObjectPaths<N> = ConstrainObjectPaths<N>> = {
  type: ObjectDiffType.Remove
  path: T
  originalValue: Get<N, T>
}

export type UpdateObjectDiff<N, T extends ConstrainObjectPaths<N> = ConstrainObjectPaths<N>> = {
  type: ObjectDiffType.Update
  path: T
  value: Get<N, T>
  originalValue: Get<N, T>
}

export type MoveObjectDiff<N, T extends ConstrainObjectPaths<N> = ConstrainObjectPaths<N>> = {
  type: ObjectDiffType.Move
  path: T
  value: Get<N, T>
  position: number
  originalPosition: number
}

export type ObjectDiffEntry<N, T extends ConstrainObjectPaths<N> = ConstrainObjectPaths<N>> =
  | AddObjectDiff<N, T>
  | RemoveObjectDiff<N, T>
  | UpdateObjectDiff<N, T>
  | MoveObjectDiff<N, T>

export type ConstrainObjectDiffEntries<N, T extends ConstrainObjectPaths<N> = ConstrainObjectPaths<N>> = Extract<ObjectDiffEntry<N, T>, { type: T }>

export type ObjectDiff<N> = { entries: Array<ObjectDiffEntry<N>> }

export const add = <N, T extends ConstrainObjectPaths<N> = ConstrainObjectPaths<N>>(path: T, value: Get<N, T>): AddObjectDiff<N, T> => {
  return { type: ObjectDiffType.Add, path, value }
}

export const remove = <N, T extends ConstrainObjectPaths<N> = ConstrainObjectPaths<N>>(path: T, originalValue: Get<N, T>): RemoveObjectDiff<N, T> => {
  return { type: ObjectDiffType.Remove, path, originalValue }
}

export const update = <N, T extends ConstrainObjectPaths<N> = ConstrainObjectPaths<N>>(
  path: T,
  value: Get<N, T>,
  originalValue: Get<N, T>
): UpdateObjectDiff<N, T> => {
  return { type: ObjectDiffType.Update, path, value, originalValue }
}
