import { IconButton } from '@mui/material'
import DiscordIcon from '@mui/icons-material/Chat'
import InstagramIcon from '@mui/icons-material/Instagram'
import FacebookIcon from '@mui/icons-material/Facebook'
import YouTubeIcon from '@mui/icons-material/YouTube'
import TikTokIcon from '@mui/icons-material/MusicNote'
import React from 'react'
import RefreshIcon from '@mui/icons-material/Refresh'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/system'
import { Theme } from '@mui/material/styles/createTheme'
import { NavbarUserProfile } from '@simulacrum/ui/navigation/navbar/NavbarUserProfile'
import Link from 'next/link'

export const NavbarMainElements = ({ sx }: { sx?: SxProps<Theme> }) => {
  return (
    <Stack
      direction="row"
      spacing={1}
      divider={
        <Divider
          orientation="vertical"
          sx={{
            bgcolor: 'grey.700',
            height: 35,
            alignSelf: 'center',
          }}
        />
      }
      sx={sx}
    >
      <SocialMediaIcons />
      <SiteIcons />
      <NavbarUserProfile />
    </Stack>
  )
}

export const SocialMediaIcons = () => {
  return (
    <Stack
      direction="row"
      spacing={1}
    >
      <IconButton
        color="inherit"
        component={Link}
        href="https://discord.com/"
        target="_blank"
      >
        <DiscordIcon />
      </IconButton>
      <IconButton
        color="inherit"
        component={Link}
        href="https://www.instagram.com/"
        target="_blank"
      >
        <InstagramIcon />
      </IconButton>
      <IconButton
        color="inherit"
        component={Link}
        href="https://www.facebook.com/"
        target="_blank"
      >
        <FacebookIcon />
      </IconButton>
      <IconButton
        color="inherit"
        component={Link}
        href="https://www.youtube.com/"
        target="_blank"
      >
        <YouTubeIcon />
      </IconButton>
      <IconButton
        color="inherit"
        component={Link}
        href="https://www.tiktok.com/"
        target="_blank"
      >
        <TikTokIcon />
      </IconButton>
    </Stack>
  )
}

export const SiteIcons = () => {
  return (
    <Stack
      direction="row"
      spacing={1}
    >
      <IconButton color="inherit">
        <RefreshIcon />
      </IconButton>
      <IconButton color="inherit">
        <NotificationsIcon />
      </IconButton>
      <IconButton color="inherit">
        <ChatBubbleOutlineIcon />
      </IconButton>
    </Stack>
  )
}
