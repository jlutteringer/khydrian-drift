import { defineConfig } from 'tsup'

export default defineConfig({
  tsconfig: 'tsconfig.build.json',
  entry: ['src'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
})
