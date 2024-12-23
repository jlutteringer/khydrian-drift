import { CharacterRecord, CharacterState } from '@simulacrum/common/character/character'
import { CharacterProgression, Characters } from '@simulacrum/common/character'
import { useBrowseContext } from '@simulacrum/ui/global/use-context'
import { ProgressionTable } from '@simulacrum/common/progression-table'
import { CharacterProgressionEntry } from '@simulacrum/common/character/character-progression'
import { useState } from 'react'
import { ProgressionTables } from '@simulacrum/common'

export type CharacterBuilderProps = {
  character: CharacterRecord
}

export type CharacterBuilderState = {
  character: CharacterState
  progressionTable: ProgressionTable<CharacterProgressionEntry>
  selectedEntry: CharacterProgressionEntry | null
  selectEntry: (entry: CharacterProgressionEntry) => void
}

export const useCharacterBuilder = ({ character }: CharacterBuilderProps): CharacterBuilderState => {
  const [selectedEntryKey, setSelectedEntryKey] = useState<string | null>(null)

  const context = useBrowseContext()
  const characterSheet = Characters.buildCharacterDefinition(character, context)
  const progressionTable = CharacterProgression.buildProgressionTable(characterSheet, context)
  const selectedEntry = ProgressionTables.getValues(progressionTable).find((it) => it.key === selectedEntryKey) ?? null

  return {
    character: characterSheet,
    progressionTable,
    selectedEntry,
    selectEntry: (entry) => {
      setSelectedEntryKey(entry.key)
    },
  }
}
