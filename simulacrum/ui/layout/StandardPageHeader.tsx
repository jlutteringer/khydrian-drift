import { Box, Typography } from '@mui/material'
import { JSX } from 'react'

export const StandardPageHeader = ({ title, content }: { title: string | JSX.Element; content?: JSX.Element }) => {
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
