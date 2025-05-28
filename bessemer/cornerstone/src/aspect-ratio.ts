import Zod, { ZodType } from 'zod'
import { greatestCommonFactor } from '@bessemer/cornerstone/math'
import { NominalType } from '@bessemer/cornerstone/types'

export type AspectRatio = NominalType<string, 'AspectRatio'>

export const buildSchema = (fieldName: string = 'Aspect Ratio'): ZodType<AspectRatio> => {
  return Zod.string({
    required_error: `${fieldName} is required`,
  })
    .trim()
    .regex(/^[1-9]\d*:[1-9]\d*$/, `${fieldName} must be in the format 'width:height' (e.g., '16:9', '4:3')`)
}

export const AspectRatioSchema = buildSchema()

export const of = (aspectRatio: string): AspectRatio => {
  return aspectRatio
}

export const fromString = (aspectRatio: string): AspectRatio => {
  return AspectRatioSchema.parse(aspectRatio)
}

export const fromDimensions = (width: number, height: number): AspectRatio => {
  const factor = greatestCommonFactor(width, height)
  const ratioWidth = width / factor
  const ratioHeight = height / factor
  return `${ratioWidth}:${ratioHeight}`
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
