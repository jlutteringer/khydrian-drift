import { TraitReference } from '@khydrian-drift/common/trait'
import { LoadoutTypeReference } from '@khydrian-drift/common/loadout'
import { ResourcePoolModification, ResourcePoolReference } from '../resource-pool'
import { Expression } from '@khydrian-drift/util/expression'

export enum EffectType {
  Descriptive = 'Descriptive',
  Conditional = 'Conditional',
  GainTrait = 'GainTrait',
  ModifyLoadoutSlotQuantity = 'ModifyLoadoutSlotQuantity',
  ModifyHealingSurgeQuantity = 'ModifyHealingSurgeQuantity',
  ModifyMovementSpeed = 'ModifyMovementSpeed',
  GainResourcePool = 'GainResourcePool',
  ModifyResourcePool = 'ModifyResourcePool',
}

export type DescriptiveEffect = {
  type: EffectType.Descriptive
  description: string
}

export type ConditionalEffect = {
  type: EffectType.Conditional
  condition: Expression<boolean>
  effectIfTrue: Effect
  effectIfFalse: Effect | null
}

export type GainTraitEffect = {
  type: EffectType.GainTrait
  trait: TraitReference
}

export type ModifyLoadoutSlotQuantityEffect = {
  type: EffectType.ModifyLoadoutSlotQuantity
  loadoutType: LoadoutTypeReference
  amount: Expression<number>
}

export type ModifyHealingSurgeQuantityEffect = {
  type: EffectType.ModifyHealingSurgeQuantity
  amount: Expression<number>
}

export type ModifyMovementSpeedEffect = {
  type: EffectType.ModifyMovementSpeed
  amount: Expression<number>
}

export type GainResourcePoolEffect = {
  type: EffectType.GainResourcePool
  resourcePool: ResourcePoolReference
}

export type ModifyResourcePoolEffect = {
  type: EffectType.ModifyResourcePool
  resourcePoolModification: ResourcePoolModification
}

export type Effect =
  | DescriptiveEffect
  | ConditionalEffect
  | GainTraitEffect
  | ModifyLoadoutSlotQuantityEffect
  | ModifyHealingSurgeQuantityEffect
  | ModifyMovementSpeedEffect
  | GainResourcePoolEffect
  | ModifyResourcePoolEffect

export const descriptive = (description: string): DescriptiveEffect => {
  return {
    type: EffectType.Descriptive,
    description,
  }
}

export const conditional = (condition: Expression<boolean>, effectIfTrue: Effect, effectIfFalse: Effect | null = null): ConditionalEffect => {
  return {
    type: EffectType.Conditional,
    condition,
    effectIfTrue,
    effectIfFalse,
  }
}

export const gainTrait = (trait: TraitReference): GainTraitEffect => {
  return {
    type: EffectType.GainTrait,
    trait,
  }
}

export const modifyLoadoutSlotQuantity = (loadoutType: LoadoutTypeReference, amount: Expression<number>): ModifyLoadoutSlotQuantityEffect => {
  return {
    type: EffectType.ModifyLoadoutSlotQuantity,
    loadoutType,
    amount,
  }
}

export const modifyHealingSurgeQuantity = (amount: Expression<number>): ModifyHealingSurgeQuantityEffect => {
  return {
    type: EffectType.ModifyHealingSurgeQuantity,
    amount,
  }
}

export const modifyMovementSpeed = (amount: Expression<number>): ModifyMovementSpeedEffect => {
  return {
    type: EffectType.ModifyMovementSpeed,
    amount,
  }
}

export const gainResourcePool = (resourcePool: ResourcePoolReference): GainResourcePoolEffect => {
  return {
    type: EffectType.GainResourcePool,
    resourcePool,
  }
}

export const modifyResourcePool = (resourcePoolModification: ResourcePoolModification): ModifyResourcePoolEffect => {
  return {
    type: EffectType.ModifyResourcePool,
    resourcePoolModification,
  }
}
