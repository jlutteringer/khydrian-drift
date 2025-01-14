import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: (process.env.NODE_ENV === 'production') ? {
    tsconfigPath: './tsconfig.build.json'
  } : {},

  serverExternalPackages: ['pino'],

  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.mts']
    }

    return config
  }
}

export default nextConfig
