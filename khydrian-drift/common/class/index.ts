import { TraitReference } from '@khydrian-drift/common/trait'
import { Referencable } from '@khydrian-drift/util/reference'

export type ClassReference = {}

export type ClassProps = {
  name: string
  vitalityIncrement: number
  startingTraits: Array<TraitReference>
}

export type Class = Referencable<ClassReference> & ClassProps & {}

export const reference = (name: string): ClassReference => {
  // JOHN
  return null!
}

export const defineClass = (reference: ClassReference, props: ClassProps): Class => {
  // JOHN
  return null!
}

export const getClass = (reference: ClassReference): Class => {
  // JOHN
  return null!
}
