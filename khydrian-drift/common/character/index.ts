import { ClassReference } from '@khydrian-drift/common/class'
import { Attributes, Classes, Effects, Traits } from '@khydrian-drift/common'
import { TraitReference } from '@khydrian-drift/common/trait'
import { CreatureDefinition } from '@khydrian-drift/common/creature'
import { ExpressionContext, Expressions, ExpressionVariable, NumericExpressions } from '@khydrian-drift/util/expression'
import { ApplicationContext } from '@khydrian-drift/common/context'
import { Attribute, AttributeValue } from '@khydrian-drift/common/attribute'

// JOHN the property vs. attribute distinction makes no sense - we need a way to consolidate
export namespace CharacterProperties {
  export const Agility: ExpressionVariable<number> = Expressions.variable('Agility')
  export const Presence: ExpressionVariable<number> = Expressions.variable('Presence')

  export const VitalityPool: ExpressionVariable<number> = Expressions.variable('VitalityPool')
  export const VitalityPoints: ExpressionVariable<number> = Expressions.variable('VitalityPoints')

  export const Classes: ExpressionVariable<Array<string>> = Expressions.variable('Classes')
  export const Traits: ExpressionVariable<Array<string>> = Expressions.variable('Traits')
}

export namespace CharacterAttributes {
  export const MovementSpeed: Attribute<number> = Attributes.defineAttribute('04f7a8c0-df43-441d-8936-4c22c56808d4', {
    name: 'MovementSpeed',
    base: 4,
    // JOHN we need a way to structure expression references just like function references... also this is not being taken into account at all
    reducer: NumericExpressions.sum([]),
  })
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

export const buildExpressionContext = (options: CharacterOptions): ExpressionContext => {
  const variables: Record<string, unknown> = {
    ...Expressions.buildVariable(
      CharacterProperties.Traits,
      options.traits.map((it) => it.id)
    ),
    ...Expressions.buildVariable(CharacterProperties.Agility, options.attributes.agility),
    ...Expressions.buildVariable(CharacterProperties.Presence, options.attributes.presence),
    // JOHN hardcoded values
    ...Expressions.buildVariable(CharacterProperties.VitalityPool, 10),
    ...Expressions.buildVariable(CharacterProperties.VitalityPoints, 10),
  }

  return { variables }
}

export const buildCharacterDefinition = (options: CharacterOptions, context: ApplicationContext): CharacterDefinition => {
  const traits = getAdditionalTraits(options, context)
  options = { ...options, traits }
  const vitalityPool = calculateVitalityPool(options, context)
  const soakRating = calculateSoakRating(options, context)
  const movementSpeed = calculateMovementSpeed(options, context)
  const hitDiceMaximum = calculateHitDiceMaximum(options, context)
  const initiative = calculateInitiative(options, context)

  return {
    ...options,
    vitalityPool,
    soakRating,
    movementSpeed,
    hitDiceMaximum,
    initiative,
  }
}

const getAdditionalTraits = (options: CharacterOptions, context: ApplicationContext): Array<TraitReference> => {
  const clazz = Classes.getClass(options.class, context)
  const traits = Traits.getTraits([...clazz.startingTraits, ...options.traits], context)
  const { activeEffects } = Traits.evaluateEffects(traits, Effects.GainTrait, buildExpressionContext(options))
  return [...traits.map((it) => it.reference), ...activeEffects.map((it) => it.trait)]
}

const calculateVitalityPool = (options: CharacterOptions, context: ApplicationContext): number => {
  const BASE_VITALITY = 10
  const clazz = Classes.getClass(options.class, context)
  const vitalityIncrement = clazz.vitalityIncrement
  const vitalityPool = BASE_VITALITY + options.level * vitalityIncrement
  return vitalityPool
}

const calculateSoakRating = (options: CharacterOptions, context: ApplicationContext): number => {
  const BASE_SOAK = 0
  const soakRating = BASE_SOAK + options.attributes.brawn
  return soakRating
}

const calculateMovementSpeed = (options: CharacterOptions, context: ApplicationContext): AttributeValue<number> => {
  const traits = Traits.getTraits(options.traits, context)
  const expressionContext = buildExpressionContext(options)

  return Effects.evaluateAttribute(
    CharacterAttributes.MovementSpeed,
    traits.flatMap((it) => it.effects),
    expressionContext
  )
}

const calculateHitDiceMaximum = (options: CharacterOptions, context: ApplicationContext): number => {
  // JOHN
  return 1
}

const calculateInitiative = (options: CharacterOptions, context: ApplicationContext): number => {
  const BASE_INITIATIVE = 0
  const initiative = BASE_INITIATIVE + options.attributes.agility
  return initiative
}
