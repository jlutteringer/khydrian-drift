import { Trait, TraitReference } from '@simulacrum/common/trait'
import { LoadoutType, LoadoutTypeReference } from '@simulacrum/common/loadout'
import { ResourcePoolDefinition, ResourcePoolReference } from '../resource-pool'
import { Expression } from '@simulacrum/util/expression'
import { References } from '@simulacrum/util'
import { CharacterOption } from '@simulacrum/common/character/character-option'
import { Ability, AbilityReference } from '@simulacrum/common/ability'
import { Characteristic, CharacteristicReference } from '@simulacrum/common/characteristic'
import { Modifier } from '@simulacrum/common/attribute'

export interface Effect {
  type: string
  source?: EffectSource
}

export type EffectSource = TraitReference | AbilityReference

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

export const GainAbility: EffectType<GainAbilityEffect> = { type: 'GainAbility' }
export type GainAbilityEffect = Effect & {
  type: 'GainAbility'
  ability: AbilityReference
}

export const GainCharacteristic: EffectType<GainCharacteristicEffect> = { type: 'GainCharacteristic' }
export type GainCharacteristicEffect = Effect & {
  type: 'GainCharacteristic'
  characteristic: CharacteristicReference<unknown>
}

export const ModifyCharacteristic: EffectType<ModifyCharacteristicEffect> = { type: 'ModifyCharacteristic' }
export type ModifyCharacteristicEffect = Effect & {
  type: 'ModifyCharacteristic'
  characteristic: CharacteristicReference<unknown>
  modifier: Modifier<unknown>
}

export const GainResourcePool: EffectType<GainResourcePoolEffect> = { type: 'GainResourcePool' }
export type GainResourcePoolEffect = Effect & {
  type: 'GainResourcePool'
  resourcePool: ResourcePoolReference
}

export const ModifyResourcePool: EffectType<ModifyResourcePoolEffect> = { type: 'ModifyResourcePool' }
export type ModifyResourcePoolEffect = Effect & {
  type: 'ModifyResourcePool'
  resourcePool: ResourcePoolReference
  modifier: Modifier<unknown>
}

export const ModifyLoadoutSlotQuantity: EffectType<ModifyLoadoutSlotQuantityEffect> = { type: 'ModifyLoadoutSlotQuantity' }
export type ModifyLoadoutSlotQuantityEffect = Effect & {
  type: 'ModifyLoadoutSlotQuantity'
  loadoutType: LoadoutTypeReference
  amount: Expression<number>
}

export const filter = <T extends Effect>(effects: Array<Effect>, type: EffectType<T>): Array<T> => {
  const matchingEffects = effects.filter((it) => it.type === type.type)
  return matchingEffects as Array<T>
}

export const descriptive = (description: string): DescriptiveEffect => {
  return {
    type: 'Descriptive',
    description,
  }
}

export const gainCharacterOption = (option: CharacterOption): GainCharacterOptionEffect => {
  return {
    type: 'GainCharacterOption',
    option,
  }
}

export const gainTrait = (trait: TraitReference | Trait): GainTraitEffect => {
  return {
    type: 'GainTrait',
    trait: References.getReference(trait),
  }
}

export const gainAbility = (ability: AbilityReference | Ability): GainAbilityEffect => {
  return {
    type: 'GainAbility',
    ability: References.getReference(ability),
  }
}

export const gainCharacteristic = (characteristic: CharacteristicReference<number> | Characteristic<number>): GainCharacteristicEffect => {
  return {
    type: 'GainCharacteristic',
    characteristic: References.getReference(characteristic),
  }
}

export const modifyCharacteristic = (
  characteristic: CharacteristicReference<number> | Characteristic<number>,
  modifier: Modifier<unknown>
): ModifyCharacteristicEffect => {
  return {
    type: 'ModifyCharacteristic',
    characteristic: References.getReference(characteristic),
    modifier,
  }
}

export const gainResourcePool = (resourcePool: ResourcePoolReference | ResourcePoolDefinition): GainResourcePoolEffect => {
  return {
    type: 'GainResourcePool',
    resourcePool: References.getReference(resourcePool),
  }
}

export const modifyResourcePool = (resourcePool: ResourcePoolReference | ResourcePoolDefinition, modifier: Modifier<unknown>): ModifyResourcePoolEffect => {
  return {
    type: 'ModifyResourcePool',
    resourcePool: References.getReference(resourcePool),
    modifier,
  }
}

export const modifyLoadoutSlotQuantity = (loadoutType: LoadoutTypeReference | LoadoutType, amount: Expression<number>): ModifyLoadoutSlotQuantityEffect => {
  return {
    type: 'ModifyLoadoutSlotQuantity',
    loadoutType: References.getReference(loadoutType),
    amount,
  }
}
