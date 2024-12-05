import { Attributes, Effects, ProgressionTables, Traits } from '@khydrian-drift/common'
import { TraitReference } from '@khydrian-drift/common/trait'
import { CreatureAttributes } from '@khydrian-drift/common/creature'
import { ExpressionContext, Expressions, ExpressionVariable, NumericExpressions } from '@khydrian-drift/util/expression'
import { ApplicationContext } from '@khydrian-drift/common/context'
import { Attribute, AttributeValue } from '@khydrian-drift/common/attribute'
import { Arrays, Eithers, Objects, References } from '@khydrian-drift/util'
import { Effect } from '@khydrian-drift/common/effect'
import { CharacterChoice, CharacterSelection, EvaluateCharacterOptionsResult } from '@khydrian-drift/common/character/character-option'
import { CharacterOptions } from '@khydrian-drift/common/character/index'
import { ProgressionTable } from '@khydrian-drift/common/progression-table'

export namespace CharacterValues {
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
  selections: ProgressionTable<CharacterSelection>
}

export namespace CharacterAttributes {
  export const Brawn: Attribute<number> = Attributes.defineAttribute('cd954aa9-76f1-4e39-8f74-908cadf242fa', {
    name: 'Brawn',
    base: CharacterValues.BaseBrawn,
    reducer: Expressions.reference(NumericExpressions.sum([])),
  })

  export const Agility: Attribute<number> = Attributes.defineAttribute('fcabfd7d-94b0-464b-ad6e-026c4f759fc3', {
    name: 'Agility',
    base: CharacterValues.BaseAgility,
    reducer: Expressions.reference(NumericExpressions.sum([])),
  })

  export const Willpower: Attribute<number> = Attributes.defineAttribute('0b220937-9963-4dca-b79f-64c7b744fe93', {
    name: 'Willpower',
    base: CharacterValues.BaseWillpower,
    reducer: Expressions.reference(NumericExpressions.sum([])),
  })

  export const Intelligence: Attribute<number> = Attributes.defineAttribute('8542fc4d-3cb8-4bf2-8a4d-910e03ecbba4', {
    name: 'Intelligence',
    base: CharacterValues.BaseIntelligence,
    reducer: Expressions.reference(NumericExpressions.sum([])),
  })

  export const Presence: Attribute<number> = Attributes.defineAttribute('90d88f39-3ec0-425d-8ebf-fa931eb8325b', {
    name: 'Presence',
    base: CharacterValues.BasePresence,
    reducer: Expressions.reference(NumericExpressions.sum([])),
  })

  export const VitalityPool: Attribute<number> = Attributes.defineAttribute('d907a3f7-cebf-4da0-8ec1-f07b0590d354', {
    name: 'Vitality Pool',
    base: 0,
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
    traits: ProgressionTable<TraitReference>
    choices: ProgressionTable<CharacterChoice>
  }

export type CharacterState = CharacterDefinition & {
  vitalityPoints: number
  soakPoints: number
}

// JOHN this is pretty inefficient...
export const selectOption = (character: CharacterBlueprint, selection: CharacterSelection, context: ApplicationContext): CharacterDefinition => {
  const characterDefinition = buildCharacterDefinition(character, context)

  const level = CharacterOptions.validateSelection(characterDefinition.choices, selection)
  characterDefinition.selections[level].push(selection)

  return buildCharacterDefinition(characterDefinition, context)
}

export const buildCharacterDefinition = (character: CharacterBlueprint, context: ApplicationContext): CharacterDefinition => {
  const { selections, choices } = evaluateCharacterOptions(character, context)

  // JOHN If the computed selections didn't match up with the character... do some error thing...
  const characterState = buildCharacterState({ ...character, selections: selections }, context)
  characterState.choices = choices
  return characterState
}

const evaluateCharacterOptions = (character: CharacterBlueprint, context: ApplicationContext): EvaluateCharacterOptionsResult => {
  let validSelections = ProgressionTables.empty<CharacterSelection>(character.level)
  let currentChoices = ProgressionTables.empty<CharacterChoice>(character.level)

  // JOHN need some limit to the iterations
  let done = false
  let attempts = 0
  do {
    const characterState = buildCharacterState({ ...character, selections: validSelections }, context)
    const characterChoiceTable = getCharacterChoiceTable(characterState, context)

    const [selections, choices] = ProgressionTables.bisect(characterChoiceTable, (choice, level) => {
      const selection = character.selections[level].find((it) => References.equals(it.option, choice.option))

      if (Objects.isPresent(selection) && CharacterOptions.isAllowedValue(choice, selection.selection)) {
        return Eithers.left(selection)
      }

      return Eithers.right(choice)
    })

    validSelections = ProgressionTables.merge(validSelections, selections)
    done = ProgressionTables.equalBy(currentChoices, choices, (it) => it.option)
    currentChoices = choices
    attempts++

    // JOHN
    if (attempts > 10) {
      throw new Error('oh noes')
    }
  } while (!done)

  return { selections: validSelections, choices: currentChoices }
}

const getCharacterChoiceTable = (character: CharacterState, context: ApplicationContext): ProgressionTable<CharacterChoice> => {
  const selectedTraits = ProgressionTables.getValues(character.traits)
  const expressionContext = buildExpressionContext(character)
  const characterOptionTable = ProgressionTables.mapRows(getEffectTable(character, context), (effects, level) => {
    const { activeEffects } = Effects.evaluateEffects(effects, Effects.GainCharacterOption, expressionContext)

    return activeEffects
      .map((it) => it.option)
      .filter((option) => {
        // JOHN this logic will not work for options duplicated at the same level
        return !character.selections[level].find((it) => References.equals(it.option, option.reference))
      })
  })

  const choiceTable = ProgressionTables.map(characterOptionTable, (option) => {
    let traits = Traits.applyFilter(context.ruleset.traits, option.traitFilter)

    traits = traits.filter((trait) => {
      // Filter out traits we have already selected
      return !Arrays.contains(selectedTraits, trait.reference)
    })

    traits = traits.filter((trait) =>
      // Filter out traits whose prerequisites we do not meet
      trait.prerequisites.every((it) => {
        const result = Expressions.evaluate(it, expressionContext)
        return result
      })
    )

    return CharacterOptions.buildChoice(option, traits.map(References.getReference))
  })

  return choiceTable
}

const getEffects = (character: CharacterDefinition, context: ApplicationContext): Array<Effect> => {
  return ProgressionTables.getValues(getEffectTable(character, context))
}

const getEffectTable = (character: CharacterDefinition, context: ApplicationContext): ProgressionTable<Effect> => {
  const globalEffects = ProgressionTables.capAtLevel(context.ruleset.progressionTable, character.level)
  const traitEffects = ProgressionTables.flatMap(character.traits, (reference) => {
    const trait = Traits.getTrait(reference, context)
    return Traits.getEffectsForTrait(trait)
  })

  return ProgressionTables.merge(globalEffects, traitEffects)
}

const buildCharacterState = (character: CharacterBlueprint, context: ApplicationContext) => {
  const characterState = buildInitialCharacterState(character)
  characterState.traits = getCharacterTraits(character, context)
  Objects.mergeInto(characterState, evaluateCharacterAttributes(characterState, context))
  return characterState
}

const buildInitialCharacterState = (character: CharacterBlueprint): CharacterState => {
  return {
    ...character,
    traits: [],
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
    choices: ProgressionTables.empty(character.level),
  }
}

// JOHN need to consider bonus traits obtained via the GainTrait effect...
const getCharacterTraits = (character: CharacterBlueprint, context: ApplicationContext): ProgressionTable<TraitReference> => {
  return ProgressionTables.map(character.selections, (it) => it.selection)
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
    ...Expressions.buildVariable(CharacterValues.Level, character.level),
    ...Expressions.buildVariable(CharacterValues.Traits, ProgressionTables.getValues(character.traits)),

    ...Expressions.buildVariable(CharacterValues.BaseBrawn, character.baseAttributes.brawn),
    ...Expressions.buildVariable(CharacterValues.BaseAgility, character.baseAttributes.agility),
    ...Expressions.buildVariable(CharacterValues.BaseWillpower, character.baseAttributes.willpower),
    ...Expressions.buildVariable(CharacterValues.BaseIntelligence, character.baseAttributes.intelligence),
    ...Expressions.buildVariable(CharacterValues.BasePresence, character.baseAttributes.presence),

    ...Expressions.buildVariable(CharacterAttributes.Brawn.variable, character.brawn.value),
    ...Expressions.buildVariable(CharacterAttributes.Agility.variable, character.agility.value),
    ...Expressions.buildVariable(CharacterAttributes.Willpower.variable, character.willpower.value),
    ...Expressions.buildVariable(CharacterAttributes.Intelligence.variable, character.intelligence.value),
    ...Expressions.buildVariable(CharacterAttributes.Presence.variable, character.presence.value),

    ...Expressions.buildVariable(CharacterAttributes.VitalityPool.variable, character.vitalityPool.value),
    ...Expressions.buildVariable(CharacterValues.VitalityPoints, character.vitalityPoints),
  }

  return { variables }
}
