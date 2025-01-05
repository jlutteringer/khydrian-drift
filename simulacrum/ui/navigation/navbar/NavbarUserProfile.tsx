'use client'

import React, { useState } from 'react'
import { Avatar, Box, Divider, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material'
import Logout from '@mui/icons-material/Logout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import Link from 'next/link'

export const NavbarUserProfile = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleMenuOpen = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      {/* Trigger for the Dropdown */}
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
        onClick={handleMenuOpen}
      >
        <Avatar sx={{ bgcolor: 'grey.600', width: 32, height: 32 }}>J</Avatar>
        <Typography
          variant="body2"
          color="inherit"
        >
          John Lutteringer
        </Typography>
      </Box>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              bgcolor: 'grey.900',
              color: 'white',
              minWidth: '200px',
            },
          },
        }}
      >
        <MenuItem
          component={Link}
          href="/account"
        >
          <ListItemIcon
            sx={{
              color: 'inherit',
            }}
          >
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Account
        </MenuItem>

        <Divider sx={{ borderColor: 'grey.700' }} />

        <MenuItem
          component={Link}
          href="/subscription"
        >
          Subscriptions
        </MenuItem>

        <MenuItem
          component={Link}
          href="/campaigns"
        >
          Campaigns
        </MenuItem>
        <MenuItem
          component={Link}
          href="/characters"
        >
          Characters
        </MenuItem>
        <MenuItem
          component={Link}
          href="/homebrew"
        >
          Homebrew
        </MenuItem>

        <Divider sx={{ borderColor: 'grey.700' }} />

        <MenuItem>
          <ListItemIcon
            sx={{
              color: 'inherit',
            }}
          >
            <Logout fontSize="small" />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  )
}
