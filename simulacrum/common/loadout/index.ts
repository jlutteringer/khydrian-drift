import { Referencable, Reference } from '@bessemer/cornerstone/reference'
import { References } from '@bessemer/cornerstone'

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
