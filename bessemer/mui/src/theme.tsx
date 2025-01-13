import NextLink from 'next/link'
import { createTheme } from '@mui/material/styles'

export type MuiTheme = Parameters<typeof createTheme>[0]

// JOHN
const LinkBehaviour = ({ ref, ...props}: any)=> {
  return (
    <NextLink
      ref={ref}
      href={props.href ?? '#'}
      {...props}
    />
  )
}

export const DefaultTheme: MuiTheme = {
  cssVariables: true,
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
  components: {
    MuiLink: {
      defaultProps: {
        // component: LinkBehaviour,
      },
    },
    MuiButtonBase: {
      defaultProps: {
        // LinkComponent: LinkBehaviour,
      },
    },
  },
}
