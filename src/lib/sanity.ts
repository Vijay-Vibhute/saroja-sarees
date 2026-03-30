import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Initialize Sanity client
export const sanityClient = createClient({
  projectId: process.env.REACT_APP_SANITY_PROJECT_ID || '',
  dataset: process.env.REACT_APP_SANITY_DATASET || 'production',
  apiVersion: process.env.REACT_APP_SANITY_API_VERSION || '2024-01-01',
  useCdn: true, // Use CDN for faster responses
  token: undefined, // No token needed for public queries
});

// Image URL builder
export const imageBuilder = imageUrlBuilder(sanityClient);

/**
 * Generate URL for Sanity image asset
 */
export const urlFor = (source: any) => {
  return imageBuilder.image(source).url();
};

/**
 * Fetch all products from Sanity
 */
export const fetchProducts = async () => {
  const query = `
    *[_type == "product"] | order(title asc) {
      _id,
      title,
      slug,
      price,
      description,
      category,
      image {
        asset -> {
          _id,
          url
        },
        hotspot
      }
    }
  `;

  try {
    const products = await sanityClient.fetch(query);
    return products;
  } catch (error) {
    console.error('Error fetching products from Sanity:', error);
    throw error;
  }
};

/**
 * Fetch single product by slug
 */
export const fetchProductBySlug = async (slug: string) => {
  const query = `
    *[_type == "product" && slug.current == "${slug}"][0] {
      _id,
      title,
      slug,
      price,
      description,
      category,
      image {
        asset -> {
          _id,
          url
        },
        hotspot
      }
    }
  `;

  try {
    const product = await sanityClient.fetch(query);
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Fetch products by category
 */
export const fetchProductsByCategory = async (category: string) => {
  const query = `
    *[_type == "product" && category == "${category}"] | order(title asc) {
      _id,
      title,
      slug,
      price,
      description,
      category,
      image {
        asset -> {
          _id,
          url
        },
        hotspot
      }
    }
  `;

  try {
    const products = await sanityClient.fetch(query);
    return products;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};
