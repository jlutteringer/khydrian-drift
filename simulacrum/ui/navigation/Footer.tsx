import React from 'react'
import { Box, Button, Container, Divider, Grid, IconButton, Link, Typography } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Android' // Google Play Placeholder
import AppleIcon from '@mui/icons-material/Apple' // App Store Placeholder
import InstagramIcon from '@mui/icons-material/Instagram'
import FacebookIcon from '@mui/icons-material/Facebook'
import YouTubeIcon from '@mui/icons-material/YouTube'
import TwitterIcon from '@mui/icons-material/Twitter'
import DiscordIcon from '@mui/icons-material/Chat'

export const Footer = () => {
  return (
    <Box
      component="footer"
      bgcolor="grey.900"
      color="grey.300"
      pt={2}
      pb={4}
    >
      {/* Top Notification Banner */}
      <Box
        bgcolor="grey.800"
        py={1}
        textAlign="center"
      >
        <Typography
          variant="body2"
          color="grey.300"
        >
          We have updated our{' '}
          <Link
            color="inherit"
            underline="always"
          >
            terms and conditions
          </Link>
          . Click the link to learn more.
          <Button sx={{ color: 'white', ml: 2 }}>Dismiss</Button>
        </Typography>
      </Box>

      {/* Main Footer LoginContent */}
      <Container maxWidth="lg">
        <Box
          textAlign="center"
          mb={2}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color="white"
          >
            D&D BEYOND
          </Typography>
        </Box>

        {/* Footer Links */}
        <Grid
          container
          spacing={3}
          justifyContent="space-between"
        >
          {/* Support Links */}
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              mb={1}
              color="white"
            >
              SUPPORT
            </Typography>
            <Typography variant="body2">
              <Link
                href="#"
                color="inherit"
                display="block"
              >
                Help Portal
              </Link>
              <Link
                href="#"
                color="inherit"
                display="block"
              >
                Support Forum
              </Link>
              <Link
                href="#"
                color="inherit"
                display="block"
              >
                Don't Sell or Share My Info
              </Link>
              <Link
                href="#"
                color="inherit"
                display="block"
              >
                Cookie Settings
              </Link>
            </Typography>
          </Grid>

          {/* About Links */}
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              mb={1}
              color="white"
            >
              ABOUT
            </Typography>
            <Typography variant="body2">
              <Link
                href="#"
                color="inherit"
                display="block"
              >
                Contact Us
              </Link>
              <Link
                href="#"
                color="inherit"
                display="block"
              >
                Careers
              </Link>
              <Link
                href="#"
                color="inherit"
                display="block"
              >
                Wizards of the Coast
              </Link>
            </Typography>
          </Grid>

          {/* Social Media Icons */}
          <Grid
            item
            xs={12}
            sm={12}
            md={3}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              mb={1}
              color="white"
            >
              FIND US ON SOCIAL MEDIA
            </Typography>
            <Box
              display="flex"
              gap={2}
            >
              <IconButton color="inherit">
                <DiscordIcon />
              </IconButton>
              <IconButton color="inherit">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit">
                <YouTubeIcon />
              </IconButton>
              <IconButton color="inherit">
                <TwitterIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* App Download */}
          <Grid
            item
            xs={12}
            sm={12}
            md={3}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              mb={1}
              color="white"
            >
              DOWNLOAD THE D&D BEYOND APP
            </Typography>
            <Box
              display="flex"
              flexDirection="column"
              gap={1}
            >
              <Button
                variant="contained"
                startIcon={<GoogleIcon />}
                color="inherit"
              >
                Google Play
              </Button>
              <Button
                variant="contained"
                startIcon={<AppleIcon />}
                color="inherit"
              >
                App Store
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 3, borderColor: 'grey.700' }} />

        {/* Copyright and Policies */}
        <Box textAlign="center">
          <Typography
            variant="body2"
            color="grey.500"
          >
            © 2017-2024 Wizards of the Coast LLC | All Rights Reserved
          </Typography>
          <Typography
            variant="body2"
            color="grey.500"
            mt={1}
          >
            Dungeons & Dragons, D&D Beyond, and all related logos are trademarks of Wizards of the Coast.
          </Typography>
          <Box mt={1}>
            <Link
              href="#"
              color="inherit"
              sx={{ mx: 1 }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              color="inherit"
              sx={{ mx: 1 }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
