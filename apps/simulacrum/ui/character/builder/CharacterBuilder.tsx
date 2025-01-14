import Grid from '@mui/material/Grid2'
import * as React from 'react'
import Box from '@mui/material/Box'
import { StandardPageHeader } from '@simulacrum/ui/layout/StandardPageHeader'
import { ContentLabel } from '@bessemer/core/codex/component/ContentLabel'

// TODO
export const CharacterBuilder = () => {
  // const application = use(BessemerNext.getApplication<ApplicationContext>())
  // let character = Characters.buildCharacterDefinition(TestHarness.CommonerLevel3, application)
  // character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter), context)
  // character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectFightingStyle, Archery), context)
  // character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter2), context)
  // character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter3), context)

  // const characterBuilder = useCharacterBuilder({ character })

  return (
    <Box>
      <StandardPageHeader
        title={
          <ContentLabel
            contentKey="character-builder.title"
            defaultValue="Character Builder"
          />
        }
      />

      <Grid
        container
        spacing={2}
      >
        <Grid size={4}>{/*<CharacterBuilderTimeline characterBuilder={characterBuilder} />*/}</Grid>
        <Grid size={8}>{/*<CharacterOptionPanel characterBuilder={characterBuilder} />*/}</Grid>
      </Grid>
    </Box>
  )
}
