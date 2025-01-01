'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Box, InputBase } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { Urls } from '@bessemer/cornerstone'

type NavbarSearchForm = {
  query: string
}

export const NavbarSearch = () => {
  const { register, handleSubmit } = useForm<NavbarSearchForm>()
  const router = useRouter()

  const onSubmit = (data: NavbarSearchForm) => {
    const searchQuery = data.query.trim()

    if (searchQuery) {
      Urls.buildString({ location: { path: '/search', parameters: { q: searchQuery } } })
      // JOHN create url utility finally?
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`) // Navigate to search page
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 1,
        ml: 3,
        flexGrow: 1,
        maxWidth: '400px',
        px: 2,
      }}
    >
      <SearchIcon />
      <InputBase
        placeholder="Search Everything..."
        autoComplete="off"
        sx={{ ml: 1, color: 'white', flex: 1 }}
        {...register('query')}
      />
    </Box>
  )
}
