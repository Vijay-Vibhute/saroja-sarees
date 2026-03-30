/**
 * Sanity Image Asset Type
 */
export interface SanityImageAsset {
  _id: string;
  url: string;
}

/**
 * Sanity Image Type with hotspot
 */
export interface SanityImage {
  asset: SanityImageAsset;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

/**
 * Sanity Slug Type
 */
export interface SanitySlug {
  current: string;
}

/**
 * Product Type matching Sanity schema
 */
export interface Product {
  _id: string;
  title: string;
  slug: SanitySlug;
  price: number;
  description?: string;
  category: 'Saree' | 'Innerwear';
  image?: SanityImage;
}

/**
 * Product with processed image URL for easier use
 */
export interface ProcessedProduct extends Product {
  imageUrl?: string;
}

/**
 * Cart Item Type
 */
export interface CartItem extends ProcessedProduct {
  qty: number;
}

/**
 * Razorpay Order Response
 */
export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

/**
 * Order details for Razorpay
 */
export interface RazorpayOrderData {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: {
    product_id?: string;
    product_title?: string;
    customer_email?: string;
  };
}

/**
 * Checkout Form Data
 */
export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  state: string;
}
