import { TaggedType } from '@bessemer/cornerstone/types'
import Zod, { ZodType } from 'zod'

export type MimeLiteral = TaggedType<string, 'MimeType'>
export const MimeTypeSchema: ZodType<MimeLiteral> = Zod.string().regex(/^[\w-]+\/[\w.+-]+$/, 'Invalid MIME type format') as any

export const of = (mimeType: string): MimeLiteral => {
  return mimeType as MimeLiteral
}

export const fromString = (mimeType: string): MimeLiteral => {
  return MimeTypeSchema.parse(mimeType)
}

// Images
export const Jpeg = of('image/jpeg')
export const Png = of('image/png')
export const Gif = of('image/gif')
export const Webp = of('image/webp')
export const Svg = of('image/svg+xml')
export const Ico = of('image/x-icon')
export const Avif = of('image/avif')

// Video
export const Mp4 = of('video/mp4')
export const Webm = of('video/webm')
export const OggVideo = of('video/ogg')

// Audio
export const Mp3 = of('audio/mpeg')
export const OggAudio = of('audio/ogg')
export const Wav = of('audio/wav')

// Documents
export const Pdf = of('application/pdf')
export const Json = of('application/json')
export const Csv = of('text/csv')
export const PlainText = of('text/plain')
export const Html = of('text/html')
export const Xml = of('application/xml')

// Fonts
export const Woff = of('font/woff')
export const Woff2 = of('font/woff2')
export const Ttf = of('font/ttf')
export const Otf = of('font/otf')

// Zip
export const Zip = of('application/zip')
export const Gzip = of('application/gzip')
export const Tar = of('application/x-tar')
export const Brotli = of('application/x-brotli')

// Misc
export const FormData = of('multipart/form-data')
export const Javascript = of('application/javascript')
export const OctetStream = of('application/octet-stream')
