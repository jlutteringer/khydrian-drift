import { Options } from 'tsup'

export type TsUpOptions = Options | Options[] | ((overrideOptions: Options) => Promise<Options | Options[]>)

export const Config:  TsUpOptions = {
  tsconfig: 'tsconfig.build.json',
  entry: ['src'],
  format: ['esm'],
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  external: [/^[^./]|^\.[^./]|^\.\.[^/]/],
}