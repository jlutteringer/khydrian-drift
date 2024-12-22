import React from 'react'
import { Box } from '@mui/material'
import { NotificationBanner } from '@simulacrum/ui/global/navbar/NotificationBanner'
import { MainBanner } from '@simulacrum/ui/global/navbar/MainBanner'
import { BottomBanner } from '@simulacrum/ui/global/navbar/BottomBanner'

export const Navbar = () => {
  return (
    <Box>
      <NotificationBanner />
      <MainBanner />
      <BottomBanner />
    </Box>
  )
}
