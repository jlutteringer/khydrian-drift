import { Expression, ExpressionReference, Expressions, ExpressionVariable } from '@khydrian-drift/util/expression'
import { Referencable, Reference } from '@khydrian-drift/util/reference'
import { References } from '@khydrian-drift/util'
import { EffectSource } from '@khydrian-drift/common/effect'

export type AttributeReference<T> = Reference<'Attribute'>

export type AttributeProps<T> = {
  name: string
  base: Expression<T>
  reducer: ExpressionReference<T, T>
}

export type Attribute<T> = Referencable<AttributeReference<T>> &
  AttributeProps<T> & {
    variable: ExpressionVariable<T>
  }

export type AttributeValue<T> = {
  name: string
  value: T
  baseValue: T
  base: Expression<T>

  activeModifiers: Array<Modifier<T>>
  inactiveModifiers: Array<Modifier<T>>

  activeAssignment: Modifier<T> | null
  inactiveAssignments: Array<Modifier<T>>
  attribute: AttributeReference<T>
}

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

export type AttributeValueBuilder<T> = {
  value: T
  baseValue: T

  activeModifiers?: Array<Modifier<T>>
  inactiveModifiers?: Array<Modifier<T>>

  activeAssignment?: Modifier<T> | null
  inactiveAssignments?: Array<Modifier<T>>
}

export const buildValue = <T>(builder: AttributeValueBuilder<T>, attribute: Attribute<T>): AttributeValue<T> => {
  return {
    name: attribute.name,
    value: builder.value,
    baseValue: builder.baseValue,
    base: attribute.base,
    activeModifiers: builder.activeModifiers ?? [],
    inactiveModifiers: builder.inactiveModifiers ?? [],
    activeAssignment: builder.activeAssignment ?? null,
    inactiveAssignments: builder.inactiveAssignments ?? [],
    attribute: attribute.reference,
  }
}

export const baseValue = <T>(value: T, attribute: Attribute<T>): AttributeValue<T> => {
  return buildValue({ value: value, baseValue: value }, attribute)
}
