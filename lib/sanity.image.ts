import {createImageUrlBuilder} from '@sanity/image-url'
import {sanityClient} from './sanity.client'

const builder = createImageUrlBuilder(sanityClient)

type ImageSource = Parameters<typeof builder.image>[0]

export function urlForImage(source: ImageSource) {
  return builder.image(source)
}
