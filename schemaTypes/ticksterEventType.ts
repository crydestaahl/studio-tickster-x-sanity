import {defineArrayMember, defineField, defineType} from 'sanity'

export const ticksterEventType = defineType({
  name: 'ticksterEvent',
  title: 'Tickster Event',
  type: 'document',
  orderings: [
    {
      title: 'Start date, earliest first',
      name: 'startUtcAsc',
      by: [{field: 'startUtc', direction: 'asc'}],
    },
    {
      title: 'Updated, newest first',
      name: 'lastUpdatedDesc',
      by: [{field: 'lastUpdatedUtc', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      startUtc: 'startUtc',
      venue: 'venue.name',
      media: 'eventImage',
    },
    prepare({title, startUtc, venue, media}) {
      const dateLabel = startUtc ? new Date(startUtc).toLocaleString('sv-SE') : 'No start date'
      return {
        title,
        subtitle: venue ? `${dateLabel} - ${venue}` : dateLabel,
        media,
      }
    },
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ticksterEventId',
      title: 'Tickster Event ID',
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'organizerName',
      title: 'Organizer Name',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'organizer',
      title: 'Organizer',
      type: 'object',
      fields: [
        defineField({name: 'id', title: 'ID', type: 'string'}),
        defineField({name: 'name', title: 'Name', type: 'string'}),
        defineField({name: 'website', title: 'Website', type: 'url'}),
        defineField({name: 'email', title: 'Email', type: 'string'}),
        defineField({name: 'country', title: 'Country', type: 'string'}),
      ],
    }),
    defineField({
      name: 'venue',
      title: 'Venue',
      type: 'object',
      fields: [
        defineField({name: 'id', title: 'ID', type: 'string'}),
        defineField({name: 'name', title: 'Name', type: 'string'}),
        defineField({name: 'address', title: 'Address', type: 'string'}),
        defineField({name: 'zipCode', title: 'Zip Code', type: 'string'}),
        defineField({name: 'city', title: 'City', type: 'string'}),
        defineField({name: 'country', title: 'Country', type: 'string'}),
        defineField({
          name: 'geo',
          title: 'Geo',
          type: 'object',
          fields: [
            defineField({name: 'latitude', title: 'Latitude', type: 'number'}),
            defineField({name: 'longitude', title: 'Longitude', type: 'number'}),
          ],
        }),
      ],
    }),
    defineField({name: 'descriptionMarkdown', title: 'Description (Markdown)', type: 'text', rows: 8}),
    defineField({name: 'descriptionHtml', title: 'Description (HTML)', type: 'text', rows: 8}),
    defineField({name: 'startUtc', title: 'Start UTC', type: 'datetime'}),
    defineField({name: 'endUtc', title: 'End UTC', type: 'datetime'}),
    defineField({name: 'doorsOpenUtc', title: 'Doors Open UTC', type: 'datetime'}),
    defineField({name: 'curfewUtc', title: 'Curfew UTC', type: 'datetime'}),
    defineField({name: 'publishStartUtc', title: 'Publish Start UTC', type: 'datetime'}),
    defineField({name: 'publishEndUtc', title: 'Publish End UTC', type: 'datetime'}),
    defineField({name: 'saleStartUtc', title: 'Sale Start UTC', type: 'datetime'}),
    defineField({name: 'saleEndUtc', title: 'Sale End UTC', type: 'datetime'}),
    defineField({name: 'lastUpdatedUtc', title: 'Last Updated UTC', type: 'datetime'}),
    defineField({name: 'state', title: 'State', type: 'string'}),
    defineField({name: 'stockLevel', title: 'Stock Level', type: 'string'}),
    defineField({name: 'ageLimit', title: 'Age Limit', type: 'string'}),
    defineField({name: 'duration', title: 'Duration', type: 'string'}),
    defineField({name: 'accessibilityInfo', title: 'Accessibility Info', type: 'text'}),
    defineField({name: 'eventHierarchyType', title: 'Hierarchy Type', type: 'string'}),
    defineField({name: 'parentEventId', title: 'Parent Event ID', type: 'string'}),
    defineField({name: 'infoUrl', title: 'Info URL', type: 'url'}),
    defineField({name: 'shopUrl', title: 'Shop URL', type: 'url'}),
    defineField({
      name: 'eventImage',
      title: 'Event Image',
      type: 'image',
      options: {hotspot: false},
      readOnly: true,
    }),
    defineField({name: 'imageUrl', title: 'Image URL', type: 'url'}),
    defineField({
      name: 'localizedShopUrls',
      title: 'Localized Shop URLs',
      type: 'object',
      fields: [
        defineField({name: 'sv', title: 'sv', type: 'url'}),
        defineField({name: 'en', title: 'en', type: 'url'}),
        defineField({name: 'nb', title: 'nb', type: 'url'}),
        defineField({name: 'dk', title: 'dk', type: 'url'}),
      ],
    }),
    defineField({
      name: 'performers',
      title: 'Performers',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'spotifyArtists',
      title: 'Spotify Artists',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'name', title: 'Name', type: 'string'}),
            defineField({name: 'id', title: 'Spotify ID', type: 'string'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'webLinks',
      title: 'Web Links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'text', title: 'Text', type: 'string'}),
            defineField({name: 'url', title: 'URL', type: 'url'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'products',
      title: 'Products',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'name', title: 'Name', type: 'string'}),
            defineField({name: 'productType', title: 'Product Type', type: 'string'}),
            defineField({name: 'description', title: 'Description', type: 'text'}),
            defineField({name: 'mainImageUrl', title: 'Main Image URL', type: 'url'}),
            defineField({
              name: 'price',
              title: 'Price',
              type: 'object',
              fields: [
                defineField({name: 'amount', title: 'Amount', type: 'number'}),
                defineField({name: 'currency', title: 'Currency', type: 'string'}),
              ],
            }),
            defineField({
              name: 'variants',
              title: 'Variants',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({name: 'name', title: 'Name', type: 'string'}),
                    defineField({
                      name: 'price',
                      title: 'Price',
                      type: 'object',
                      fields: [
                        defineField({name: 'amount', title: 'Amount', type: 'number'}),
                        defineField({name: 'currency', title: 'Currency', type: 'string'}),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'childEvents',
      title: 'Child Events',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'id', title: 'ID', type: 'string'}),
            defineField({name: 'name', title: 'Name', type: 'string'}),
            defineField({name: 'startUtc', title: 'Start UTC', type: 'datetime'}),
            defineField({name: 'endUtc', title: 'End UTC', type: 'datetime'}),
            defineField({name: 'state', title: 'State', type: 'string'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'isActive',
      title: 'Active Upcoming Event',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'syncSource',
      title: 'Sync Source',
      type: 'string',
      options: {
        list: [
          {title: 'Dump import', value: 'dump'},
          {title: 'Event API update', value: 'event-api'},
        ],
      },
    }),
    defineField({name: 'sourceDumpId', title: 'Source Dump ID', type: 'string', readOnly: true}),
    defineField({name: 'importedAt', title: 'Imported At', type: 'datetime', readOnly: true}),
    defineField({name: 'syncedAt', title: 'Synced At', type: 'datetime', readOnly: true}),
  ],
})
