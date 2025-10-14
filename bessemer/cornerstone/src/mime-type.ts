import { NominalType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

export const Namespace = createNamespace('mime-literal')
export type MimeLiteral = NominalType<string, typeof Namespace>

export const parseString = (value: string): Result<MimeLiteral, ErrorEvent> => {
  if (!/^[\w-]+\/[\w.+-]+$/.test(value)) {
    return failure(invalidValue(value, { namespace: Namespace, message: `Invalid MIME type format.` }))
  }

  return success(value as MimeLiteral)
}

export const fromString = (value: string): MimeLiteral => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)

// Images
export const Jpeg = 'image/jpeg' as MimeLiteral
export const Png = 'image/png' as MimeLiteral
export const Gif = 'image/gif' as MimeLiteral
export const Webp = 'image/webp' as MimeLiteral
export const Svg = 'image/svg+xml' as MimeLiteral
export const Ico = 'image/x-icon' as MimeLiteral
export const Avif = 'image/avif' as MimeLiteral
export const ImageTypes = [Jpeg, Png, Gif, Webp, Svg, Ico, Avif]

// Video
export const Mp4 = 'video/mp4' as MimeLiteral
export const Webm = 'video/webm' as MimeLiteral
export const OggVideo = 'video/ogg' as MimeLiteral
export const VideoTypes = [Mp4, Webm, OggVideo]

// Audio
export const Mp3 = 'audio/mpeg' as MimeLiteral
export const OggAudio = 'audio/ogg' as MimeLiteral
export const Wav = 'audio/wav' as MimeLiteral
export const AudioTypes = [Mp3, OggAudio, Wav]

// Documents
export const Pdf = 'application/pdf' as MimeLiteral
export const Json = 'application/json' as MimeLiteral
export const Csv = 'text/csv' as MimeLiteral
export const PlainText = 'text/plain' as MimeLiteral
export const Html = 'text/html' as MimeLiteral
export const Xml = 'application/xml' as MimeLiteral
export const DocumentTypes = [Pdf, Json, Csv, PlainText, Html, Xml]

// Fonts
export const Woff = 'font/woff' as MimeLiteral
export const Woff2 = 'font/woff2' as MimeLiteral
export const Ttf = 'font/ttf' as MimeLiteral
export const Otf = 'font/otf' as MimeLiteral
export const FontTypes = [Woff, Woff2, Ttf, Otf]

// Compression
export const Zip = 'application/zip' as MimeLiteral
export const Gzip = 'application/gzip' as MimeLiteral
export const Tar = 'application/x-tar' as MimeLiteral
export const Brotli = 'application/x-brotli' as MimeLiteral
export const CompressionTypes = [Zip, Gzip, Tar, Brotli]

// Misc
export const FormData = 'multipart/form-data' as MimeLiteral
export const Javascript = 'application/javascript' as MimeLiteral
export const OctetStream = 'application/octet-stream' as MimeLiteral
