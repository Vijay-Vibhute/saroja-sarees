import React from 'react';
import { Product } from '../data/products';
import ProductCard from './ProductCard';

type CartItem = { id: string; qty: number };
type Props = { 
  products: Product[]; 
  onAdd: (id: string) => void;
  cart: CartItem[];
  onUpdateQty: (id: string, qty: number) => void;
  onGoToCart?: () => void;
  onOpenDetails?: (id: string) => void;
  onWishlistChange?: (delta: number) => void;
  onBuyNow?: (id: string) => void;
};

export default function ProductList({ products, onAdd, cart, onUpdateQty, onGoToCart, onOpenDetails, onWishlistChange, onBuyNow }: Props) {
  const getQty = (productId: string) => {
    const item = cart.find(c => c.id === productId);
    return item?.qty || 0;
  };

  return (
    <section className="product-grid">
      {products.map((p) => (
        <ProductCard 
          key={p.id} 
          product={p} 
          onAdd={onAdd}
          qty={getQty(p.id)}
          onUpdateQty={onUpdateQty}
          onGoToCart={onGoToCart}
          onOpenDetails={onOpenDetails}
          onWishlistChange={onWishlistChange}
          onBuyNow={onBuyNow}
        />
      ))}
    </section>
  );
}
