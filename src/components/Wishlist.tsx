import React, { useState, useEffect } from 'react';
import { useAuth, getAuthToken } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Product } from '../data/products';

interface WishlistProps {
  onClose: () => void;
  products: Product[];
  onAddToCart: (id: string) => void;
  onWishlistChange?: (delta: number) => void;
}

interface WishlistItem {
  product_id: string;
  created_at: string;
}

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export default function Wishlist({ onClose, products, onAddToCart, onWishlistChange }: WishlistProps) {
  const { isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentLang = i18n.language as 'en' | 'hi' | 'mr';

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch wishlist');
      }

      setWishlistItems(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove from wishlist');
      }

      // Update local state
      setWishlistItems(items => items.filter(item => item.product_id !== productId));
      onWishlistChange?.(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    }
  };

  const handleAddToCart = (productId: string) => {
    onAddToCart(productId);
    removeFromWishlist(productId);
  };

  const wishlistProducts = wishlistItems
    .map(item => products.find(p => p.id === item.product_id))
    .filter((p): p is Product => p !== undefined);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wishlist-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        
        <h2 className="modal-title">{t('wishlist.title', 'My Wishlist')}</h2>
        
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-spinner">
            <p>{t('wishlist.loading', 'Loading wishlist...')}</p>
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="empty-state">
            <p>{t('wishlist.empty', 'Your wishlist is empty')}</p>
            <button className="btn btn-primary" onClick={onClose}>
              {t('wishlist.continueShopping', 'Continue Shopping')}
            </button>
          </div>
        ) : (
          <div className="wishlist-items">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="wishlist-item">
                <img 
                  src={product.image || 'https://via.placeholder.com/100'} 
                  alt={product.name[currentLang] || product.name.en} 
                  className="wishlist-item-image" 
                />
                
                <div className="wishlist-item-details">
                  <h3>{product.name[currentLang] || product.name.en}</h3>
                  <p className="price">₹{product.price.toLocaleString('en-IN')}</p>
                </div>

                <div className="wishlist-item-actions">
                  <button
                    className="wishlist-icon-btn wishlist-icon-add"
                    onClick={() => handleAddToCart(product.id)}
                    title={t('wishlist.addToCart', 'Add to Cart')}
                    aria-label={t('wishlist.addToCart', 'Add to Cart')}
                  >
                    🛒
                  </button>
                  <button
                    className="wishlist-icon-btn wishlist-icon-remove"
                    onClick={() => removeFromWishlist(product.id)}
                    title={t('wishlist.remove', 'Remove')}
                    aria-label={t('wishlist.remove', 'Remove')}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Export helper function to add to wishlist
export async function addToWishlist(productId: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please login to add items to wishlist');
  }

  const response = await fetch(`${API_URL}/api/wishlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id: productId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to add to wishlist');
  }
}
