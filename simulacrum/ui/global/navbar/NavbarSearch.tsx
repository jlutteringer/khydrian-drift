import { Box, InputBase } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import React from 'react'

export const NavbarSearch = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 1,
        ml: 3,
        flexGrow: 1,
        maxWidth: '400px',
        px: 2,
      }}
    >
      <SearchIcon />
      <InputBase
        placeholder="Search Everything..."
        sx={{ ml: 1, color: 'white', flex: 1 }}
      />
    </Box>
  )
}
