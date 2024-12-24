import { Attribute, AttributeValue, Modifier } from '@simulacrum/common/attribute'
import { Attributes, Effects } from '@simulacrum/common'
import { Effect } from '@simulacrum/common/effect'
import { CharacterInitialValues } from '@simulacrum/common/character/character'
import { Referencable, Reference, ReferenceType } from '@bessemer/cornerstone/reference'
import { EvaluateExpression, Expression, Expressions, ExpressionVariable, NumericExpressions, ReducingExpression } from '@bessemer/cornerstone/expression'
import { Objects, Preconditions, References } from '@bessemer/cornerstone'

export type CharacteristicReference<T> = Reference<'Characteristic'>

export type CharacteristicTemplate<T> = Referencable<CharacteristicReference<T>> & {
  name: string
  path: string
  optimizer: ReducingExpression<T, T>
}

export type CharacteristicProps<T> = {
  template: CharacteristicTemplate<T>
} & ({ baseValue: Expression<T> } | { initialValue: true })

export type Characteristic<T> = CharacteristicTemplate<T> & {
  baseValue: Expression<T> | null
  variable: ExpressionVariable<T>
}

export type CharacteristicValue<T> = AttributeValue<T> & {
  name: string
  characteristic: CharacteristicReference<T>
}

export const defineTemplate = <T>(id: ReferenceType<CharacteristicReference<T>>, name: string, path: string): CharacteristicTemplate<T> => {
  const reference = References.reference(id, 'Characteristic', name)

  return {
    reference,
    name,
    path,
    // JOHN another instance of us 'hardcoding' numeric attributes...
    optimizer: Expressions.reference(NumericExpressions.MaxExpression) as ReducingExpression<T, T>,
  }
}

export const defineCharacteristic = <T>(props: CharacteristicProps<T>): Characteristic<T> => {
  return {
    ...props.template,
    baseValue: 'baseValue' in props ? props.baseValue : null,
    variable: Expressions.variable(props.template.reference.id),
  }
}

export const buildAttribute = <T>(characteristic: Characteristic<T>, initialValues: CharacterInitialValues): Attribute<T> => {
  let baseValue
  if (Objects.isPresent(characteristic.baseValue)) {
    baseValue = characteristic.baseValue
  } else {
    const initialValue = Objects.getPathValue(initialValues, characteristic.path)
    Preconditions.isPresent(initialValue)
    baseValue = initialValue as T
  }

  return Attributes.attribute(baseValue, characteristic.optimizer)
}

export const simpleValue = <T>(value: T, characteristic: Characteristic<T>, initialValues: CharacterInitialValues): CharacteristicValue<T> => {
  return {
    name: characteristic.name,
    characteristic: References.getReference(characteristic),
    ...Attributes.simpleAttributeValue(value, buildAttribute(characteristic, initialValues)),
  }
}

export const evaluateCharacteristic = <T>(
  characteristic: Characteristic<T>,
  initialValues: CharacterInitialValues,
  effects: Array<Effect>,
  evaluate: EvaluateExpression
): CharacteristicValue<T> => {
  const attribute = buildAttribute(characteristic, initialValues)

  // JOHN need to set sources or something... gotta figure that one out!
  const modifiers = Effects.filter(effects, Effects.ModifyCharacteristic)
    .filter((it) => References.equals(it.characteristic, characteristic.reference))
    .map((it) => it.modifier) as Array<Modifier<T>>

  const attributeValue = Attributes.evaluateAttribute(attribute, modifiers, evaluate)

  return {
    name: characteristic.name,
    characteristic: References.getReference(characteristic),
    ...attributeValue,
  }
}
