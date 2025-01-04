// import NextLink from 'next/link'
import { createTheme } from '@mui/material/styles'

export type MuiTheme = Parameters<typeof createTheme>[0]

// JOHN figure out why this config infinitely loops
export const DefaultTheme: MuiTheme = {
  cssVariables: true,
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
  components: {
    MuiLink: {
      defaultProps: {
        // component: NextLink,
      },
    },
    MuiButtonBase: {
      defaultProps: {
        // LinkComponent: NextLink,
      },
    },
  },
}
