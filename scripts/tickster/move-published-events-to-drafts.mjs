import {getConfig} from './lib/config.mjs'
import {createSanityWriteClient, movePublishedEventsToDrafts} from './lib/sanity.mjs'

async function main() {
  const config = getConfig()
  const sanityClient = createSanityWriteClient(config.sanity)
  const count = await movePublishedEventsToDrafts(sanityClient)
  console.log(`Moved ${count} published Tickster events to drafts.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
