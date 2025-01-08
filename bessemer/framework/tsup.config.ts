import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
})
