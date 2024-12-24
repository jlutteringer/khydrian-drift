import { TestHarness } from '@simulacrum/test/test-harness'
import { Characters } from '@simulacrum/common/character'
import Grid from '@mui/material/Grid2'
import { CharacterBuilderTimeline } from '@simulacrum/ui/character/builder/CharacterBuilderTimeline'
import * as React from 'react'
import { useBrowseContext } from '@simulacrum/ui/common/use-context'
import { useCharacterBuilder } from '@simulacrum/ui/character/builder/use-character-builder'
import { CharacterOptionPanel } from '@simulacrum/ui/character/builder/CharacterOptionPanel'
import Box from '@mui/material/Box'
import { StandardPageHeader } from '@simulacrum/ui/layout/StandardPageHeader'
import { ContentLabelComponents } from '@simulacrum/ui/content'

export const CharacterBuilder = () => {
  const context = useBrowseContext()
  let character = Characters.buildCharacterDefinition(TestHarness.CommonerLevel3, context)
  // character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter), context)
  // character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectFightingStyle, Archery), context)
  // character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter2), context)
  // character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter3), context)

  const characterBuilder = useCharacterBuilder({ character })

  return (
    <Box>
      <StandardPageHeader title={ContentLabelComponents.CharacterBuilderTitle} />

      <Grid
        container
        spacing={2}
      >
        <Grid size={4}>
          <CharacterBuilderTimeline characterBuilder={characterBuilder} />
        </Grid>
        <Grid size={8}>
          <CharacterOptionPanel characterBuilder={characterBuilder} />
        </Grid>
      </Grid>
    </Box>
  )
}
