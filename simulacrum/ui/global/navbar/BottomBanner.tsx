'use client'

import React, { useRef, useState } from 'react'
import { Box, Container, Popper, Stack, Typography } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { NavbarTileSquareImage } from '@simulacrum/ui/global/navbar/NavbarTiles'

type BottomBannerContent = {
  label: string
  content: React.JSX.Element
}

export const BottomBanner = () => {
  const container = useRef<HTMLDivElement>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const toggleMenu = (menu: string) => {
    if (activeMenu === menu) {
      setActiveMenu(null)
    } else {
      setActiveMenu(menu)
    }
  }

  const closeMenu = () => {
    setActiveMenu(null)
  }

  const content: Array<BottomBannerContent> = [
    {
      label: 'Collections',
      content: (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box
            sx={{
              bgcolor: 'grey.800',
              p: 2,
              borderRadius: 2,
              flex: 1,
            }}
          >
            <Typography
              variant="body2"
              color="white"
            >
              My Characters
            </Typography>
            <Typography
              variant="body2"
              color="white"
            >
              My Campaigns
            </Typography>
            <Typography
              variant="body2"
              color="white"
            >
              My Encounters
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: 'grey.800',
              p: 2,
              borderRadius: 2,
              flex: 1,
            }}
          >
            <Typography
              variant="body2"
              color="white"
            >
              My Homebrew Creations
            </Typography>
            <Typography
              variant="body2"
              color="white"
            >
              My Dice
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      label: 'Tools',
      content: <ToolsDropdown />,
    },
  ]

  return (
    <Box
      sx={{ bgcolor: 'grey.900', color: 'grey.300' }}
      ref={container}
    >
      <Container maxWidth="lg">
        <Stack direction="row">
          {content.map((item) => (
            <Box
              key={item.label}
              onMouseEnter={() => toggleMenu(item.label)}
              onMouseLeave={closeMenu}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  py: 2,
                  px: 3,
                  transition: 'background-color 0.3s, color 0.3s',
                  '&:hover': {
                    bgcolor: 'grey.800',
                    color: 'white',
                  },
                }}
                onMouseDownCapture={() => toggleMenu(item.label)}
              >
                <Typography variant="body2">{item.label}</Typography>
                <KeyboardArrowDownIcon fontSize="small" />
              </Box>

              <Popper
                open={activeMenu === item.label}
                anchorEl={container.current}
              >
                <Box
                  sx={{
                    bgcolor: 'grey.800',
                    p: 1,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    width: '100vw', // Span the full viewport width
                  }}
                >
                  <Container maxWidth="lg">{item.content}</Container>
                </Box>
              </Popper>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  )
}

const ToolsDropdown = () => {
  return (
    <Stack
      direction="row"
      spacing={1}
    >
      <NavbarTileSquareImage
        label="Character Builder"
        href="/characters/builder"
        image="/assets/character-builder.webp"
      />
      <NavbarTileSquareImage
        label="Character Builder"
        href="/characters/builder"
        image="/assets/character-builder.webp"
      />
      <NavbarTileSquareImage
        label="Character Builder"
        href="/characters/builder"
        image="/assets/character-builder.webp"
      />
      <NavbarTileSquareImage
        label="Character Builder"
        href="/characters/builder"
        image="/assets/character-builder.webp"
      />
    </Stack>
  )
}
