import { Attributes, Effects, Traits } from '@khydrian-drift/common'
import { TraitFilter, TraitReference } from '@khydrian-drift/common/trait'
import { CreatureDefinition } from '@khydrian-drift/common/creature'
import { ExpressionContext, Expressions, ExpressionVariable, NumericExpressions } from '@khydrian-drift/util/expression'
import { ApplicationContext } from '@khydrian-drift/common/context'
import { Attribute, AttributeValue } from '@khydrian-drift/common/attribute'
import { Arrays } from '@khydrian-drift/util'
import { Effect, GainTraitEffect } from '@khydrian-drift/common/effect'
import { Reference } from '@khydrian-drift/util/reference'

export namespace CharacterOptions {
  export const Level: ExpressionVariable<number> = Expressions.variable('Level')
  export const Traits: ExpressionVariable<Array<TraitReference>> = Expressions.variable('Traits')

  export const BaseBrawn: ExpressionVariable<number> = Expressions.variable('BaseBrawn')
  export const BaseAgility: ExpressionVariable<number> = Expressions.variable('BaseAgility')
  export const BaseWillpower: ExpressionVariable<number> = Expressions.variable('BaseWillpower')
  export const BaseIntelligence: ExpressionVariable<number> = Expressions.variable('BaseIntelligence')
  export const BasePresence: ExpressionVariable<number> = Expressions.variable('BasePresence')

  // JOHN this is not an option
  export const VitalityPoints: ExpressionVariable<number> = Expressions.variable('VitalityPoints')
}

export type CharacterOptions = {
  name: string
  level: number
  baseAttributes: {
    brawn: number
    agility: number
    willpower: number
    intelligence: number
    presence: number
  }
  selections: Array<TraitSelection>
}

export namespace CharacterAttributes {
  export const Brawn: Attribute<number> = Attributes.defineAttribute('cd954aa9-76f1-4e39-8f74-908cadf242fa', {
    name: 'Brawn',
    base: CharacterOptions.BaseBrawn,
    reducer: Expressions.reference(NumericExpressions.sum([])),
  })

  export const Agility: Attribute<number> = Attributes.defineAttribute('fcabfd7d-94b0-464b-ad6e-026c4f759fc3', {
    name: 'Agility',
    base: CharacterOptions.BaseAgility,
    reducer: Expressions.reference(NumericExpressions.sum([])),
  })

  export const Willpower: Attribute<number> = Attributes.defineAttribute('0b220937-9963-4dca-b79f-64c7b744fe93', {
    name: 'Willpower',
    base: CharacterOptions.BaseWillpower,
    reducer: Expressions.reference(NumericExpressions.sum([])),
  })

  export const Intelligence: Attribute<number> = Attributes.defineAttribute('8542fc4d-3cb8-4bf2-8a4d-910e03ecbba4', {
    name: 'Intelligence',
    base: CharacterOptions.BaseIntelligence,
    reducer: Expressions.reference(NumericExpressions.sum([])),
  })

  export const Presence: Attribute<number> = Attributes.defineAttribute('90d88f39-3ec0-425d-8ebf-fa931eb8325b', {
    name: 'Presence',
    base: CharacterOptions.BasePresence,
    reducer: Expressions.reference(NumericExpressions.sum([])),
  })

  export const VitalityPool: Attribute<number> = Attributes.defineAttribute('d907a3f7-cebf-4da0-8ec1-f07b0590d354', {
    name: 'Vitality Pool',
    base: NumericExpressions.sum([10, NumericExpressions.multiply([CharacterOptions.Level, 2])]),
    reducer: Expressions.reference(NumericExpressions.sum([])),
  })

  export const SoakRating: Attribute<number> = Attributes.defineAttribute('7266c938-594a-43c7-a130-cb4c8d295d06', {
    name: 'Soak Rating',
    base: NumericExpressions.floor(Brawn.variable, 0),
    reducer: Expressions.reference(NumericExpressions.sum([])),
  })

  export const Initiative: Attribute<number> = Attributes.defineAttribute('6a142a56-08e2-4624-b716-6accd51846db', {
    name: 'Initiative',
    base: Agility.variable,
    reducer: Expressions.reference(NumericExpressions.sum([])),
  })

  export const MovementSpeed: Attribute<number> = Attributes.defineAttribute('04f7a8c0-df43-441d-8936-4c22c56808d4', {
    name: 'Movement Speed',
    base: 4,
    reducer: Expressions.reference(NumericExpressions.sum([])),
  })
}

export type CharacterAttributes = {
  brawn: AttributeValue<number>
  agility: AttributeValue<number>
  willpower: AttributeValue<number>
  intelligence: AttributeValue<number>
  presence: AttributeValue<number>
}

export type CharacterDefinition = CharacterOptions &
  CreatureDefinition & {
    level: number
    attributes: CharacterAttributes
    traits: Array<TraitReference>
    options: Array<TraitOption>
  }

export type CharacterState = CharacterDefinition & {
  vitalityPoints: number
  soakPoints: number
}

export type TraitOptionReference = Reference<'TraitOption'>

export type TraitOption = {
  id: string
  filter: TraitFilter
  character: CharacterOptions
}

export type TraitSelection = {
  trait: TraitReference
  option: TraitOptionReference
}

export const buildExpressionContext = (character: CharacterState): ExpressionContext => {
  const variables: Record<string, unknown> = {
    ...Expressions.buildVariable(CharacterOptions.Level, character.level),
    ...Expressions.buildVariable(CharacterOptions.Traits, character.traits),

    ...Expressions.buildVariable(CharacterOptions.BaseBrawn, character.baseAttributes.brawn),
    ...Expressions.buildVariable(CharacterOptions.BaseAgility, character.baseAttributes.agility),
    ...Expressions.buildVariable(CharacterOptions.BaseWillpower, character.baseAttributes.willpower),
    ...Expressions.buildVariable(CharacterOptions.BaseIntelligence, character.baseAttributes.intelligence),
    ...Expressions.buildVariable(CharacterOptions.BasePresence, character.baseAttributes.presence),

    ...Expressions.buildVariable(CharacterAttributes.Brawn.variable, character.attributes.brawn.value),
    ...Expressions.buildVariable(CharacterAttributes.Agility.variable, character.attributes.agility.value),
    ...Expressions.buildVariable(CharacterAttributes.Willpower.variable, character.attributes.willpower.value),
    ...Expressions.buildVariable(CharacterAttributes.Intelligence.variable, character.attributes.intelligence.value),
    ...Expressions.buildVariable(CharacterAttributes.Presence.variable, character.attributes.presence.value),

    ...Expressions.buildVariable(CharacterAttributes.VitalityPool.variable, character.vitalityPool.value),
    ...Expressions.buildVariable(CharacterOptions.VitalityPoints, character.vitalityPoints),
  }

  return { variables }
}

export const buildInitialCharacterState = (options: CharacterOptions): CharacterState => {
  return {
    ...options,
    traits: options.selections.map((it) => it.trait),
    attributes: {
      brawn: Attributes.baseValue(0, CharacterAttributes.Brawn),
      agility: Attributes.baseValue(0, CharacterAttributes.Agility),
      willpower: Attributes.baseValue(0, CharacterAttributes.Willpower),
      intelligence: Attributes.baseValue(0, CharacterAttributes.Intelligence),
      presence: Attributes.baseValue(0, CharacterAttributes.Presence),
    },
    vitalityPool: Attributes.baseValue(0, CharacterAttributes.VitalityPool),
    soakRating: Attributes.baseValue(0, CharacterAttributes.SoakRating),
    movementSpeed: Attributes.baseValue(0, CharacterAttributes.MovementSpeed),
    initiative: Attributes.baseValue(0, CharacterAttributes.Initiative),
    vitalityPoints: 0,
    soakPoints: 0,
    options: [],
  }
}

export const buildCharacterDefinition = (options: CharacterOptions, context: ApplicationContext): CharacterDefinition => {
  const characterState = buildInitialCharacterState(options)
  applyAdditionalTraits(characterState, context)
  applyAttributes(characterState, context)
  return characterState
}

const getEffects = (character: CharacterState, context: ApplicationContext): Array<Effect> => {
  const globalEffects = Arrays.range(1, character.level + 1).flatMap((index) => context.ruleset.progressionTable[index] ?? [])
  const traitEffects = Traits.getEffects(Traits.getTraits(character.traits, context))
  return [...globalEffects, ...traitEffects]
}

const applyAdditionalTraits = (character: CharacterState, context: ApplicationContext) => {
  const traits = Traits.getTraits([...character.traits], context)
  const { activeEffects } = Effects.evaluateEffects(getEffects(character, context), Effects.GainTrait, buildExpressionContext(character))

  const noChoiceEffects = activeEffects.filter((it) => it.filter.specificOptions.length === 1)
  character.traits = [...traits.map((it) => it.reference), ...noChoiceEffects.map((it) => Arrays.first(it.filter.specificOptions)!)]

  const choiceEffects = Arrays.difference(activeEffects, noChoiceEffects)
  character.options = choiceEffects.map((it) => buildTraitOption(it, character))
}

const applyAttributes = (character: CharacterState, context: ApplicationContext) => {
  const effects = getEffects(character, context)
  character.attributes.brawn = Effects.evaluateAttribute(CharacterAttributes.Brawn, effects, buildExpressionContext(character))
  character.attributes.agility = Effects.evaluateAttribute(CharacterAttributes.Agility, effects, buildExpressionContext(character))
  character.attributes.willpower = Effects.evaluateAttribute(CharacterAttributes.Willpower, effects, buildExpressionContext(character))
  character.attributes.intelligence = Effects.evaluateAttribute(CharacterAttributes.Intelligence, effects, buildExpressionContext(character))
  character.attributes.presence = Effects.evaluateAttribute(CharacterAttributes.Presence, effects, buildExpressionContext(character))

  character.vitalityPool = Effects.evaluateAttribute(CharacterAttributes.VitalityPool, effects, buildExpressionContext(character))
  character.vitalityPoints = character.vitalityPool.value

  character.soakRating = Effects.evaluateAttribute(CharacterAttributes.SoakRating, effects, buildExpressionContext(character))
  character.initiative = Effects.evaluateAttribute(CharacterAttributes.Initiative, effects, buildExpressionContext(character))
  character.movementSpeed = Effects.evaluateAttribute(CharacterAttributes.MovementSpeed, effects, buildExpressionContext(character))
}

const buildTraitOption = (effect: GainTraitEffect, character: CharacterOptions): TraitOption => {
  return {
    id: '1234',
    filter: effect.filter,
    character,
  }
}
