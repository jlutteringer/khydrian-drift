import type { NextConfig } from 'next'

// JOHN
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

    // config.externals.push({ 'thread-stream': 'commonjs thread-stream' })
    return config
  }
}

export default nextConfig
