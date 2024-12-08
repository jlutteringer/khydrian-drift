import {
  Expression,
  ExpressionReference,
  Expressions,
  ExpressionVariable,
  NumericExpressions
} from '@simulacrum/util/expression'
import { Referencable, Reference } from '@simulacrum/util/reference'
import { References } from '@simulacrum/util'
import { EffectSource } from '@simulacrum/common/effect'

export type AttributeReference<T> = Reference<'Attribute'>

export type AttributeTemplate<T> = Referencable<AttributeReference<T>> & {
  name: string
  path: string
  reducer: ExpressionReference<T, T>
}

export type AttributeProps<T> = {
  template: AttributeTemplate<T>
} & ({ base: Expression<T> } | { initialValue: true })

export type Attribute<T> = AttributeTemplate<T> & {
  base: Expression<T> | null
  variable: ExpressionVariable<T>
}

export type AttributeValue<T> = {
  name: string
  value: T
  baseValue: T
  base: Expression<T> | null

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

export const defineTemplate = <T>(id: AttributeReference<T> | string, name: string, path: string): AttributeTemplate<T> => {
  const reference = References.reference(id, 'Attribute', name)

  return {
    reference,
    name,
    path,
    reducer: Expressions.reference(NumericExpressions.sum([])),
  }
}

export const defineAttribute = <T>(props: AttributeProps<T>): Attribute<T> => {
  return {
    ...props.template,
    base: 'base' in props ? props.base : null,
    variable: Expressions.variable(props.template.reference.id),
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
