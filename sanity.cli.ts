import dotenv from 'dotenv'
import {defineCliConfig} from 'sanity/cli'

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

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  }
})
