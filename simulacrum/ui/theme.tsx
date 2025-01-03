'use client'

import { createTheme } from '@mui/material/styles'
import { Objects } from '@bessemer/cornerstone'
import { DefaultTheme, MuiTheme } from '@bessemer/mui/theme'

const theme: MuiTheme = {}

export default createTheme(Objects.merge(DefaultTheme, theme))
