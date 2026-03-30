import React from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '../data/products';

type CartItem = { id: string; qty: number };

type Props = {
  cartItems: CartItem[];
  products: Product[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
  total: number;
  onContinueShopping: () => void;
  onCheckout: () => void;
};

export default function Cart({
  cartItems,
  products,
  onRemove,
  onUpdateQty,
  total,
  onContinueShopping,
  onCheckout
}: Props) {
  const { t, i18n } = useTranslation();

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>{t('empty_cart')}</h2>
        <button className="btn-primary" onClick={onContinueShopping}>
          ← {t('continue_shopping')}
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2 className="cart-title">{t('cart')}</h2>
      <div className="cart-items">
        {cartItems.map((item) => {
          const product = products.find((p) => p.id === item.id);
          if (!product) return null;
          const name = product.name[i18n.language as 'en' | 'hi' | 'mr'] || product.name.en;
          const itemTotal = product.price * item.qty;

          return (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                <img src={product.image} alt={name} />
              </div>
              <div className="item-details">
                <h3>{name}</h3>
                <p className="item-price">₹{product.price}</p>
              </div>
              <div className="item-quantity">
                <button onClick={() => onUpdateQty(item.id, item.qty - 1)}>−</button>
                <input
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={(e) => onUpdateQty(item.id, parseInt(e.target.value) || 1)}
                />
                <button onClick={() => onUpdateQty(item.id, item.qty + 1)}>+</button>
              </div>
              <div className="item-total">₹{itemTotal}</div>
              <button className="btn-remove" onClick={() => onRemove(item.id)}>
                ✕
              </button>
            </div>
          );
        })}
      </div>
      <div className="cart-summary">
        <div className="summary-row">
          <span>{t('subtotal')}:</span>
          <span>₹{total}</span>
        </div>
        <div className="summary-row">
          <span>{t('shipping')}:</span>
          <span className="free">{t('free')}</span>
        </div>
        <div className="summary-total">
          <span>{t('total')}:</span>
          <span>₹{total}</span>
        </div>
      </div>
      <div className="cart-actions">
        <button className="btn-secondary" onClick={onContinueShopping}>
          ← {t('continue_shopping')}
        </button>
        <button className="btn-checkout" onClick={onCheckout}>{t('checkout')}</button>
      </div>
    </div>
  );
}
