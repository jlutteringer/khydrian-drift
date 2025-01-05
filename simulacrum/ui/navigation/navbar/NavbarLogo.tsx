import Image from 'next/image'
import React from 'react'

export const NavbarLogo = () => {
  return (
    <Image
      src="/simulacrum-logo-wide-inverted.png"
      alt=""
      width={3000}
      height={500}
      style={{ width: 'auto', height: '35px' }}
    />
  )
}
