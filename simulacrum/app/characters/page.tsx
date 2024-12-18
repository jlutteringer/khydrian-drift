'use client'

import * as React from 'react'
import Divider from '@mui/material/Divider'
import AppAppBar from '@simulacrum/ui/AppAppBar'
import Hero from '@simulacrum/ui/Hero'
import LogoCollection from '@simulacrum/ui/LogoCollection'
import Features from '@simulacrum/ui/Features'
import Testimonials from '@simulacrum/ui/Testimonials'
import Highlights from '@simulacrum/ui/Highlights'
import Pricing from '@simulacrum/ui/Pricing'
import FAQ from '@simulacrum/ui/FAQ'
import Footer from '@simulacrum/ui/Footer'

export default function MarketingPage(props: { disableCustomTheme?: boolean }) {
  return (
    <main>
      <AppAppBar />
      <Hero />
      <div>
        <LogoCollection />
        <Features />
        <Divider />
        <Testimonials />
        <Divider />
        <Highlights />
        <Divider />
        <Pricing />
        <Divider />
        <FAQ />
        <Divider />
        <Footer />
      </div>
    </main>
  )
}
