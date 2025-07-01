export type ImageOrientation = 'landscape' | 'landscape-54' | 'portrait' | 'square'

type ImageData = {
  variant?: ImageOrientation
  src: ImageMetadata | string
  alt: string
}
