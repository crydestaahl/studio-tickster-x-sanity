import type {PortableTextBlock} from '@portabletext/types'
import {PortableText, type PortableTextComponents} from '@portabletext/react'
import Image from 'next/image'
import {urlForImage} from '@/lib/sanity.image'

const components: PortableTextComponents = {
  types: {
    image: ({value}) => {
      const src = urlForImage(value).width(1400).height(900).fit('crop').url()

      return (
        <div className="hero-media">
          <Image src={src} alt="" fill sizes="(max-width: 900px) 100vw, 50vw" />
        </div>
      )
    },
  },
}

export function RichText({value}: {value: PortableTextBlock[]}) {
  return <PortableText value={value} components={components} />
}
