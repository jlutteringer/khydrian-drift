import * as React from 'react'
import { Footer } from '@simulacrum/ui/navigation/Footer'
import { Box } from '@mui/material'
import Container from '@mui/material/Container'
import { Navbar } from '@simulacrum/ui/navigation/navbar'

export const StandardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <div>
      <Navbar />
      <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 3 }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>
      <Footer />
    </div>
  )
}
