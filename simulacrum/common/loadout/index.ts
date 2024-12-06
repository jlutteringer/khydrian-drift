import { Referencable, Reference } from '@simulacrum/util/reference'
import { References } from '@simulacrum/util'

export type LoadoutTypeReference = Reference<'LoadoutType'>

export type LoadoutProps = {
  name: string
}

export type LoadoutType = Referencable<LoadoutTypeReference> & LoadoutProps & {}

export const defineLoadoutType = (reference: LoadoutTypeReference | string, props: LoadoutProps): LoadoutType => {
  return {
    reference: References.reference(reference, 'LoadoutType', props.name),
    ...props,
  }
}
