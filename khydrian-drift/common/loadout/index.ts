import { Referencable } from '@khydrian-drift/util/reference'

export type LoadoutTypeReference = {}

export type LoadoutProps = {
  name: string
}

export type LoadoutType = Referencable<LoadoutTypeReference> & LoadoutProps & {}

export const defineLoadoutType = (props: LoadoutProps): LoadoutType => {
  // JOHN
  return null!
}
