import { CharacterRecord, CharacterState } from '@simulacrum/common/character/character'
import { CharacterOptions, CharacterProgression, Characters } from '@simulacrum/common/character'
import { ProgressionTable } from '@simulacrum/common/progression-table'
import { CharacterProgressionEntry } from '@simulacrum/common/character/character-progression'
import { use, useMemo, useState } from 'react'
import { ProgressionTables } from '@simulacrum/common'
import { CharacterChoice } from '@simulacrum/common/character/character-option'
import { Objects, Preconditions } from '@bessemer/cornerstone'
import { Expressions } from '@bessemer/cornerstone/expression'
import { ApplicationContext } from '@simulacrum/common/application'
import { Bessemer } from '@bessemer/framework'

export type CharacterBuilderProps = {
  character: CharacterRecord
}

export type CharacterBuilderState = {
  character: CharacterState
  progressionTable: ProgressionTable<CharacterProgressionEntry>
  selectedEntry: CharacterProgressionEntry | null
  selectEntry: (entry: CharacterProgressionEntry) => void
  choice: CharacterChoice | null
}

export const useCharacterBuilder = ({ character }: CharacterBuilderProps): CharacterBuilderState => {
  const application = use(Bessemer.getApplication<ApplicationContext>())
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterRecord>(character)
  const [selectedEntryKey, setSelectedEntryKey] = useState<string | null>(null)

  const characterSheet = useMemo(() => {
    const characterSheet = Characters.buildCharacterDefinition(character, application)
    return characterSheet
  }, [selectedCharacter])

  const progressionTable = useMemo(() => {
    const progressionTable = CharacterProgression.buildProgressionTable(characterSheet, application)
    return progressionTable
  }, [characterSheet])

  const selectedEntry = useMemo(() => {
    const selectedEntry = ProgressionTables.getValues(progressionTable).find((it) => it.key === selectedEntryKey) ?? null
    return selectedEntry
  }, [progressionTable, selectedEntryKey])

  const choice = useMemo(() => {
    if (!Objects.isPresent(selectedEntry)) {
      return null
    }
    Preconditions.isPresent(selectedEntry.option)

    const expressionContext = Characters.buildExpressionContext(characterSheet, application)
    const choice = CharacterOptions.evaluateChoice(
      selectedEntry.option,
      ProgressionTables.getValues(characterSheet.traits),
      Expressions.evaluator(expressionContext),
      application
    )

    return choice
  }, [selectedEntry, characterSheet])

  return {
    character: characterSheet,
    progressionTable,
    selectedEntry,
    selectEntry: (entry) => {
      setSelectedEntryKey(entry.key)
    },
    choice,
  }
}
