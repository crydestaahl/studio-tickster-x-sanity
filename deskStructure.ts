import type {StructureResolver} from 'sanity/structure'

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Tickster Events')
        .schemaType('ticksterEvent')
        .child(
          S.documentTypeList('ticksterEvent')
            .title('Tickster Events')
            .defaultOrdering([{field: 'startUtc', direction: 'asc'}]),
        ),
      S.listItem()
        .title('Tickster Sync State')
        .child(S.document().schemaType('ticksterSyncState').documentId('tickster-sync-state')),
    ])
