import { ClassReference } from '@khydrian-drift/common/class'
import { Classes } from '@khydrian-drift/common'
import { TraitReference } from '@khydrian-drift/common/trait'
import { CreatureDefinition } from '@khydrian-drift/common/creature'
import { Expressions, ExpressionVariable } from '@khydrian-drift/util/expression'

export namespace CharacterProperties {
  export const Agility: ExpressionVariable<number> = Expressions.variable('Agility')
  export const Presence: ExpressionVariable<number> = Expressions.variable('Presence')

  export const VitalityPool: ExpressionVariable<number> = Expressions.variable('VitalityPool')
  export const VitalityPoints: ExpressionVariable<number> = Expressions.variable('VitalityPoints')
}

export enum Attribute {
  BRAWN = 'Brawn',
  AGILITY = 'Agility',
  WILLPOWER = 'Willpower',
  INTELLIGENCE = 'Intelligence',
  PRESENCE = 'Presence',
}

export type CharacterAttributes = {
  brawn: number
  agility: number
  willpower: number
  intelligence: number
  presence: number
}

export type CharacterOptions = {
  name: string
  level: number
  class: ClassReference
  attributes: CharacterAttributes
  traits: Array<TraitReference>
}

export type CharacterDefinition = CharacterOptions &
  CreatureDefinition & {
    hitDiceMaximum: number
  }

export type CharacterState = {
  vitalityPoints: number
  soakPoints: number
}

export const buildCharacterDefinition = (options: CharacterOptions): CharacterDefinition => {
  const vitalityPool = calculateVitalityPool(options)
  const soakRating = calculateSoakRating(options)
  const movementSpeed = calculateMovementSpeed(options)
  const hitDiceMaximum = calculateHitDiceMaximum(options)
  const initiative = calculateInitiative(options)

  return {
    ...options,
    vitalityPool,
    soakRating,
    movementSpeed,
    hitDiceMaximum,
    initiative,
  }
}

const calculateVitalityPool = (options: CharacterOptions): number => {
  const BASE_VITALITY = 10
  const clazz = Classes.getClass(options.class)
  const vitalityIncrement = clazz.vitalityIncrement
  const vitalityPool = BASE_VITALITY + options.level * vitalityIncrement
  return vitalityPool
}

const calculateSoakRating = (options: CharacterOptions): number => {
  const BASE_SOAK = 0
  const soakRating = BASE_SOAK + options.attributes.brawn
  return soakRating
}

const calculateMovementSpeed = (options: CharacterOptions): number => {
  const BASE_MOVEMENT_SPEED = 4
  options.traits
  const movementSpeed = BASE_MOVEMENT_SPEED
  return movementSpeed
}

const calculateHitDiceMaximum = (options: CharacterOptions): number => {
  // JOHN
  return 1
}

const calculateInitiative = (options: CharacterOptions): number => {
  const BASE_INITIATIVE = 0
  const initiative = BASE_INITIATIVE + options.attributes.agility
  return initiative
}
