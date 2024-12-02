import { Referencable, Reference } from '@khydrian-drift/util/reference'
import { References } from '@khydrian-drift/util'

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
