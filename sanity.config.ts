import dotenv from 'dotenv'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {deskStructure} from './deskStructure'
import {schemaTypes} from './schemaTypes'

dotenv.config()
dotenv.config({path: '../.env', override: false})

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET

if (!projectId) {
  throw new Error('Missing required environment variable: SANITY_PROJECT_ID')
}

if (!dataset) {
  throw new Error('Missing required environment variable: SANITY_DATASET')
}

export default defineConfig({
  name: 'default',
  title: 'Tickster x Sanity',

  projectId,
  dataset,

  plugins: [structureTool({structure: deskStructure}), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
