export type ArtItemType = {
  title: string
  year: string
  series?: string
  description?: string
  image: ImageMetadata & {
    alt: string
  }
}
