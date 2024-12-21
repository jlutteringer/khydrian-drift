import { Referencable, Reference } from '@bessemer/cornerstone/reference'
import { References } from '@bessemer/cornerstone'

export type ArchetypeReference = Reference<'Archetype'>

export type ArchetypeProps = {
  name: string
}

export type Archetype = Referencable<ArchetypeReference> & ArchetypeProps & {}

export const defineArchetype = (reference: ArchetypeReference | string, props: ArchetypeProps): Archetype => {
  return {
    reference: References.reference(reference, 'Archetype', props.name),
    ...props,
  }
}
