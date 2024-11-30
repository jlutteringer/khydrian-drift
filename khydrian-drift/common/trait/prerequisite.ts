import { ClassReference } from '@khydrian-drift/common/class'
import { TraitReference } from '@khydrian-drift/common/trait/index'

enum TraitPrerequisiteType {
  Not = 'Not',
  Class = 'Class',
  Trait = 'Trait',
}

export type NotPrerequisite = {
  type: TraitPrerequisiteType.Not
  prerequisite: TraitPrerequisite
}

export type ClassTraitPrerequisite = {
  type: TraitPrerequisiteType.Class
  class: ClassReference
}

export type TraitTraitPrerequisite = {
  type: TraitPrerequisiteType.Trait
  trait: TraitReference
}

export type TraitPrerequisite = NotPrerequisite | ClassTraitPrerequisite | TraitTraitPrerequisite

export const notPrerequisite = (prerequisite: TraitPrerequisite): NotPrerequisite => {
  // JOHN
  return null!
}

export const classPrerequisite = (clazz: ClassReference): ClassTraitPrerequisite => {
  // JOHN
  return null!
}

export const traitPrerequisite = (trait: TraitReference): TraitTraitPrerequisite => {
  // JOHN
  return null!
}
