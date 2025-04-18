import { AppBar, Container, Toolbar } from '@mui/material'
import { NavbarLogo } from '@simulacrum/ui/navigation/navbar/NavbarLogo'
import { NavbarSearch } from '@simulacrum/ui/navigation/navbar/NavbarSearch'
import { NavbarMainElements } from '@simulacrum/ui/navigation/navbar/NavbarMainElements'
import React from 'react'

export const MainBanner = () => {
  return (
    <AppBar
      position="static"
      sx={{ bgcolor: 'black' }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
          <NavbarLogo />
          <NavbarSearch />
          <NavbarMainElements sx={{ marginLeft: 'auto' }} />
        </Toolbar>
      </Container>
    </AppBar>
  )
}
