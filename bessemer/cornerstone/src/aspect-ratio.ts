import Zod from 'zod'
import { greatestCommonFactor } from '@bessemer/cornerstone/math'
import { TaggedType } from '@bessemer/cornerstone/types'

export type AspectRatio = TaggedType<string, 'AspectRatio'>

export const of = (aspectRatio: string): AspectRatio => {
  return aspectRatio as AspectRatio
}

export const Schema = Zod.string()
  .trim()
  .regex(/^[1-9]\d*:[1-9]\d*$/, `Aspect Ratio must be in the format 'width:height' (e.g., '16:9', '4:3')`)
  .transform(of)

export const fromString = (aspectRatio: string): AspectRatio => {
  return Schema.parse(aspectRatio)
}

export const fromDimensions = (width: number, height: number): AspectRatio => {
  const factor = greatestCommonFactor(width, height)
  const ratioWidth = width / factor
  const ratioHeight = height / factor
  return of(`${ratioWidth}:${ratioHeight}`)
}

export const numericValue = (aspectRatio: AspectRatio): number => {
  const [width, height] = aspectRatio.split(':').map(Number)
  return width! / height!
}

export const calculateHeight = (width: number, aspectRatio: AspectRatio): number => {
  const ratio = numericValue(aspectRatio)
  return width / ratio
}

export const calculateWidth = (height: number, aspectRatio: AspectRatio): number => {
  const ratio = numericValue(aspectRatio)
  return height * ratio
}
