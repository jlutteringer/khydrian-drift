import React from 'react'
import { Box, Container, Stack, Typography } from '@mui/material'
import { NotificationBanner } from '@simulacrum/ui/global/navbar/NotificationBanner'
import { MainBanner } from '@simulacrum/ui/global/navbar/MainBanner'

export const Navbar = () => {
  return (
    <Box>
      <NotificationBanner />
      <MainBanner />

      {/* Bottom Menu Links */}
      <Box sx={{ bgcolor: 'grey.900', color: 'grey.300', py: 1 }}>
        <Container maxWidth="lg">
          <Stack
            direction="row"
            spacing={3}
          >
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer' }}
            >
              Collections
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer' }}
            >
              Rules
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer' }}
            >
              Sources
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer' }}
            >
              Tools
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer' }}
            >
              Media
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer' }}
            >
              Forums
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer' }}
            >
              Learn to Play
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer' }}
            >
              Subscribe
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer' }}
            >
              Marketplace
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
