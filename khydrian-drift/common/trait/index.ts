import { Referencable } from '@khydrian-drift/util/reference'
import { TraitPrerequisite } from '@khydrian-drift/common/trait/prerequisite'
import { Effect } from '@khydrian-drift/common/effect'

export * from './prerequisite'

export type TraitReference = {
  id: string
}

export type TraitProps = {
  name: string
  description: string
  prerequisites: Array<TraitPrerequisite>
  effects: Array<Effect>
}

export type Trait = Referencable<TraitReference> & TraitProps & {}

export const reference = (name: string): TraitReference => {
  // JOHN
  return null!
}

export function defineTrait(props: TraitProps): Trait
export function defineTrait(reference: TraitReference, props: TraitProps): Trait
export function defineTrait(referenceOrProps: TraitProps | TraitReference, props?: TraitProps): Trait {
  // JOHN
  return null!
}
