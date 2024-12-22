import { Box, Typography } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

export const NavbarTileSquareImage = ({ label, href, image }: { label: string; href: string; image: string }) => {
  return (
    <Box
      component={Link}
      href={href}
      sx={{
        position: 'relative',
        width: '315px',
        height: '315px',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      <Image
        src={image}
        alt={label}
        layout="fill"
        objectFit="cover"
        style={{ borderRadius: '16px' }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100px',
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h5"
          color="white"
        >
          {label}
        </Typography>
      </Box>
    </Box>
  )
}
