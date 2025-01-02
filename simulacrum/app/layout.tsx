import 'server-only'

import type { Metadata } from 'next'
import Head from 'next/head'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { Roboto } from 'next/font/google'
import { ThemeProvider } from '@mui/material/styles'
import theme from '@simulacrum/ui/theme'
import { CssBaseline } from '@mui/material'
import { Bessemer } from '@bessemer/framework'
import { ApplicationContext, ApplicationModule, ApplicationOptions } from '@simulacrum/common/application'
import { TestServerComponent } from '@simulacrum/app/TestServerComponent'
import { ApplicationRuntimeModule } from '@simulacrum/common/application/common'
import { ApplicationProperties } from '@simulacrum/common/application/properties'
import { TestClientComponent } from '@simulacrum/app/TestClientComponent'
import { ClientApplicationProvider } from '@simulacrum/ui/application/use-client-application'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

Bessemer.configure({
  applicationProvider: ApplicationModule,
  runtimeProvider: ApplicationRuntimeModule,
  properties: ApplicationProperties,
})

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const { clientProps } = Bessemer.getInstance<ApplicationContext, ApplicationOptions>()

  return (
    <html lang="en">
      <Head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
        />
      </Head>

      <body className={roboto.variable}>
        <ClientApplicationProvider props={clientProps}>
          <TestClientComponent />
          <TestServerComponent />
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </ClientApplicationProvider>
      </body>
    </html>
  )
}

export default RootLayout
