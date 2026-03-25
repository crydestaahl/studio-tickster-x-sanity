import {defineArrayMember, defineField, defineType} from 'sanity'

export const homePageType = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      initialValue: 'Home Page',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Kort text ovanför huvudrubriken.',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroLead',
      title: 'Hero Lead',
      type: 'text',
      rows: 4,
      description: 'Kort ingress i välkomstsektionen.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'primaryCta',
      title: 'Primary CTA',
      type: 'object',
      fields: [
        defineField({name: 'label', title: 'Label', type: 'string'}),
        defineField({name: 'href', title: 'Link', type: 'url'}),
      ],
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Secondary CTA',
      type: 'object',
      fields: [
        defineField({name: 'label', title: 'Label', type: 'string'}),
        defineField({name: 'href', title: 'Link', type: 'url'}),
      ],
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
        }),
        defineArrayMember({type: 'image', options: {hotspot: true}}),
      ],
    }),
    defineField({
      name: 'eventsSectionTitle',
      title: 'Events Section Title',
      type: 'string',
      initialValue: 'Kommande event',
    }),
    defineField({
      name: 'eventsSectionLead',
      title: 'Events Section Lead',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'heroTitle',
      subtitle: 'eyebrow',
      media: 'heroImage',
    },
  },
})
