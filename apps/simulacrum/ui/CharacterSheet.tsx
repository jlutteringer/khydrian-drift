import React, { useState } from 'react'
import { Box, Button, Container, Divider, Grid, Paper, Tab, Tabs, Typography } from '@mui/material'
import { styled } from '@mui/system'

// Styled components for stat boxes
const StatBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '8px',
  padding: theme.spacing(2),
  textAlign: 'center',
}))

// Main Component
export default function CharacterSheet() {
  const [tabValue, setTabValue] = useState(0)

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 3 }}
    >
      {/* Header Section */}
      <Paper
        elevation={3}
        sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between' }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight="bold"
          >
            Lacitus Torn
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Variant Human Cleric 1 / Wizard 14 • Level 15
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            color="success"
            sx={{ mr: 1 }}
          >
            Short Rest
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ mr: 1 }}
          >
            Long Rest
          </Button>
          <Button variant="outlined">Campaign: The Color of Night</Button>
        </Box>
      </Paper>

      {/* Main Grid */}
      <Grid
        container
        spacing={3}
      >
        {/* Left Column: Stats */}
        <Grid
          item
          xs={12}
          md={4}
        >
          <Paper
            elevation={2}
            sx={{ p: 2 }}
          >
            <Grid
              container
              spacing={1}
            >
              {['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'].map((stat, index) => (
                <Grid
                  item
                  xs={4}
                  key={index}
                >
                  <StatBox>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                    >
                      {['+2', '+0', '+3', '+5', '-1', '-1'][index]}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {stat}
                    </Typography>
                  </StatBox>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Saving Throws */}
          <Paper
            elevation={2}
            sx={{ mt: 2, p: 2 }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
            >
              Saving Throws
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>STR: +2</Typography>
            <Typography>CON: +8</Typography>
            <Typography>INT: +5</Typography>
            <Typography>WIS: -1</Typography>
          </Paper>
        </Grid>

        {/* Center Column: Actions */}
        <Grid
          item
          xs={12}
          md={8}
        >
          <Paper
            elevation={3}
            sx={{ p: 2 }}
          >
            {/* Tabs */}
            <Tabs
              value={tabValue}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Actions" />
              <Tab label="Spells" />
              <Tab label="Inventory" />
              <Tab label="Features & Traits" />
            </Tabs>
            <Divider />

            {/* Tab LoginContent */}
            {tabValue === 0 && (
              <Box mt={2}>
                <Typography variant="h6">Actions</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography>Mace - +7 to hit, 1d6+2 Damage</Typography>
                <Typography>Fire Bolt - +10 to hit, 3d10 Damage</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Section */}
      <Box mt={3}>
        <Paper
          elevation={2}
          sx={{ p: 2 }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
          >
            Armor & Weapons
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography>Armor: Heavy Armor, Medium Armor</Typography>
          <Typography>Weapons: Martial Weapons, Simple Weapons</Typography>
          <Typography>Languages: Abyssal, Celestial, Common</Typography>
        </Paper>
      </Box>
    </Container>
  )
}
