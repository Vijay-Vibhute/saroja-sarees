/**
 * Sanity Schema for Product
 * This file should be placed in: your-sanity-project/schemas/product.ts
 * 
 * To use this in your Sanity Studio:
 * 1. Copy this file to your Sanity project
 * 2. Import it in your schema.ts file
 * 3. Add it to the schemaTypes array
 */

export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Product Title',
      type: 'string',
      description: 'The name of the product (e.g., "Silk Saree - Red")',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly version of the title',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'price',
      title: 'Price (₹)',
      type: 'number',
      description: 'Product price in Indian Rupees',
      validation: (Rule: any) => Rule.required().min(0),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Detailed product description',
      options: {
        rows: 4,
      },
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Product category',
      options: {
        list: [
          { title: 'Saree', value: 'Saree' },
          { title: 'Innerwear', value: 'Innerwear' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Product Image',
      type: 'image',
      description: 'Main product image with hotspot support for responsive cropping',
      options: {
        hotspot: true, // Enable hotspot for better mobile cropping
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      description: 'Additional product images',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
    },
    {
      name: 'stock',
      title: 'Stock Quantity',
      type: 'number',
      description: 'Available stock count',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      description: 'Whether the product is currently available',
      initialValue: true,
    },
    {
      name: 'discount',
      title: 'Discount (%)',
      type: 'number',
      description: 'Discount percentage (optional)',
      validation: (Rule: any) => Rule.min(0).max(100),
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      price: 'price',
      category: 'category',
    },
    prepare(selection: any) {
      const { title, media, price, category } = selection;
      return {
        title,
        media,
        subtitle: `${category} - ₹${price}`,
      };
    },
  },
};
