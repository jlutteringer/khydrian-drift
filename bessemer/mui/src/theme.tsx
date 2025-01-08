import NextLink from 'next/link'
import { createTheme } from '@mui/material/styles'
import { forwardRef } from 'react'

export type MuiTheme = Parameters<typeof createTheme>[0]

const LinkBehaviour = forwardRef(function LinkBehaviour(props: any, ref) {
  return (
    <NextLink
      ref={ref}
      href={props.href ?? '#'}
      {...props}
    />
  )
})

export const DefaultTheme: MuiTheme = {
  cssVariables: true,
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
  components: {
    MuiLink: {
      defaultProps: {
        component: LinkBehaviour,
      },
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehaviour,
      },
    },
  },
}
