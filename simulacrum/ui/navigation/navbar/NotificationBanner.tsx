import { Box, Button, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import React from 'react'

export const NotificationBanner = () => {
  return (
    <Box
      sx={{
        bgcolor: 'primary.light',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        py: 1,
      }}
    >
      <Typography
        variant="body2"
        sx={{ mr: 1 }}
      >
        This is an example of a notification!
      </Typography>
      <Button
        color="inherit"
        size="small"
        sx={{ minWidth: 'auto', padding: 0 }}
      >
        <CloseIcon fontSize="small" />
      </Button>
    </Box>
  )
}
