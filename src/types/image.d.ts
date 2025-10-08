export type ImageOrientation = 'landscape' | 'landscape-54' | 'portrait' | 'square'

type ImageData = {
  variant?: ImageOrientation
  src: string | ImageMetadata
  alt: string
}
