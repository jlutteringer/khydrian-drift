import { Referencable, Reference } from '@khydrian-drift/util/reference'
import { Trait, TraitFilter, TraitFilterProps, TraitReference } from '@khydrian-drift/common/trait'
import { Arrays, Objects, References } from '@khydrian-drift/util'
import { ProgressionTables, Traits } from '@khydrian-drift/common'
import { ProgressionTable } from '@khydrian-drift/common/progression-table'

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

export const hasSelection = (selections: Array<CharacterSelection>, option: CharacterOptionReference | CharacterOption): boolean => {
  const matchingSelection = selections.find((it) => References.equals(it.option, References.getReference(option)))
  return Objects.isPresent(matchingSelection)
}

export const isSelected = (selections: Array<CharacterSelection>, option: CharacterOptionReference, selection: CharacterOptionValue): boolean => {
  const matchingSelection = selections.find((it) => References.equals(it.option, option))
  if (Objects.isNil(matchingSelection)) {
    return false
  }

  return References.equals(matchingSelection.selection, selection)
}

export const isAllowedValue = (choice: CharacterChoice, optionValue: CharacterOptionValue) => {
  return Arrays.contains(choice.values, optionValue)
}

export const validateSelection = (choices: ProgressionTable<CharacterChoice>, selection: CharacterSelection): number => {
  const entry = ProgressionTables.getEntries(choices).find(([_, choice]) => References.equals(choice.option, selection.option))
  if (Objects.isNil(entry)) {
    // JOHN error handling
    throw new Error('oh noes!')
  }

  const [level, choice] = entry
  if (!isAllowedValue(choice, selection.selection)) {
    // JOHN error handling
    throw new Error('oh noes!')
  }

  return level
}
