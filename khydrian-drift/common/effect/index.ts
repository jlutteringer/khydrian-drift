import { TraitReference } from '@khydrian-drift/common/trait'
import { LoadoutTypeReference } from '@khydrian-drift/common/loadout'
import { ResourcePoolMutation, ResourcePoolReference } from '../resource-pool'
import { Expression, ExpressionContext, Expressions } from '@khydrian-drift/util/expression'
import { Objects } from '@khydrian-drift/util'
import { Attribute, AttributeReference, AttributeValue, Modifier } from '@khydrian-drift/common/attribute'

export interface Effect {
  type: string
  condition: Expression<boolean> | null
}

export type EffectType<T extends Effect> = { type: string }

export const Descriptive: EffectType<DescriptiveEffect> = { type: 'Descriptive' }
export type DescriptiveEffect = Effect & {
  type: 'Descriptive'
  description: string
}

export const GainTrait: EffectType<GainTraitEffect> = { type: 'GainTrait' }
export type GainTraitEffect = Effect & {
  type: 'GainTrait'
  trait: TraitReference
}

export const ModifyAttribute: EffectType<ModifyAttributeEffect> = { type: 'ModifyAttribute' }
export type ModifyAttributeEffect = Effect & {
  type: 'ModifyAttribute'
  attribute: AttributeReference<number>
  modifier: Expression<number>
}

export const ModifyLoadoutSlotQuantity: EffectType<ModifyLoadoutSlotQuantityEffect> = { type: 'ModifyLoadoutSlotQuantity' }
export type ModifyLoadoutSlotQuantityEffect = Effect & {
  type: 'ModifyLoadoutSlotQuantity'
  loadoutType: LoadoutTypeReference
  amount: Expression<number>
}

export const ModifyHealingSurgeQuantity: EffectType<ModifyHealingSurgeQuantityEffect> = { type: 'ModifyHealingSurgeQuantity' }
export type ModifyHealingSurgeQuantityEffect = Effect & {
  type: 'ModifyHealingSurgeQuantity'
  amount: Expression<number>
}

export const GainResourcePool: EffectType<GainResourcePoolEffect> = { type: 'GainResourcePool' }
export type GainResourcePoolEffect = Effect & {
  type: 'GainResourcePool'
  resourcePool: ResourcePoolReference
}

export const ModifyResourcePool: EffectType<ModifyResourcePoolEffect> = { type: 'ModifyResourcePool' }
export type ModifyResourcePoolEffect = Effect & {
  type: 'ModifyResourcePool'
  resourcePoolModification: ResourcePoolMutation
}

const filterEffectsByType = <T extends Effect>(effects: Array<Effect>, type: EffectType<T>): Array<T> => {
  const matchingEffects = effects.filter((it) => it.type === type.type)
  return matchingEffects as Array<T>
}

export type EvaluateEffectsResponse<T extends Effect> = {
  activeEffects: Array<T>
  inactiveEffects: Array<T>
}

export const evaluateEffects = <T extends Effect>(
  initialEffects: Array<Effect>,
  type: EffectType<T>,
  context: ExpressionContext
): EvaluateEffectsResponse<T> => {
  const effects = filterEffectsByType(initialEffects, type)
  const activeEffects: Array<T> = []
  const inactiveEffects: Array<T> = []

  for (const effect of effects) {
    if (Objects.isNil(effect.condition)) {
      activeEffects.push(effect)
    } else {
      const result = Expressions.evaluate(effect.condition, context)
      if (result) {
        activeEffects.push(effect)
      } else {
        inactiveEffects.push(effect)
      }
    }
  }

  return { activeEffects, inactiveEffects }
}

const buildModifier = <T>(effect: ModifyAttributeEffect, context: ExpressionContext): Modifier<number> => {
  return {
    value: Expressions.evaluate(effect.modifier, context),
    expression: effect.modifier,
    condition: effect.condition,
    context: null,
  }
}

// JOHN only works for numbers
export const evaluateAttribute = (attribute: Attribute<number>, initialEffects: Array<Effect>, context: ExpressionContext): AttributeValue<number> => {
  const effects = filterEffectsByType(initialEffects, ModifyAttribute).filter((it) => it.attribute.id === attribute.reference.id)
  const { activeEffects, inactiveEffects } = evaluateEffects(effects, ModifyAttribute, context)
  const activeModifiers = activeEffects.map((it) => buildModifier(it, context))
  const inactiveModifiers = inactiveEffects.map((it) => buildModifier(it, context))

  // JOHN this doesn't obey the attribute reduction function... we just use SUM...
  const value = [attribute.base, ...activeModifiers.map((it) => it.value)].reduce((x, y) => x + y, 0)

  return {
    attribute: attribute.reference,
    value: value,
    base: attribute.base,
    activeModifiers,
    inactiveModifiers,
  }
}

export const descriptive = (description: string, condition: Expression<boolean> | null = null): DescriptiveEffect => {
  return {
    type: 'Descriptive',
    description,
    condition,
  }
}

export const gainTrait = (trait: TraitReference, condition: Expression<boolean> | null = null): GainTraitEffect => {
  return {
    type: 'GainTrait',
    trait,
    condition,
  }
}

export const modifyAttribute = (
  attribute: AttributeReference<number>,
  modifier: Expression<number>,
  condition: Expression<boolean> | null = null
): ModifyAttributeEffect => {
  return {
    type: 'ModifyAttribute',
    attribute,
    modifier,
    condition,
  }
}

export const modifyLoadoutSlotQuantity = (
  loadoutType: LoadoutTypeReference,
  amount: Expression<number>,
  condition: Expression<boolean> | null = null
): ModifyLoadoutSlotQuantityEffect => {
  return {
    type: 'ModifyLoadoutSlotQuantity',
    loadoutType,
    amount,
    condition,
  }
}

export const modifyHealingSurgeQuantity = (amount: Expression<number>, condition: Expression<boolean> | null = null): ModifyHealingSurgeQuantityEffect => {
  return {
    type: 'ModifyHealingSurgeQuantity',
    amount,
    condition,
  }
}

export const gainResourcePool = (resourcePool: ResourcePoolReference, condition: Expression<boolean> | null = null): GainResourcePoolEffect => {
  return {
    type: 'GainResourcePool',
    resourcePool,
    condition,
  }
}

export const modifyResourcePool = (resourcePoolModification: ResourcePoolMutation, condition: Expression<boolean> | null = null): ModifyResourcePoolEffect => {
  return {
    type: 'ModifyResourcePool',
    resourcePoolModification,
    condition,
  }
}
