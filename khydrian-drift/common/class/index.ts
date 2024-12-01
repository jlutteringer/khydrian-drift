import { TraitReference } from '@khydrian-drift/common/trait'
import { Referencable, Reference } from '@khydrian-drift/util/reference'
import { Preconditions, References } from '@khydrian-drift/util'
import { ApplicationContext } from '@khydrian-drift/common/context'

export type ClassReference = Reference<'Class'>

export type ClassProps = {
  name: string
  vitalityIncrement: number
  startingTraits: Array<TraitReference>
}

export type Class = Referencable<ClassReference> & ClassProps & {}

export const reference = (id: string, name: string): ClassReference => {
  return References.reference(id, 'Class', name)
}

export const defineClass = (reference: ClassReference, props: ClassProps): Class => {
  return {
    reference: References.reference(reference, 'Class', props.name),
    ...props,
  }
}

export const getClass = (reference: ClassReference, context: ApplicationContext): Class => {
  const matchingClass = context.ruleset.classes.find((it) => it.reference.id === reference.id)
  Preconditions.isPresent(matchingClass)
  return matchingClass
}
