import {getConfig} from './lib/config.mjs'
import {createSanityWriteClient, publishAllDraftEvents} from './lib/sanity.mjs'

async function main() {
  const config = getConfig()
  const sanityClient = createSanityWriteClient(config.sanity)
  const count = await publishAllDraftEvents(sanityClient)
  console.log(`Published ${count} Tickster event drafts.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
