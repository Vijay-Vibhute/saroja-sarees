import React, { useState, useEffect } from 'react';
import { Product } from '../data/products';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

type Props = { 
  product: Product; 
  onAdd: (id: string) => void; 
  qty: number;
  onUpdateQty: (id: string, qty: number) => void;
  onGoToCart?: () => void;
  onOpenDetails?: (id: string) => void;
  onWishlistChange?: (delta: number) => void;
  onBuyNow?: (id: string) => void;
};

export default function ProductCard({ product, onAdd, qty, onUpdateQty, onGoToCart, onOpenDetails, onWishlistChange, onBuyNow }: Props) {
  const { i18n, t } = useTranslation();
  const { user, token } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const name = product.name[i18n.language as 'en' | 'hi' | 'mr'] || product.name.en;

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  const toggleWishlist = async () => {
    if (!user || !token) {
      alert(t('login_to_wishlist') || 'Please login to add items to wishlist');
      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`${API_URL}/api/wishlist/${product.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          setIsInWishlist(false);
          onWishlistChange?.(-1);
        }
      } else {
        // Add to wishlist
        const response = await fetch(`${API_URL}/api/wishlist`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_id: product.id }),
        });
        if (response.ok) {
          setIsInWishlist(true);
          onWishlistChange?.(1);
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load wishlist status when component mounts or user changes
    if (user && token) {
      const loadWishlistStatus = async () => {
        try {
          const response = await fetch(`${API_URL}/api/wishlist`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            const items = Array.isArray(data.data) ? data.data : [];
            setIsInWishlist(items.some((item: any) => item.product_id === product.id));
          }
        } catch (error) {
          console.error('Error loading wishlist:', error);
        }
      };
      loadWishlistStatus();
    }
  }, [user, token, product.id]);
  
  const descText = product.desc
    ? product.desc[i18n.language as 'en' | 'hi' | 'mr'] || product.desc.en
    : undefined;

  return (
    <div className="card">
      <div className="card-image-container">
        <img
          src={product.image}
          alt={name}
          style={{ cursor: 'pointer' }}
          onClick={() => onOpenDetails?.(product.id)}
        />
        <button
          className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
          onClick={toggleWishlist}
          disabled={isLoading}
          title={isInWishlist ? t('remove_from_wishlist') : t('add_to_wishlist')}
        >
          <span className="heart-icon">♥</span>
          <span className="tooltip-text">
            {isInWishlist ? t('remove_from_wishlist') : t('add_to_wishlist')}
          </span>
        </button>
      </div>
      <div className="card-body">
        <h3>{name}</h3>
        <p className="price">{t('price')}: ₹{product.price}</p>
        {qty > 0 ? (
          <div className="product-actions">
            <button className="btn-go-cart" onClick={onGoToCart}>{t('view_cart')}</button>
            <div className="qty-controls-small">
              <button className="qty-btn-small" onClick={() => onUpdateQty(product.id, qty - 1)}>−</button>
              <span className="qty-display-small">{qty}</span>
              <button className="qty-btn-small" onClick={() => onUpdateQty(product.id, qty + 1)}>+</button>
            </div>
            <button
              type="button"
              className={`inline-wishlist-btn ${isInWishlist ? 'active' : ''}`}
              onClick={toggleWishlist}
              disabled={isLoading}
              title={isInWishlist ? t('remove_from_wishlist') : t('add_to_wishlist')}
            >
              ♥
            </button>
          </div>
        ) : (
          <div className="product-actions">
            <button
              type="button"
              className={`inline-wishlist-btn ${isInWishlist ? 'active' : ''}`}
              onClick={toggleWishlist}
              disabled={isLoading}
              title={isInWishlist ? t('remove_from_wishlist') : t('add_to_wishlist')}
            >
              ♥
            </button>
            <button onClick={() => onAdd(product.id)} className="btn-primary">{t('add_to_cart')}</button>
            <button onClick={() => onBuyNow?.(product.id)} className="btn-secondary-ghost">{t('buy_now', 'Buy Now')}</button>
          </div>
        )}
      </div>

    </div>
  );
}
