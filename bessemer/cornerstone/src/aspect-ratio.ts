import Zod from 'zod'
import { greatestCommonFactor } from '@bessemer/cornerstone/math'
import { NominalType } from '@bessemer/cornerstone/types'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

export const Namespace = createNamespace('aspect-ratio')
export type AspectRatio = NominalType<string, typeof Namespace>

export const parseString = (value: string): Result<AspectRatio, ErrorEvent> => {
  if (!/^[1-9]\d*:[1-9]\d*$/.test(value)) {
    return failure(invalidValue(value, { namespace: Namespace, message: `Aspect Ratio must be in the format 'width:height' (e.g., '16:9', '4:3').` }))
  }

  return success(value as AspectRatio)
}

export const from = (value: string): AspectRatio => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)

export const fromDimensions = (width: number, height: number): AspectRatio => {
  const factor = greatestCommonFactor(width, height)
  const ratioWidth = width / factor
  const ratioHeight = height / factor
  return `${ratioWidth}:${ratioHeight}` as AspectRatio
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
