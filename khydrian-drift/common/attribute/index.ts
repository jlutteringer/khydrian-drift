import { Expression, ExpressionReference, Expressions, ExpressionVariable } from '@khydrian-drift/util/expression'
import { Referencable, Reference } from '@khydrian-drift/util/reference'
import { References } from '@khydrian-drift/util'
import { EffectSource } from '@khydrian-drift/common/effect'

export type AttributeReference<T> = Reference<'Attribute'>

export type AttributeProps<T> = {
  name: string
  base: T
  reducer: ExpressionReference<T, T>
}

export type Attribute<T> = Referencable<AttributeReference<T>> &
  AttributeProps<T> & {
    variable: ExpressionVariable<T>
  }

export type AttributeValue<T> = {
  attribute: AttributeReference<T>
  value: T
  base: T

  activeModifiers: Array<Modifier<T>>
  inactiveModifiers: Array<Modifier<T>>

  activeAssignment: Modifier<T> | null
  inactiveAssignments: Array<Modifier<T>>
}

// JOHN... better name? this is being used for modifiers and assignments
export type Modifier<T> = {
  value: T
  expression: Expression<T>
  condition: Expression<boolean> | null
  source: EffectSource | null
}

export const defineAttribute = <T>(id: AttributeReference<T> | string, props: AttributeProps<T>): Attribute<T> => {
  const reference = References.reference(id, 'Attribute', props.name)

  return {
    reference,
    ...props,
    variable: Expressions.variable(reference.id),
  }
}
