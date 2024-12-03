import { Attributes, Effects, ProgressionTables, Traits } from '@khydrian-drift/common'
import { TraitFilter, TraitReference } from '@khydrian-drift/common/trait'
import { CreatureAttributes } from '@khydrian-drift/common/creature'
import { ExpressionContext, Expressions, ExpressionVariable, NumericExpressions } from '@khydrian-drift/util/expression'
import { ApplicationContext } from '@khydrian-drift/common/context'
import { Attribute, AttributeValue } from '@khydrian-drift/common/attribute'
import { Arrays, Equalitors, Objects, References } from '@khydrian-drift/util'
import { Effect, GainTraitEffect } from '@khydrian-drift/common/effect'

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

// JOHN the naming here is awful...
export type CharacterBlueprint = {
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

export type CharacterAttributes = CreatureAttributes & {
  brawn: AttributeValue<number>
  agility: AttributeValue<number>
  willpower: AttributeValue<number>
  intelligence: AttributeValue<number>
  presence: AttributeValue<number>
}

export type CharacterDefinition = CharacterBlueprint &
  CharacterAttributes & {
    level: number
    traits: Array<TraitReference>
    options: Array<TraitOption>
  }

export type CharacterState = CharacterDefinition & {
  vitalityPoints: number
  soakPoints: number
}

export type TraitOption = {
  id: string
  level: number
  filter: TraitFilter
  traits: Array<TraitReference>
}

export type TraitSelection = {
  id: string
  level: number
  trait: TraitReference
}

export const selectOption = (character: CharacterBlueprint, optionId: string, trait: TraitReference): CharacterBlueprint => {
  // If the option is already selected we can just return the character - no work to be done
  if (character.selections.some((it) => it.id === optionId)) {
    return character
  }
}

export const setCharacterAtLevelUp = (blueprint: CharacterBlueprint, levelUpLevel: number): CharacterBlueprint => {
  return { ...blueprint, selections: blueprint.selections.filter((it) => it.level < levelUpLevel), level: levelUpLevel }
}

export const buildCharacterDefinition = (characterBlueprint: CharacterBlueprint, context: ApplicationContext): CharacterDefinition => {
  console.log('buildCharacterDefinition')
  let currentSelections: Array<TraitSelection> = []
  let currentOptions: Array<TraitOption> = []

  Arrays.range(1, characterBlueprint.level + 1).forEach((level) => {
    const targetBlueprint = setCharacterAtLevelUp(characterBlueprint, level)
    targetBlueprint.selections = [...targetBlueprint.selections, ...currentSelections]

    const { selections, options } = evaluateOptionsAtLevel(targetBlueprint, context)

    console.log('evaluateOptionsAtLevel', level)
    console.log('targetBlueprint', targetBlueprint)
    console.log('selections', selections)
    console.log('options', options)

    currentSelections = [...currentSelections, ...selections]
    currentOptions = [...currentOptions, ...options]
  })

  // JOHN If the computed selections didn't match up with the character... do some error thing...
  const finalBlueprint = { ...characterBlueprint, selections: currentSelections }

  let characterState = buildInitialCharacterState(finalBlueprint)
  Objects.mergeInto(characterState, evaluateCharacterAttributes(characterState, context))
  characterState.options = currentOptions
  return characterState
}

export type EvaluateOptionsResult = {
  selections: Array<TraitSelection>
  options: Array<TraitOption>
}

const evaluateOptionsAtLevel = (characterBlueprint: CharacterBlueprint, context: ApplicationContext): EvaluateOptionsResult => {
  let currentSelections: Array<TraitSelection> = []
  let currentOptions: Array<TraitOption> = []

  let done = false

  do {
    const targetBlueprint = { ...characterBlueprint, selections: [...characterBlueprint.selections, ...currentSelections] }
    const { selections, options } = evaluateOptionsAtLevelInternal(targetBlueprint, context)

    const updatedSelections = Arrays.dedupe([...currentSelections, ...selections])
    const updatedOptions = Arrays.dedupe([...currentOptions, ...options])

    done = Arrays.equal(updatedSelections, currentSelections) && Arrays.equal(updatedOptions, currentOptions)

    currentSelections = updatedSelections
    currentOptions = updatedOptions
  } while (!done)

  return { selections: currentSelections, options: currentOptions }
}

const evaluateOptionsAtLevelInternal = (characterBlueprint: CharacterBlueprint, context: ApplicationContext): EvaluateOptionsResult => {
  let characterState = buildInitialCharacterState(characterBlueprint)
  Objects.mergeInto(characterState, evaluateCharacterAttributes(characterState, context))

  const options = getTraitOptionsAtLevel(characterState, context)
  const immediateOptions = options.filter((it) => it.traits.length === 1)
  const potentiallyDeferredOptions = Arrays.difference(options, immediateOptions)

  let selections: Array<TraitSelection> = immediateOptions.map((it) => buildSelection(it, Arrays.only(it.traits)!))

  const potentiallySelectedOptions = potentiallyDeferredOptions.map<[TraitOption, TraitSelection | undefined]>((option) => {
    const selection = characterBlueprint.selections.find((selection) => selection.id === option.id)
    return [option, selection]
  })

  const selectedOptions = potentiallySelectedOptions.filter(([_, selection]) => Objects.isPresent(selection))
  const deferredOptions = Arrays.differenceWith(potentiallySelectedOptions, selectedOptions, Equalitors.reference()).map(([option, _]) => option)

  selections = [...selections, ...selectedOptions.map(([_, selection]) => selection!)]
  return { selections, options: deferredOptions }
}

const buildOption = (level: number, gainTrait: GainTraitEffect, traits: Array<TraitReference>): TraitOption => {
  return {
    id: gainTrait.id,
    level,
    filter: gainTrait.filter,
    traits,
  }
}

const buildSelection = (option: TraitOption, trait: TraitReference): TraitSelection => {
  return {
    id: option.id,
    level: option.level,
    trait,
  }
}

const getTraitOptionsAtLevel = (character: CharacterState, context: ApplicationContext): Array<TraitOption> => {
  const expressionContext = buildExpressionContext(character)
  const { activeEffects } = Effects.evaluateEffects(getEffectsAtLevel(character, context), Effects.GainTrait, expressionContext)

  const options = activeEffects
    .map((effect) => {
      const initialTraits = Traits.applyFilter(context.ruleset.traits, effect.filter)
      const traits = initialTraits
        .filter((trait) => {
          // Filter out traits we have already selected
          return !Arrays.contains(character.traits, trait.reference)
        })
        .filter((trait) =>
          // Filter out traits whose prerequisites we do not meet
          trait.prerequisites.every((it) => {
            const result = Expressions.evaluate(it, expressionContext)
            return result
          })
        )

      if (Arrays.isEmpty(traits)) {
        return null
      }

      const option: TraitOption = buildOption(character.level, effect, traits.map(References.getReference))
      return option
    })
    .filter((it) => it != null)

  return options
}

const getEffects = (character: CharacterBlueprint, context: ApplicationContext): Array<Effect> => {
  const globalEffects = ProgressionTables.getValuesForLevel(context.ruleset.progressionTable, character.level)
  const traits = Traits.getTraits(
    character.selections.map((it) => it.trait),
    context
  )
  const traitEffects = Traits.getEffects(traits)
  return [...globalEffects, ...traitEffects]
}

const getEffectsAtLevel = (character: CharacterBlueprint, context: ApplicationContext): Array<Effect> => {
  const globalEffects = context.ruleset.progressionTable[character.level]
  const traits = Traits.getTraits(
    character.selections.filter((it) => it.level === character.level).map((it) => it.trait),
    context
  )
  const traitEffects = Traits.getEffects(traits)
  const unfilteredEffects = [...globalEffects, ...traitEffects]
  // JOHN temp code
  return Effects.filter(unfilteredEffects, Effects.GainTrait).filter((effect) => !character.selections.some((it) => it.id === effect.id))
}

const buildInitialCharacterState = (options: CharacterBlueprint): CharacterState => {
  return {
    ...options,
    traits: options.selections.map((it) => it.trait),
    brawn: Attributes.baseValue(0, CharacterAttributes.Brawn),
    agility: Attributes.baseValue(0, CharacterAttributes.Agility),
    willpower: Attributes.baseValue(0, CharacterAttributes.Willpower),
    intelligence: Attributes.baseValue(0, CharacterAttributes.Intelligence),
    presence: Attributes.baseValue(0, CharacterAttributes.Presence),
    vitalityPool: Attributes.baseValue(0, CharacterAttributes.VitalityPool),
    soakRating: Attributes.baseValue(0, CharacterAttributes.SoakRating),
    movementSpeed: Attributes.baseValue(0, CharacterAttributes.MovementSpeed),
    initiative: Attributes.baseValue(0, CharacterAttributes.Initiative),
    vitalityPoints: 0,
    soakPoints: 0,
    options: [],
  }
}

const evaluateCharacterAttributes = (character: CharacterState, context: ApplicationContext): CharacterAttributes => {
  const effects = getEffects(character, context)

  // JOHN we arent setting vitalityPoints...
  // character.vitalityPoints = character.vitalityPool.value

  return {
    brawn: Effects.evaluateAttribute(CharacterAttributes.Brawn, effects, buildExpressionContext(character)),
    agility: Effects.evaluateAttribute(CharacterAttributes.Agility, effects, buildExpressionContext(character)),
    willpower: Effects.evaluateAttribute(CharacterAttributes.Willpower, effects, buildExpressionContext(character)),
    intelligence: Effects.evaluateAttribute(CharacterAttributes.Intelligence, effects, buildExpressionContext(character)),
    presence: Effects.evaluateAttribute(CharacterAttributes.Presence, effects, buildExpressionContext(character)),
    vitalityPool: Effects.evaluateAttribute(CharacterAttributes.VitalityPool, effects, buildExpressionContext(character)),
    soakRating: Effects.evaluateAttribute(CharacterAttributes.SoakRating, effects, buildExpressionContext(character)),
    initiative: Effects.evaluateAttribute(CharacterAttributes.Initiative, effects, buildExpressionContext(character)),
    movementSpeed: Effects.evaluateAttribute(CharacterAttributes.MovementSpeed, effects, buildExpressionContext(character)),
  }
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

    ...Expressions.buildVariable(CharacterAttributes.Brawn.variable, character.brawn.value),
    ...Expressions.buildVariable(CharacterAttributes.Agility.variable, character.agility.value),
    ...Expressions.buildVariable(CharacterAttributes.Willpower.variable, character.willpower.value),
    ...Expressions.buildVariable(CharacterAttributes.Intelligence.variable, character.intelligence.value),
    ...Expressions.buildVariable(CharacterAttributes.Presence.variable, character.presence.value),

    ...Expressions.buildVariable(CharacterAttributes.VitalityPool.variable, character.vitalityPool.value),
    ...Expressions.buildVariable(CharacterOptions.VitalityPoints, character.vitalityPoints),
  }

  return { variables }
}
