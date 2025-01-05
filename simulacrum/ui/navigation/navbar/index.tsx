import React from 'react'
import { Box } from '@mui/material'
import { NotificationBanner } from '@simulacrum/ui/navigation/navbar/NotificationBanner'
import { MainBanner } from '@simulacrum/ui/navigation/navbar/MainBanner'
import { BottomBanner } from '@simulacrum/ui/navigation/navbar/BottomBanner'

export const Navbar = () => {
  return (
    <Box>
      <NotificationBanner />
      <MainBanner />
      <BottomBanner />
    </Box>
  )
}
