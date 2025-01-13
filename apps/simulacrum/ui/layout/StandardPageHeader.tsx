import { Box, Typography } from '@mui/material'
import * as React from 'react'
import { ReactNode } from 'react'

export const StandardPageHeader = ({ title, content }: { title: string | ReactNode; content?: ReactNode }) => {
  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'center', sm: 'center' }}
      mb={2}
    >
      <Typography variant="h4">{title}</Typography>
      {content}
    </Box>
  )
}
