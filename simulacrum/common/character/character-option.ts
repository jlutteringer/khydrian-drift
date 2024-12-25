import { Trait, TraitFilter, TraitFilterProps, TraitReference } from '@simulacrum/common/trait'
import { ProgressionTables, Traits } from '@simulacrum/common'
import { ProgressionTable } from '@simulacrum/common/progression-table'
import { Referencable, Reference } from '@bessemer/cornerstone/reference'
import { Arrays, Eithers, Objects, Preconditions, References } from '@bessemer/cornerstone'
import { EvaluateExpression } from '@bessemer/cornerstone/expression'
import { ApplicationContext } from '@simulacrum/common/application'

export enum CharacterOptionType {
  SelectTrait = 'SelectTrait',
}

export type CharacterOptionReference = Reference<'CharacterOption'>

export type CharacterOptionValueReference = TraitReference
export type CharacterOptionValue = Trait

export type CharacterOption = Referencable<CharacterOptionReference> & {
  type: CharacterOptionType
  traitFilter: TraitFilter
}

export type CharacterChoice = {
  option: CharacterOptionReference
  values: Array<CharacterOptionValue>
  inactiveValues: Array<CharacterOptionValue>
}

export type CharacterSelection = {
  option: CharacterOptionReference
  selection: CharacterOptionValueReference
}

export type EvaluateCharacterOptionsResult = {
  selections: ProgressionTable<CharacterSelection>
  choices: ProgressionTable<CharacterChoice>
}

export const selectTraitOption = (reference: CharacterOptionReference | string, traitFilter: TraitFilterProps): CharacterOption => {
  return {
    reference: References.reference(reference, 'CharacterOption'),
    type: CharacterOptionType.SelectTrait,
    traitFilter: Traits.filter(traitFilter),
  }
}

export const evaluateChoice = (
  option: CharacterOption,
  selectedTraits: Array<TraitReference>,
  evaluate: EvaluateExpression,
  context: ApplicationContext
): CharacterChoice => {
  let traits = Traits.applyFilter(context.ruleset.traits, option.traitFilter)

  traits = traits.filter((trait) => {
    // Filter out traits we have already selected
    return !Arrays.contains(selectedTraits, trait.reference)
  })

  const [values, inactiveValues] = Arrays.bisect(traits, (trait) => {
    const prerequisitesSatisfied = trait.prerequisites.every(evaluate)
    return prerequisitesSatisfied ? Eithers.left(trait) : Eithers.right(trait)
  })

  return {
    option: References.getReference(option),
    values,
    inactiveValues,
  }
}

export const buildSelection = (option: CharacterOptionReference | CharacterOption, selection: CharacterOptionValue | Trait): CharacterSelection => {
  return {
    option: References.getReference(option),
    selection: References.getReference(selection),
  }
}

export const getSelection = (
  selections: ProgressionTable<CharacterSelection>,
  option: CharacterOptionReference | CharacterOption,
  level: number
): CharacterSelection | null => {
  const selectionArray = selections[level] ?? []
  const matchingSelection = selectionArray.find((it) => References.equals(it.option, References.getReference(option)))
  return matchingSelection ?? null
}

export const hasSelection = (
  selections: ProgressionTable<CharacterSelection>,
  option: CharacterOptionReference | CharacterOption,
  level: number
): boolean => {
  return Objects.isPresent(getSelection(selections, option, level))
}

export const isSelected = (
  selections: ProgressionTable<CharacterSelection>,
  option: CharacterOptionReference | CharacterOption,
  selection: CharacterOptionValue | Trait
): boolean => {
  const matchingSelections = ProgressionTables.getValues(selections).filter((it) => References.equals(it.option, References.getReference(option)))
  return Objects.isPresent(matchingSelections.find((it) => References.equals(it.selection, References.getReference(selection))))
}

export const isAllowedValue = (choice: CharacterChoice, optionValue: CharacterOptionValueReference) => {
  return Arrays.contains(
    choice.values.map((it) => it.reference),
    optionValue
  )
}

export const validateSelection = (choices: ProgressionTable<CharacterChoice>, selection: CharacterSelection): number => {
  const entry = ProgressionTables.getEntries(choices).find(([_, choice]) => References.equals(choice.option, selection.option))
  Preconditions.isPresent(entry)

  const [level, choice] = entry
  Preconditions.isTrue(isAllowedValue(choice, selection.selection))

  return level
}
