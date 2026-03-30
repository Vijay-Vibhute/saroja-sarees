// Hook to fetch products from backend (which proxies Sanity CMS)
import { useState, useEffect } from 'react';
import { Product } from '../data/products';

interface SanityProduct {
  _id: string;
  id: string;
  name: {
    en: string;
    hi?: string;
    mr?: string;
  };
  description?: string;
  price: number;
  category: 'saree' | 'innerwear' | 'accessories';
  image?: {
    asset?: {
      url?: string;
    };
    alt?: string;
  };
  stock?: number;
  featured?: boolean;
}

// Convert Sanity product to local Product type
const convertSanityProduct = (sanityProd: SanityProduct): Product => {
  return {
    id: sanityProd.id,
    name: {
      en: sanityProd.name.en || '',
      hi: sanityProd.name.hi || sanityProd.name.en || '',
      mr: sanityProd.name.mr || sanityProd.name.en || '',
    },
    price: sanityProd.price,
    category: sanityProd.category === 'saree' ? 'sarees' : 'innerwear',
    image: sanityProd.image?.asset?.url,
    desc: sanityProd.description ? {
      en: sanityProd.description,
      hi: sanityProd.description,
      mr: sanityProd.description,
    } : undefined,
    gallery: Array.isArray((sanityProd as any).gallery)
      ? (sanityProd as any).gallery
          .map((item: any) => item?.asset?.url)
          .filter((url: string | undefined): url is string => Boolean(url))
      : undefined,
    videoUrl: (sanityProd as any).video?.asset?.url,
  };
};

export const useSanityProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backendUrl =
    (typeof process !== 'undefined' && process.env.REACT_APP_BACKEND_URL) ||
    'http://localhost:3001';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch products via backend API (avoids browser CORS to Sanity)
        const response = await fetch(`${backendUrl}/api/products`);
        if (!response.ok) {
          throw new Error(`Backend responded with ${response.status}`);
        }

        const json = await response.json();
        const data: SanityProduct[] = json.data || [];

        // Convert Sanity products to local Product format
        const convertedProducts = data.map((prod: SanityProduct) => convertSanityProduct(prod));
        setProducts(convertedProducts);
        
        if (convertedProducts.length > 0) {
          console.log('✅ Using Sanity CMS products:', convertedProducts.length);
        }
      } catch (err) {
        console.error('Error fetching products from Sanity:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

// Function to get image URL from Sanity
export const getSanityImageUrl = (image?: string): string => {
  if (!image) return '/placeholder.jpg';
  return image;
};
