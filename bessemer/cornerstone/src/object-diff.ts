import { ObjectPath, ObjectPathsForType } from '@bessemer/cornerstone/object-path'

export enum ObjectDiffType {
  Add = 'Add',
  Remove = 'Remove',
  Update = 'Update',
  Move = 'Move',
}

export type AddObjectDiff<N, T extends ObjectPathsForType<N>> = {
  type: ObjectDiffType.Add
  path: T
  value: unknown
}

export type RemoveObjectDiff<N, T extends ObjectPathsForType<N>> = {
  type: ObjectDiffType.Remove
  path: ObjectPath<T>
}

export type UpdateObjectDiff<N, T extends ObjectPathsForType<N>> = {
  type: ObjectDiffType.Update
  path: ObjectPath<T>
  originalValue: unknown
  value: unknown
}

export type MoveObjectDiff<N, T extends ObjectPathsForType<N>> = {
  type: ObjectDiffType.Move
  path: ObjectPath<T>
  value: unknown
  originalPosition: number
  position: number
}

export type ObjectDiffEntry<N, T extends ObjectPathsForType<N>> = AddObjectDiff<T> | RemoveObjectDiff<T> | UpdateObjectDiff<T> | MoveObjectDiff<T>
