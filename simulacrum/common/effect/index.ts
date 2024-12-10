import { Trait, TraitReference } from '@simulacrum/common/trait'
import { LoadoutType, LoadoutTypeReference } from '@simulacrum/common/loadout'
import { ResourcePool, ResourcePoolMutation, ResourcePoolReference } from '../resource-pool'
import { Expression, ExpressionContext, Expressions } from '@simulacrum/util/expression'
import { Arrays, Comparators, Objects, Preconditions, References } from '@simulacrum/util'
import { Attribute, AttributeReference, AttributeValue, Modifier } from '@simulacrum/common/attribute'
import { Attributes } from '@simulacrum/common'
import { CharacterOption } from '@simulacrum/common/character/character-option'
import { Ability, AbilityReference } from '@simulacrum/common/ability'

export interface Effect {
  type: string
  condition: Expression<boolean> | null
  source?: EffectSource
}

export type EffectSource = TraitReference

export type EffectType<T extends Effect> = { type: string }

export const Descriptive: EffectType<DescriptiveEffect> = { type: 'Descriptive' }
export type DescriptiveEffect = Effect & {
  type: 'Descriptive'
  description: string
}

export const GainCharacterOption: EffectType<GainCharacterOptionEffect> = { type: 'GainCharacterOption' }
export type GainCharacterOptionEffect = Effect & {
  type: 'GainCharacterOption'
  option: CharacterOption
}

export const GainTrait: EffectType<GainTraitEffect> = { type: 'GainTrait' }
export type GainTraitEffect = Effect & {
  type: 'GainTrait'
  trait: TraitReference
}

export const GainAbility: EffectType<GainTraitEffect> = { type: 'GainAbility' }
export type GainAbilityEffect = Effect & {
  type: 'GainAbility'
  ability: AbilityReference
}

export const AssignAttribute: EffectType<ModifyAttributeEffect> = { type: 'AssignAttribute' }
export type AssignAttributeEffect = Effect & {
  type: 'AssignAttribute'
  attribute: AttributeReference<unknown>
  modifier: Expression<unknown>
}

export const ModifyAttribute: EffectType<ModifyAttributeEffect> = { type: 'ModifyAttribute' }
export type ModifyAttributeEffect = Effect & {
  type: 'ModifyAttribute'
  attribute: AttributeReference<unknown>
  modifier: Expression<unknown>
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

export const filter = <T extends Effect>(effects: Array<Effect>, type: EffectType<T>): Array<T> => {
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
  const effects = filter(initialEffects, type)
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

const buildModifier = <T>(effect: ModifyAttributeEffect | AssignAttributeEffect, context: ExpressionContext): Modifier<T> => {
  return {
    value: Expressions.evaluate(effect.modifier, context) as T,
    expression: effect.modifier as Expression<T>,
    condition: effect.condition,
    source: effect.source ?? null,
  }
}

// TODO is there a way to back off of the fact that attributes must be numbers
export const evaluateAttribute = <T extends number>(
  attribute: Attribute<T>,
  initialEffects: Array<Effect>,
  initialValues: Record<string, unknown>,
  context: ExpressionContext
): AttributeValue<T> => {
  let baseValue
  if (Objects.isPresent(attribute.base)) {
    baseValue = Expressions.evaluate(attribute.base, context)
  } else {
    const initialValue = Objects.parsePath(attribute.path).getValue(initialValues)
    Preconditions.isPresent(initialValue)
    baseValue = initialValue as T
  }

  const effects = filter(initialEffects, ModifyAttribute).filter((it) => References.equals(it.attribute, attribute.reference))
  const { activeEffects, inactiveEffects } = evaluateEffects(effects, ModifyAttribute, context)

  const activeModifiers = activeEffects.map((it) => buildModifier<T>(it, context))
  const inactiveModifiers = inactiveEffects.map((it) => buildModifier<T>(it, context))
  const operands = [baseValue, ...activeModifiers.map((it) => it.value)]
  const value = Expressions.evaluate(Expressions.dereference(attribute.reducer, operands), context)

  const setEffects = filter(initialEffects, AssignAttribute).filter((it) => References.equals(it.attribute, attribute.reference))

  const updatedVariables = {
    ...context.variables,
    ...Expressions.buildVariable(attribute.variable, value),
  }

  const { activeEffects: activeAssignmentEffects, inactiveEffects: inactiveAssignmentEffects } = evaluateEffects(setEffects, AssignAttribute, {
    ...context,
    variables: updatedVariables,
  })

  const activeAssignments = activeAssignmentEffects.map((it) => buildModifier<T>(it, context))
  const inactiveAssignments = inactiveAssignmentEffects.map((it) => buildModifier<T>(it, context))

  if (!Arrays.isEmpty(activeAssignments)) {
    activeAssignments.sort(Comparators.compareBy((it) => it.value, Comparators.reverse(Comparators.natural())))
    const bestAssignment = Arrays.first(activeAssignments)!

    return Attributes.buildValue(
      {
        value: bestAssignment.value,
        baseValue: baseValue,
        inactiveModifiers: [...activeModifiers, ...inactiveModifiers],
        activeAssignment: bestAssignment,
        inactiveAssignments: [...Arrays.rest(activeAssignments), ...inactiveAssignments],
      },
      attribute
    )
  }

  return Attributes.buildValue(
    {
      value: value,
      baseValue: baseValue,
      activeModifiers,
      inactiveModifiers,
      activeAssignment: null,
      inactiveAssignments: [...activeAssignments, ...inactiveAssignments],
    },
    attribute
  )
}

export const descriptive = (description: string, condition: Expression<boolean> | null = null): DescriptiveEffect => {
  return {
    type: 'Descriptive',
    description,
    condition,
  }
}

export const gainCharacterOption = (option: CharacterOption, condition: Expression<boolean> | null = null): GainCharacterOptionEffect => {
  return {
    type: 'GainCharacterOption',
    option,
    condition,
  }
}

export const gainTrait = (trait: TraitReference | Trait, condition: Expression<boolean> | null = null): GainTraitEffect => {
  return {
    type: 'GainTrait',
    trait: References.getReference(trait),
    condition,
  }
}

export const gainAbility = (ability: AbilityReference | Ability, condition: Expression<boolean> | null = null): GainAbilityEffect => {
  return {
    type: 'GainAbility',
    ability: References.getReference(ability),
    condition,
  }
}

export const assignAttribute = (
  attribute: AttributeReference<number> | Attribute<number>,
  modifier: Expression<number>,
  condition: Expression<boolean> | null = null
): AssignAttributeEffect => {
  return {
    type: 'AssignAttribute',
    attribute: References.getReference(attribute),
    modifier,
    condition,
  }
}

export const modifyAttribute = (
  attribute: AttributeReference<number> | Attribute<number>,
  modifier: Expression<number>,
  condition: Expression<boolean> | null = null
): ModifyAttributeEffect => {
  return {
    type: 'ModifyAttribute',
    attribute: References.getReference(attribute),
    modifier,
    condition,
  }
}

export const modifyLoadoutSlotQuantity = (
  loadoutType: LoadoutTypeReference | LoadoutType,
  amount: Expression<number>,
  condition: Expression<boolean> | null = null
): ModifyLoadoutSlotQuantityEffect => {
  return {
    type: 'ModifyLoadoutSlotQuantity',
    loadoutType: References.getReference(loadoutType),
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

export const gainResourcePool = (resourcePool: ResourcePoolReference | ResourcePool, condition: Expression<boolean> | null = null): GainResourcePoolEffect => {
  return {
    type: 'GainResourcePool',
    resourcePool: References.getReference(resourcePool),
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
