import { CharacterBuilderState } from '@simulacrum/ui/character/builder/use-character-builder'
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material'
import React from 'react'
import { Objects } from '@bessemer/cornerstone'

export const CharacterOptionPanel = ({ characterBuilder }: { characterBuilder: CharacterBuilderState }) => {
  if (Objects.isNil(characterBuilder.choice)) {
    return <div>No selection</div>
  }

  return (
    <Grid
      container
      spacing={2}
    >
      {characterBuilder.choice.values.map((choiceValue, index) => (
        <Grid
          item
          xs={12}
          sm={6}
          key={index}
        >
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
              >
                {choiceValue.name}
              </Typography>

              {/* Action Buttons */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={2}
              >
                <Box
                  display="flex"
                  gap={1}
                >
                  <Button
                    size="small"
                    variant="outlined"
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                  >
                    Copy
                  </Button>
                </Box>
                <Button
                  size="small"
                  color="error"
                >
                  Delete
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
