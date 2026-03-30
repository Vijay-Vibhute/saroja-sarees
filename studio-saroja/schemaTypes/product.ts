import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'Product ID',
      type: 'string',
      description: 'Unique product identifier (e.g., s1, s2, i1)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'object',
      fields: [
        {name: 'en', title: 'English', type: 'string'},
        {name: 'hi', title: 'Hindi (हिंदी)', type: 'string'},
        {name: 'mr', title: 'Marathi (मराठी)', type: 'string'},
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'price',
      title: 'Price (₹)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Sarees', value: 'saree'},
          {title: 'Innerwear', value: 'innerwear'},
          {title: 'Accessories', value: 'accessories'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Product Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      description: 'Additional product images (up to 5)',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (Rule) => Rule.max(5),
    }),
    defineField({
      name: 'video',
      title: 'Product Video',
      type: 'file',
      description: 'Optional product video (at least 10 seconds recommended)',
      options: {
        accept: 'video/*',
      },
    }),
    defineField({
      name: 'stock',
      title: 'Stock Quantity',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'featured',
      title: 'Featured Product',
      type: 'boolean',
      initialValue: false,
      description: 'Show this product first on the homepage',
    }),
  ],
  preview: {
    select: {
      title: 'name.en',
      media: 'image',
      subtitle: 'category',
      price: 'price',
    },
    prepare(selection) {
      const {title, media, subtitle, price} = selection
      return {
        title: title,
        subtitle: `${subtitle} - ₹${price}`,
        media: media,
      }
    },
  },
})
