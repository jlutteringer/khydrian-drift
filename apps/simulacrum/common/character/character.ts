import { TraitReference } from '@simulacrum/common/trait'
import { Effect } from '@simulacrum/common/effect'
import { CharacterChoice, CharacterSelection, EvaluateCharacterOptionsResult } from '@simulacrum/common/character/character-option'
import { CharacterOptions, CharacterProgression } from '@simulacrum/common/character/index'
import { ProgressionTable } from '@simulacrum/common/progression-table'
import { AbilityReference, AbilityState } from '@simulacrum/common/ability'
import { Characteristic, CharacteristicValue } from '@simulacrum/common/characteristic'
import { ResourcePoolState } from '@simulacrum/common/resource-pool'
import { EvaluateExpression, ExpressionContext, Expressions, ExpressionVariable } from '@bessemer/cornerstone/expression'
import { Abilities, Characteristics, Effects, ProgressionTables, ResourcePools } from '@simulacrum/common'
import { Arrays, Assertions, Eithers, Misc, ObjectPaths, Objects, References } from '@bessemer/cornerstone'
import { ApplicationContext } from '@simulacrum/common/application'
import { UnknownRecord } from 'type-fest'

export namespace CharacterValues {
  export const Level: ExpressionVariable<number> = Expressions.variable('Level')
  export const Traits: ExpressionVariable<Array<TraitReference>> = Expressions.variable('Traits')
}

export type CharacterInitialValues = UnknownRecord

export type CharacterRecord = {
  name: string
  level: number
  initialValues: CharacterInitialValues
  selections: ProgressionTable<CharacterSelection>
  selectedAbilities: Array<AbilityReference>
}

export type CharacterSheet = CharacterRecord & {
  characteristics: Record<string, CharacteristicValue<unknown>>
  traits: ProgressionTable<TraitReference>
  choices: ProgressionTable<CharacterChoice>
  abilities: Array<AbilityState>
  resources: Record<string, ResourcePoolState>
}

export type CharacterState = CharacterSheet & {
  // vitalityPoints: number
  // soakPoints: number
}

export const selectOption = (character: CharacterRecord, selection: CharacterSelection, context: ApplicationContext): CharacterSheet => {
  const characterDefinition = buildCharacterDefinition(character, context)

  const level = CharacterOptions.validateSelection(characterDefinition.choices, selection)
  characterDefinition.selections[level]!.push(selection)

  return buildCharacterDefinition(characterDefinition, context)
}

export const buildCharacterDefinition = (character: CharacterRecord, context: ApplicationContext): CharacterSheet => {
  const { selections, choices } = evaluateCharacterOptions(character, context)

  // TODO If the computed selections didn't match up with the character... do some error thing...
  const characterState = buildCharacterState({ ...character, selections: selections }, context)
  characterState.choices = choices
  return characterState
}

const evaluateCharacterOptions = (character: CharacterRecord, context: ApplicationContext): EvaluateCharacterOptionsResult => {
  const response = Misc.doUntilConsistent<EvaluateCharacterOptionsResult>(
    (previous) => {
      let validSelections = previous?.selections ?? ProgressionTables.empty<CharacterSelection>(character.level)

      const characterState = buildCharacterState({ ...character, selections: validSelections }, context)
      const characterChoiceTable = getCharacterChoiceTable(characterState, context)

      const [selections, choices] = ProgressionTables.bisect(characterChoiceTable, (choice, level) => {
        const selection = character.selections[level]!.find((it) => References.equals(it.option, choice.option))

        if (Objects.isPresent(selection) && CharacterOptions.isAllowedValue(choice, selection.selection)) {
          return Eithers.left(selection)
        }

        return Eithers.right(choice)
      })

      validSelections = ProgressionTables.merge(validSelections, selections)
      return { selections: validSelections, choices }
    },
    (first, second) => {
      return ProgressionTables.equalBy(first.choices, second.choices, (it) => it.option)
    }
  )

  return response
}

const getCharacterChoiceTable = (character: CharacterState, context: ApplicationContext): ProgressionTable<CharacterChoice> => {
  const selectedTraits = ProgressionTables.getValues(character.traits)
  const expressionContext = buildExpressionContext(character, context)
  const characterOptionTable = ProgressionTables.mapRows(CharacterProgression.buildEffectsTable(character, context), (effects, level) => {
    const gainCharacterOptionEffects = Effects.filter(effects, Effects.GainCharacterOption)

    return gainCharacterOptionEffects
      .map((it) => it.option)
      .filter((option) => {
        // TODO this logic will not work for options duplicated at the same level
        return !character.selections[level]!.find((it) => References.equals(it.option, option.reference))
      })
  })

  const choiceTable = ProgressionTables.map(characterOptionTable, (option) => {
    return CharacterOptions.evaluateChoice(option, selectedTraits, Expressions.evaluator(expressionContext), context)
  })

  return choiceTable
}

const getAllEffects = (character: CharacterSheet, context: ApplicationContext): Array<Effect> => {
  const progressionEffects = ProgressionTables.getValues(CharacterProgression.buildEffectsTable(character, context))
  const abilityEffects = character.abilities.flatMap((ability) => Abilities.getEffectsForAbility(ability.ability))
  return [...progressionEffects, ...abilityEffects]
}

const buildCharacterState = (character: CharacterRecord, context: ApplicationContext): CharacterState => {
  const result = Misc.doUntilConsistent<CharacterState>(
    (previous) => {
      let characterState
      if (Objects.isNil(previous)) {
        characterState = buildInitialCharacterState(character, context)
        characterState.traits = getCharacterTraits(character, context)
      } else {
        characterState = { ...previous }
      }

      const evaluator = Expressions.evaluator(buildExpressionContext(characterState, context))
      characterState.characteristics = evaluateCharacteristics(characterState, evaluator, context)
      characterState.abilities = evaluateCharacterAbilities(characterState, context)
      characterState.resources = evaluateResourcePools(characterState, evaluator, context)
      return characterState
    },
    (first, second) => {
      return Arrays.equalWith(Object.values(first.characteristics), Object.values(second.characteristics), (first, second) => {
        if (!References.equals(first.characteristic, second.characteristic)) {
          return false
        }

        return first.value === second.value
      })
    }
  )

  return result
}

const buildInitialCharacterState = (character: CharacterRecord, context: ApplicationContext): CharacterState => {
  return {
    ...character,
    characteristics: buildInitialCharacteristics(character, context),
    traits: [],
    choices: ProgressionTables.empty(character.level),
    abilities: [],
    resources: {},
  }
}

// TODO need to consider bonus traits obtained via the GainTrait effect...
const getCharacterTraits = (character: CharacterRecord, context: ApplicationContext): ProgressionTable<TraitReference> => {
  return ProgressionTables.map(character.selections, (it) => it.selection)
}

const buildInitialCharacteristics = (character: CharacterRecord, context: ApplicationContext): Record<string, CharacteristicValue<unknown>> => {
  const characterAttributes = Object.values(context.client.ruleset.playerCharacteristics)

  const characteristicValues = characterAttributes.map((initialCharacteristic) => {
    // TODO we don't support non-numeric characteristics... not sure if we even should...
    const characteristic = initialCharacteristic as Characteristic<number>
    const attributeValue = Characteristics.simpleValue(0, characteristic, character.initialValues)
    return ObjectPaths.applyAnyValue(characteristic.path, {}, attributeValue)
  })

  return Objects.deepMergeAll(characteristicValues) as Record<string, CharacteristicValue<unknown>>
}

const evaluateCharacteristics = (
  character: CharacterState,
  evaluate: EvaluateExpression,
  context: ApplicationContext
): Record<string, CharacteristicValue<unknown>> => {
  const effects = getAllEffects(character, context)
  const characterAttributes = Object.values(context.client.ruleset.playerCharacteristics)

  const characteristicValues = characterAttributes.map((initialCharacteristic) => {
    // TODO we don't support non-numeric characteristics... not sure if we even should...
    const characteristic = initialCharacteristic as Characteristic<number>
    const characteristicValue = Characteristics.evaluateCharacteristic(characteristic, character.initialValues, effects, evaluate)
    return ObjectPaths.applyAnyValue(characteristic.path, {}, characteristicValue)
  })

  return Objects.deepMergeAll(characteristicValues) as Record<string, CharacteristicValue<unknown>>
}

const evaluateCharacterAbilities = (character: CharacterState, context: ApplicationContext): Array<AbilityState> => {
  const gainAbilityEffects = Effects.filter(getAllEffects(character, context), Effects.GainAbility)
  return gainAbilityEffects.map((it) => Abilities.buildInitialState(it.ability, context))
}

const evaluateResourcePools = (
  character: CharacterState,
  evaluate: EvaluateExpression,
  context: ApplicationContext
): Record<string, ResourcePoolState> => {
  const gainResourcePoolEffects = Effects.filter(getAllEffects(character, context), Effects.GainResourcePool)
  return Object.fromEntries(gainResourcePoolEffects.map((it) => ResourcePools.buildInitialState(it.resourcePool, evaluate, context)))
}

export const buildExpressionContext = (character: CharacterState, context: ApplicationContext): ExpressionContext => {
  const characterAttributes = context.client.ruleset.playerCharacteristics
  const attributeVariables = characterAttributes.map((it) => {
    // JOHN excessive casting - work on api
    const characteristic = ObjectPaths.getValue(it.path as any, character.characteristics) as any as CharacteristicValue<unknown>
    Assertions.assertPresent(characteristic)
    return Expressions.buildVariable(it.variable, characteristic.value)
  })

  const variables: UnknownRecord = {
    ...Expressions.buildVariable(CharacterValues.Level, character.level),
    ...Expressions.buildVariable(CharacterValues.Traits, ProgressionTables.getValues(character.traits)),
    ...Objects.deepMergeAll(attributeVariables),
  }

  return { variables }
}
