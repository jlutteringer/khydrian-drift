import React from 'react'
import { Box, Button, Card, CardContent, Grid, IconButton, InputBase, MenuItem, Paper, Select, Typography } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import SearchIcon from '@mui/icons-material/Search'

const characters = [
  { name: "john_lutteringer's Char...", level: 1, campaign: 'Irawulfe' },
  { name: "john_lutteringer's Char...", level: 1, campaign: 'valorgrp' },
  { name: 'Hemmy Fake Character', level: 2, campaign: 'The Color of Night' },
  { name: 'Lacitus Torn', level: 15, campaign: 'The Color of Night' },
  { name: "john_lutteringer's Char...", level: 1, campaign: '' },
]

export const CharacterSection = () => {
  return (
    <div>
      {/* Header Section */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'center', sm: 'center' }}
        mb={2}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          mb={{ xs: 1, sm: 0 }}
        >
          My Characters
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Create a Character
        </Button>
      </Box>

      {/* Slots & Controls */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        gap={2}
        mb={3}
      >
        <Typography>
          Slots:{' '}
          <Box
            component="span"
            sx={{ color: 'primary.main', fontWeight: 'bold' }}
          >
            5/6 Used
          </Box>
        </Typography>
        <Box
          display="flex"
          alignItems="center"
          flexGrow={1}
          gap={2}
          width="100%"
        >
          {/* Search Field */}
          <Paper
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 2,
              py: 1,
              flexGrow: 1,
              maxWidth: { xs: '100%', sm: '60%' },
            }}
            elevation={1}
          >
            <SearchIcon />
            <InputBase
              placeholder="Search by Name, Level, Class, Species, or Campaign"
              fullWidth
            />
          </Paper>

          {/* Sort Dropdown */}
          <Select
            size="small"
            defaultValue="Created: Oldest"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <MenuItem value="Created: Oldest">Created: Oldest</MenuItem>
            <MenuItem value="Created: Newest">Created: Newest</MenuItem>
          </Select>

          {/* Settings Icon */}
          <IconButton>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Character Cards Grid */}
      <Grid
        container
        spacing={2}
      >
        {characters.map((char, index) => (
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
                  {char.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Level {char.level} | Campaign:{' '}
                  <Box
                    component="span"
                    sx={{ color: 'primary.main' }}
                  >
                    {char.campaign}
                  </Box>
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
    </div>
  )
}
