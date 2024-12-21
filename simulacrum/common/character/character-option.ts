import { Trait, TraitFilter, TraitFilterProps, TraitReference } from '@simulacrum/common/trait'
import { ProgressionTables, Traits } from '@simulacrum/common'
import { ProgressionTable } from '@simulacrum/common/progression-table'
import { Referencable, Reference } from '@bessemer/cornerstone/reference'
import { Arrays, Objects, Preconditions, References } from '@bessemer/cornerstone'

export enum CharacterOptionType {
  SelectTrait = 'SelectTrait',
}

export type CharacterOptionReference = Reference<'CharacterOption'>

export type CharacterOptionValue = TraitReference

export type CharacterOption = Referencable<CharacterOptionReference> & {
  type: CharacterOptionType
  traitFilter: TraitFilter
}

export type CharacterChoice = {
  option: CharacterOptionReference
  values: Array<CharacterOptionValue>
}

export type CharacterSelection = {
  option: CharacterOptionReference
  selection: CharacterOptionValue
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

export const buildChoice = (option: CharacterOption, values: Array<CharacterOptionValue>): CharacterChoice => {
  return {
    option: References.getReference(option),
    values,
  }
}

export const buildSelection = (option: CharacterOptionReference | CharacterOption, selection: CharacterOptionValue | Trait): CharacterSelection => {
  return {
    option: References.getReference(option),
    selection: References.getReference(selection),
  }
}

export const hasSelection = (selections: ProgressionTable<CharacterSelection>, option: CharacterOptionReference | CharacterOption): boolean => {
  const matchingSelection = ProgressionTables.getValues(selections).find((it) => References.equals(it.option, References.getReference(option)))
  return Objects.isPresent(matchingSelection)
}

export const isSelected = (
  selections: ProgressionTable<CharacterSelection>,
  option: CharacterOptionReference | CharacterOption,
  selection: CharacterOptionValue | Trait
): boolean => {
  const matchingSelections = ProgressionTables.getValues(selections).filter((it) => References.equals(it.option, References.getReference(option)))
  return Objects.isPresent(matchingSelections.find((it) => References.equals(it.selection, References.getReference(selection))))
}

export const isAllowedValue = (choice: CharacterChoice, optionValue: CharacterOptionValue) => {
  return Arrays.contains(choice.values, optionValue)
}

export const validateSelection = (choices: ProgressionTable<CharacterChoice>, selection: CharacterSelection): number => {
  const entry = ProgressionTables.getEntries(choices).find(([_, choice]) => References.equals(choice.option, selection.option))
  Preconditions.isPresent(entry)

  const [level, choice] = entry
  Preconditions.isTrue(isAllowedValue(choice, selection.selection))

  return level
}
