import * as React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import { CardActionArea, CardMedia } from '@mui/material'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'

const CharacterBuilderLandingPage = () => {
  const creationMethods = [
    {
      title: 'STANDARD',
      description: 'Create a character using a step-by-step approach.',
      beginnerOption: true,
      buttonLabel: 'Start Building',
      image: 'https://via.placeholder.com/300x200', // Replace with actual image URL
      action: 'SHOW HELP TEXT',
    },
    {
      title: 'PREMADE',
      description: 'Browse a selection of ready-to-play, premade characters and claim one to your account.',
      buttonLabel: 'Start Browsing',
      image: 'https://via.placeholder.com/300x200', // Replace with actual image URL
    },
    {
      title: 'QUICK BUILD',
      description: 'Choose a species and class to quickly create a level 1 character.',
      buttonLabel: 'Start Building',
      image: 'https://via.placeholder.com/300x200', // Replace with actual image URL
    },
    {
      title: 'RANDOM',
      description: 'Roll up a randomized character! You can optionally set some parameters such as level, species, and class.',
      buttonLabel: 'Start Building',
      image: 'https://via.placeholder.com/300x200', // Replace with actual image URL
    },
  ]

  return (
    <div>
      {/* Page Header */}
      <Box
        textAlign="center"
        mb={4}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
        >
          CHARACTER CREATION METHOD
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
        >
          Choose how you would like to create your character
        </Typography>
      </Box>

      {/* Card Grid */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
      >
        {creationMethods.map((method, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={index}
          >
            <Card
              sx={{
                width: '100%',
                maxWidth: '300px', // Fixed width
                height: '420px', // Fixed height
                display: 'flex',
                flexDirection: 'column',
                margin: '0 auto', // Center cards within grid
              }}
            >
              <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Image */}
                <CardMedia
                  component="img"
                  height="140"
                  image={method.image}
                  alt={method.title}
                />

                {/* Content */}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      textTransform="uppercase"
                    >
                      {method.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {method.description}
                    </Typography>

                    {/* Beginner Option */}
                    {method.beginnerOption && (
                      <FormControlLabel
                        control={<Checkbox />}
                        label={
                          <Typography
                            variant="body2"
                            color="primary"
                          >
                            Beginner? {method.action}
                          </Typography>
                        }
                      />
                    )}
                  </Box>

                  <Box mt={2}>
                    <Button
                      variant="contained"
                      fullWidth
                      color="primary"
                      endIcon={<span>&rarr;</span>}
                    >
                      {method.buttonLabel}
                    </Button>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  )
}

export default CharacterBuilderLandingPage
