import { Expression, ReducingExpression } from '@khydrian-drift/util/expression'
import { Referencable, Reference } from '@khydrian-drift/util/reference'
import { References } from '@khydrian-drift/util'

export type AttributeReference<T> = Reference<'Attribute'>

export type AttributeProps<T> = {
  name: string
  base: T
  reducer: ReducingExpression<T, T>
}

export type Attribute<T> = Referencable<AttributeReference<T>> & AttributeProps<T> & {}

export type AttributeValue<T> = {
  attribute: AttributeReference<T>
  value: T
  base: T
  activeModifiers: Array<Modifier<T>>
  inactiveModifiers: Array<Modifier<T>>
}

export type Modifier<T> = {
  value: T
  expression: Expression<T>
  condition: Expression<boolean> | null
  context: null // JOHN
}

export const defineAttribute = <T>(reference: AttributeReference<T> | string, props: AttributeProps<T>): Attribute<T> => {
  return {
    reference: References.reference(reference, 'Attribute', props.name),
    ...props,
  }
}
