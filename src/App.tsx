import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AdminLogin from './components/AdminLogin';
import AdminProducts from './components/AdminProducts';
import Login from './components/Login';
import Signup from './components/Signup';
import UserProfile from './components/UserProfile';
import Wishlist from './components/Wishlist';
import OrderHistory from './components/OrderHistory';
import SareeHeritage from './components/SareeHeritage';
import { products as defaultProducts, Product } from './data/products';
import { useTranslation } from 'react-i18next';
import { adminAuth } from './utils/adminAuth';
import { useAuth } from './context/AuthContext';
import { useSanityProducts } from './utils/useSanityProducts';
import Toast from './components/Toast';

type CartItem = { id: string; qty: number };
type ProductSourceMode = 'local' | 'sanity' | 'both';

const PRODUCTS_STORAGE_KEY = 'store_products';
const PRODUCT_SOURCE_KEY = 'store_product_source';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSourceMode, setProductSourceMode] = useState<ProductSourceMode>(() => {
    if (typeof window === 'undefined') return 'sanity';
    const stored = localStorage.getItem(PRODUCT_SOURCE_KEY);
    if (stored === 'local' || stored === 'sanity' || stored === 'both') return stored;
    return 'sanity';
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // User authentication modals
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showHeritage, setShowHeritage] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  
  const { t } = useTranslation();
  const { isAuthenticated, token, logout } = useAuth();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  // Try to fetch from Sanity CMS
  const { products: sanityProducts, loading: sanityLoading } = useSanityProducts();

  // Load products from localStorage, and restore admin auth state.
  useEffect(() => {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    setProducts(stored ? JSON.parse(stored) : defaultProducts);
    setIsAdminAuthenticated(adminAuth.isAuthenticated());
  }, []);

  useEffect(() => {
    if (!sanityLoading) {
      if (sanityProducts.length > 0) {
        console.log('✅ Sanity CMS products available:', sanityProducts.length);
      } else {
        console.log('ℹ️ Using local products (Sanity has no products yet)');
      }
    }
  }, [sanityLoading]);

  // Listen for product updates from admin panel (localStorage)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PRODUCTS_STORAGE_KEY && productSourceMode !== 'sanity') {
        const updated = e.newValue ? JSON.parse(e.newValue) : defaultProducts;
        setProducts(updated);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [productSourceMode]);

  // Load wishlist count for authenticated user
  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (!isAuthenticated || !token) {
        setWishlistCount(0);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/wishlist`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setWishlistCount(0);
          return;
        }

        const data = await response.json();
        const items = Array.isArray(data.data) ? data.data : [];
        setWishlistCount(items.length);
      } catch (error) {
        console.error('Failed to load wishlist count', error);
        setWishlistCount(0);
      }
    };

    fetchWishlistCount();
  }, [isAuthenticated, token, API_URL]);

  const addToCart = (id: string) => {
    setCart((c) => {
      const found = c.find((x) => x.id === id);
      if (found) return c.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { id, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((c) => c.filter((x) => x.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
    } else {
      setCart((c) => c.map((x) => (x.id === id ? { ...x, qty } : x)));
    }
  };

  const handleBuyNow = (id: string) => {
    setCart((c) => {
      const found = c.find((x) => x.id === id);
      if (found) {
        return c.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...c, { id, qty: 1 }];
    });
    // Ensure we leave any detail view and jump straight to checkout
    setSelectedProductId(null);
    setShowCart(false);
    setShowCheckout(true);
  };

  const mergedProducts: Product[] = (() => {
    const byId = new Map<string, Product>();
    products.forEach((product) => byId.set(product.id, product));
    sanityProducts.forEach((product) => byId.set(product.id, product));
    return Array.from(byId.values());
  })();

  const displayProducts: Product[] = productSourceMode === 'sanity'
    ? (sanityProducts.length > 0 ? sanityProducts : products)
    : productSourceMode === 'both'
      ? mergedProducts
      : products;

  const cartTotal = cart.reduce((total, item) => {
    const product = displayProducts.find((p) => p.id === item.id);
    return total + (product?.price || 0) * item.qty;
  }, 0);

  const baseFiltered = selectedCategory
    ? displayProducts.filter((p) => p.category === selectedCategory)
    : displayProducts;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = normalizedQuery
    ? baseFiltered.filter((p) => {
        const nameEn = p.name.en?.toLowerCase?.() || '';
        const descEn = p.desc?.en?.toLowerCase?.() || '';
        return nameEn.includes(normalizedQuery) || descEn.includes(normalizedQuery);
      })
    : baseFiltered;

  // Only block rendering for Sanity-dependent modes.
  if (sanityLoading && productSourceMode !== 'local') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        color: '#6b7280'
      }}>
        <div>Loading products...</div>
      </div>
    );
  }

  // Admin panel handlers
  const handleAdminLogin = () => {
    setShowAdminLogin(false);
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    adminAuth.logout();
    setIsAdminAuthenticated(false);
  };

  const handleProductSourceChange = (mode: ProductSourceMode) => {
    setProductSourceMode(mode);
    localStorage.setItem(PRODUCT_SOURCE_KEY, mode);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handlePaymentSuccess = () => {
    setCart([]);
    setShowCheckout(false);
    setShowCart(false);
    setSelectedProductId(null);
    setShowOrderSuccess(true);
  };

  // Show admin login or panel
  if (showAdminLogin) {
    return <AdminLogin onLoginSuccess={handleAdminLogin} />;
  }

  if (isAdminAuthenticated) {
    return (
      <AdminProducts
        onLogout={handleAdminLogout}
        productSourceMode={productSourceMode}
        onProductSourceChange={handleProductSourceChange}
      />
    );
  }

  const handleOpenDetails = (id: string) => {
    setSelectedProductId(id);
  };

  const handleBackFromDetails = () => {
    setSelectedProductId(null);
  };

  const handleWishlistChange = (delta: number) => {
    setWishlistCount((prev) => {
      const next = (prev || 0) + delta;
      return next < 0 ? 0 : next;
    });
  };

  const selectedProduct = selectedProductId
    ? displayProducts.find((p) => p.id === selectedProductId) || null
    : null;

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    setShowWishlist(false);
    setShowOrders(false);
  };

  return (
    <div className="app-root">
      <Header
        cartCount={cart.reduce((s, i) => s + i.qty, 0)}
        wishlistCount={wishlistCount}
        searchQuery={searchQuery}
        onCartClick={() => setShowCart(!showCart)}
        onTitleClick={() => { 
          setShowCart(false); 
          setShowCheckout(false); 
          setShowAdminLogin(false); 
        }}
        onLangChange={() => {}}
        onLoginClick={() => setShowLogin(true)}
        onProfileClick={() => setShowProfile(true)}
        onWishlistClick={() => setShowWishlist(true)}
        onOrdersClick={() => setShowOrders(true)}
        onSearchChange={setSearchQuery}
        onLogoutClick={handleLogout}
      />
      {/* Admin Access Button */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
      }}>
        <button
          onClick={() => setShowAdminLogin(true)}
          title="Admin Panel"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
        >
          ⚙
        </button>
      </div>

      <div className="main-layout">
        {!showCheckout && !showCart && !selectedProduct && (
          <aside className="sidebar">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </aside>
        )}
        <main className="container">
          {selectedProduct ? (
            <ProductDetail
              product={selectedProduct}
              products={displayProducts}
              onBack={handleBackFromDetails}
              onAddToCart={addToCart}
              onBuyNow={handleBuyNow}
            />
          ) : showCheckout ? (
            <Checkout
              cartItems={cart}
              products={displayProducts}
              total={cartTotal}
              onBack={() => setShowCheckout(false)}
              onSuccess={handlePaymentSuccess}
            />
          ) : showCart ? (
            <Cart
              cartItems={cart}
              products={displayProducts}
              onRemove={removeFromCart}
              onUpdateQty={updateQty}
              total={cartTotal}
              onContinueShopping={() => setShowCart(false)}
              onCheckout={handleCheckout}
            />
          ) : (
            <ProductList 
              products={filteredProducts} 
              onAdd={addToCart}
              cart={cart}
              onUpdateQty={updateQty}
              onGoToCart={() => setShowCart(true)}
              onOpenDetails={handleOpenDetails}
              onWishlistChange={handleWishlistChange}
              onBuyNow={handleBuyNow}
            />
          )}
        </main>
      </div>
      
      <footer className="footer">
        <div className="footer-links">
          <button
            type="button"
            className="footer-link-btn"
            onClick={() => setShowAbout(true)}
          >
            About Us
          </button>
          <button
            type="button"
            className="footer-link-btn"
            onClick={() => setShowContact(true)}
          >
            Contact Us
          </button>
          <button
            type="button"
            className="footer-link-btn"
            onClick={() => setShowHeritage(true)}
          >
            Saree Heritage
          </button>
        </div>
        <div className="footer-text">
          © <span className="footer-brand">Saroja-Saree&apos;s</span> - Premium Sarees &amp; Innerwear ✨
        </div>
      </footer>
      
      {/* User Authentication Modals */}
      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}
      
      {showSignup && (
        <Signup 
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
      
      {showProfile && isAuthenticated && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
      
      {showWishlist && isAuthenticated && (
        <Wishlist 
          onClose={() => setShowWishlist(false)}
          products={displayProducts}
          onAddToCart={addToCart}
          onWishlistChange={handleWishlistChange}
        />
      )}
      
      {showOrders && isAuthenticated && (
        <OrderHistory onClose={() => setShowOrders(false)} />
      )}

      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="modal-content heritage-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAbout(false)}>
              ×
            </button>
            <section className="heritage-section">
              <div className="heritage-heading-row">
                <div>
                  <p className="heritage-kicker">Our Story</p>
                  <h2 className="heritage-title">About Saroja-Saree&apos;s</h2>
                </div>
                <div className="heritage-tag">Everyday & Occasion Wear</div>
              </div>
              <p className="heritage-intro">
                Saroja-Saree&apos;s is dedicated to curating elegant sarees and innerwear that bring together
                traditional craftsmanship, modern silhouettes and all-day comfort.
              </p>
              <p className="heritage-note">
                From festive drapes to daily-wear essentials, we focus on pieces that feel special to wear,
                easy to care for and worthy of gifting to the people you love.
              </p>
            </section>
          </div>
        </div>
      )}

      {showContact && (
        <div className="modal-overlay" onClick={() => setShowContact(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowContact(false)}>
              ×
            </button>
            <h2 className="modal-title">Contact Us</h2>
            <p style={{ marginBottom: 8 }}>Have a question about sizing, orders or products?</p>
            <p style={{ marginBottom: 8 }}>
              Email: <strong>support@saroja-sarees.example</strong>
            </p>
            <p style={{ marginBottom: 8 }}>
              Phone / WhatsApp: <strong>+91-7507100140</strong>
            </p>
            <p style={{ marginBottom: 0 }}>
              Our support hours are 10:00 AM – 7:00 PM IST, Monday to Saturday.
            </p>
          </div>
        </div>
      )}

      {showHeritage && (
        <div className="modal-overlay" onClick={() => setShowHeritage(false)}>
          <div className="modal-content heritage-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowHeritage(false)}>
              ×
            </button>
            <SareeHeritage />
          </div>
        </div>
      )}

      {showOrderSuccess && (
        <div className="modal-overlay" onClick={() => setShowOrderSuccess(false)}>
          <div className="modal-content order-success-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowOrderSuccess(false)}>
              ×
            </button>
            <div className="order-success-content">
              <div className="order-success-icon">✨</div>
              <h2 className="modal-title order-success-title">
                Thank you for shopping with{' '}
                <span className="order-success-brand">Saroja-Saree&apos;s</span>
                ! 💛
              </h2>
              <p className="order-success-text-main">
                Your payment was successful and your order has been placed 🎉.
              </p>
              <p className="order-success-text-sub">
                We feel lucky to be part of your special moments 🥰. You can view and track your orders
                anytime from the Order History section.
              </p>
              <button
                type="button"
                className="btn-primary order-success-button"
                onClick={() => setShowOrderSuccess(false)}
              >
                Keep Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
