import {defineField, defineType} from 'sanity'

export const ticksterSyncStateType = defineType({
  name: 'ticksterSyncState',
  title: 'Tickster Sync State',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Tickster Sync State',
      readOnly: true,
    }),
    defineField({name: 'organizerName', title: 'Organizer Name', type: 'string', readOnly: true}),
    defineField({name: 'organizerId', title: 'Organizer ID', type: 'string', readOnly: true}),
    defineField({name: 'latestDumpId', title: 'Latest Dump ID', type: 'string', readOnly: true}),
    defineField({name: 'latestDumpCreatedAt', title: 'Latest Dump Created At', type: 'datetime', readOnly: true}),
    defineField({name: 'lastFullImportAt', title: 'Last Full Import At', type: 'datetime', readOnly: true}),
    defineField({
      name: 'lastFullImportCount',
      title: 'Last Full Import Count',
      type: 'number',
      readOnly: true,
    }),
    defineField({name: 'lastIncrementalSyncAt', title: 'Last Incremental Sync At', type: 'datetime', readOnly: true}),
    defineField({
      name: 'lastIncrementalSyncCount',
      title: 'Last Incremental Sync Count',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'lastArchivedCount',
      title: 'Last Archived Count',
      type: 'number',
      readOnly: true,
    }),
    defineField({name: 'lastError', title: 'Last Error', type: 'text', readOnly: true}),
  ],
  preview: {
    select: {
      title: 'title',
      organizerName: 'organizerName',
      lastIncrementalSyncAt: 'lastIncrementalSyncAt',
    },
    prepare({title, organizerName, lastIncrementalSyncAt}) {
      return {
        title,
        subtitle: organizerName
          ? `${organizerName} · Last sync ${lastIncrementalSyncAt ?? 'not run yet'}`
          : 'Not configured yet',
      }
    },
  },
})
