import type { NextConfig } from 'next'

// JOHN
const nextConfig: NextConfig = {
  // transpilePackages: ['@bessemer/cornerstone', '@bessemer/react', '@bessemer/mui', '@bessemer/framework', '@bessemer/core', '@bessemer/foundry'],
  // outputFileTracingRoot: path.join(__dirname, '../../'),
  typescript: (process.env.NODE_ENV === 'production') ? {
    tsconfigPath: './tsconfig.build.json'
  } : {},

  // serverExternalPackages: ['pino'],

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
