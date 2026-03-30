import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

type Props = { 
  cartCount: number; 
  wishlistCount: number;
  searchQuery: string;
  onLangChange: (lng: string) => void; 
  onCartClick: () => void; 
  onTitleClick: () => void;
  onLoginClick: () => void;
  onProfileClick: () => void;
  onWishlistClick: () => void;
  onOrdersClick: () => void;
  onSearchChange: (q: string) => void;
  onLogoutClick: () => void;
};

export default function Header({ 
  cartCount, 
  wishlistCount,
  searchQuery,
  onLangChange, 
  onCartClick, 
  onTitleClick,
  onLoginClick,
  onProfileClick,
  onWishlistClick,
  onOrdersClick,
  onSearchChange,
  onLogoutClick,
}: Props) {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="brand" onClick={onTitleClick} style={{ cursor: 'pointer' }}>
        <h1 className="brand-title">
          <span className="brand-name">{t('title')}</span>
          <span className="brand-emoji" aria-hidden="true">✨</span>
        </h1>
        <p className="slogan">{t('slogan')}</p>
      </div>
      <div className="header-middle">
        <div className="header-search">
          <input
            type="text"
            placeholder={t('search_placeholder', 'Search products, sarees, styles...')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button type="button" className="header-search-btn">🔍</button>
        </div>
      </div>
      <div className="controls">
        <label className="lang-label">{t('language')}:</label>
        <select
          value={i18n.language}
          onChange={(e) => {
            const lng = e.target.value;
            i18n.changeLanguage(lng);
            onLangChange(lng);
          }}
        >
          <option value="en">English</option>
          <option value="mr">मराठी</option>
          <option value="hi">हिन्दी</option>
        </select>

        {isAuthenticated ? (
          <div className="user-menu">
            <button
              className="icon-btn"
              onClick={onWishlistClick}
              title={t('wishlist', 'Wishlist')}
            >
              ❤️{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
            </button>
            <button
              className="icon-btn"
              onClick={onOrdersClick}
              title={t('orders', 'Orders')}
            >
              📦
            </button>

            <div
              className="user-menu-trigger"
              ref={accountMenuRef}
              onMouseEnter={() => setShowAccountMenu(true)}
              onMouseLeave={() => setShowAccountMenu(false)}
            >
              <button
                className="user-btn"
                type="button"
                onClick={() => setShowAccountMenu((open) => !open)}
              >
                👤 {user?.name}
              </button>
              {showAccountMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-section">
                    <div className="user-dropdown-title">{t('account.yourAccount', 'Your Account')}</div>
                    <button type="button" className="user-dropdown-item" onClick={() => { setShowAccountMenu(false); onProfileClick(); }}>
                      {t('account.profile', 'Profile & Settings')}
                    </button>
                    <button type="button" className="user-dropdown-item" onClick={() => { setShowAccountMenu(false); onWishlistClick(); }}>
                      {t('account.wishlist', 'Your Wishlist')}
                    </button>
                    <button type="button" className="user-dropdown-item" onClick={() => { setShowAccountMenu(false); onOrdersClick(); }}>
                      {t('account.orders', 'Your Orders')}
                    </button>
                  </div>
                  <div className="user-dropdown-section">
                    <button
                      type="button"
                      className="user-dropdown-item user-dropdown-logout"
                      onClick={() => { setShowAccountMenu(false); onLogoutClick(); }}
                    >
                      {t('account.logout', 'Sign out')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button className="login-btn" onClick={onLoginClick}>
            {t('login', 'Login')}
          </button>
        )}

        <button className="cart-btn" onClick={onCartClick}>
          🛒 {t('cart')}: <strong>{cartCount}</strong>
        </button>
      </div>
    </header>
  );
}
