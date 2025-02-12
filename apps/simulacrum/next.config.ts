import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript:
    process.env.NODE_ENV === 'production'
      ? {
          tsconfigPath: './tsconfig.build.json',
        }
      : {},

  serverExternalPackages: ['pino'],

  generateBuildId: async () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `${timestamp}-${random}`
  },

  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.mts'],
    }

    return config
  },
}

export default nextConfig
