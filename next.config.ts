import type {NextConfig} from 'next'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const rootDirectory = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  turbopack: {
    root: rootDirectory,
  },
}

export default nextConfig
