import dotenv from 'dotenv'
import {createClient} from '@sanity/client'

dotenv.config()

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

// Server-side Sanity client for backend APIs
export const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '1wmevimt',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2024-01-01',
  useCdn: true,
})

export interface SanityProduct {
  _id: string
  id: string
  name: {
    en: string
    hi?: string
    mr?: string
  }
  description?: string
  price: number
  category: string
  image?: {
    asset?: {
      _id?: string
      url?: string
    }
    alt?: string | null
  }
  gallery?: Array<{
    asset?: {
      _id?: string
      url?: string
    }
  }>
  video?: {
    asset?: {
      _id?: string
      url?: string
    }
  }
  stock?: number
  featured?: boolean
}

export async function fetchSanityProducts(): Promise<SanityProduct[]> {
  const query = `*[_type == "product"]{
    _id,
    id,
    name,
    description,
    price,
    category,
    image{
      asset->{
        _id,
        url
      },
      alt
    },
    gallery[]{
      asset->{
        _id,
        url
      }
    },
    video{
      asset->{
        _id,
        url
      }
    },
    stock,
    featured
  } | order(featured desc, _createdAt desc)`

  return sanityClient.fetch<SanityProduct[]>(query)
}
