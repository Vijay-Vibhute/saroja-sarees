# Integration Examples

Copy-paste examples showing how to use the Sanity + Razorpay integration in your app.

## Example 1: Replace ProductList with Sanity

### Before (Current)
```typescript
// src/App.tsx
import ProductList from './components/ProductList'
import { products } from './data/products'

export default function App() {
  const [filteredProducts, setFilteredProducts] = useState(products)
  
  return (
    <ProductList 
      products={filteredProducts}
      onAdd={addToCart}
    />
  )
}
```

### After (With Sanity)
```typescript
// src/App.tsx
import SanityProductList from './components/SanityProductList'

export default function App() {
  return (
    <div>
      <Header />
      <SanityProductList />
    </div>
  )
}
```

---

## Example 2: Fetch Products with Error Handling

```typescript
// Custom hook for product fetching
import { useState, useEffect } from 'react'
import { fetchProducts } from '@/lib/sanity'
import { ProcessedProduct } from '@/types/sanity'
import { urlFor } from '@/lib/sanity'

export function useProducts() {
  const [products, setProducts] = useState<ProcessedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await fetchProducts()
        
        // Process products to include image URLs
        const processed = data.map((p: any) => ({
          ...p,
          imageUrl: p.image?.asset?.url || '',
        }))
        
        setProducts(processed)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  return { products, loading, error }
}

// Usage in component
function MyComponent() {
  const { products, loading, error } = useProducts()
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      {products.map(p => (
        <div key={p._id}>{p.title}</div>
      ))}
    </div>
  )
}
```

---

## Example 3: Setup Environment Variables

```bash
# .env file
# Copy and fill in your actual values

# Sanity Configuration
REACT_APP_SANITY_PROJECT_ID=your_project_id_here
REACT_APP_SANITY_DATASET=production
REACT_APP_SANITY_API_VERSION=2024-01-01

# Razorpay Configuration (Test mode first)
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_here

# App Name
REACT_APP_SHOP_NAME=Ratnaprabha Saree's
```

---

## Example 4: Create Backend Endpoint (Express.js)

```typescript
// Backend code (NOT in React app)
import express from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const app = express()
app.use(express.json())

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Create Order
app.post('/api/orders/create', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body

    const order = await razorpay.orders.create({
      amount: Math.round(amount), // in paise
      currency,
      receipt,
      notes,
    })

    res.json(order)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Verify Payment
app.post('/api/orders/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature === razorpay_signature) {
      // Signature verified - save order to database
      res.json({ success: true, message: 'Payment verified' })
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) })
  }
})

app.listen(3001, () => console.log('Server on :3001'))
```

---

## Example 5: Custom GROQ Queries

```typescript
// src/lib/sanity.ts - Add these functions

// Get products with discount
export const fetchDiscountedProducts = async () => {
  const query = `
    *[_type == "product" && discount > 0] | order(discount desc) {
      _id,
      title,
      price,
      discount,
      image { asset -> { url } }
    }
  `
  return await sanityClient.fetch(query)
}

// Get new products (last 7 days)
export const fetchNewProducts = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const query = `
    *[_type == "product" && createdAt > "${sevenDaysAgo}"] | order(_createdAt desc) {
      _id,
      title,
      price,
      category,
      image { asset -> { url } }
    }
  `
  return await sanityClient.fetch(query)
}

// Get featured products
export const fetchFeaturedProducts = async () => {
  const query = `
    *[_type == "product" && featured == true] {
      _id,
      title,
      price,
      description,
      image { asset -> { url } }
    }
  `
  return await sanityClient.fetch(query)
}

// Usage
import { fetchDiscountedProducts } from '@/lib/sanity'

const discounted = await fetchDiscountedProducts()
```

---

## Example 6: Handle Single Product Page

```typescript
// src/components/ProductDetail.tsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchProductBySlug } from '@/lib/sanity'
import { ProcessedProduct } from '@/types/sanity'

interface Params {
  slug: string
}

export default function ProductDetail() {
  const { slug } = useParams<Params>()
  const [product, setProduct] = useState<ProcessedProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    const loadProduct = async () => {
      try {
        setLoading(true)
        const data = await fetchProductBySlug(slug)
        
        if (!data) {
          setError('Product not found')
          return
        }

        setProduct({
          ...data,
          imageUrl: data.image?.asset?.url || '',
        })
      } catch (err) {
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [slug])

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!product) return <div>Product not found</div>

  return (
    <div>
      <h1>{product.title}</h1>
      {product.imageUrl && <img src={product.imageUrl} alt={product.title} />}
      <p>₹{product.price}</p>
      <p>{product.description}</p>
      <button>Add to Cart</button>
    </div>
  )
}
```

---

## Example 7: Add Cart Functionality

```typescript
// Custom hook for cart
import { useState, useEffect } from 'react'
import { CartItem, ProcessedProduct } from '@/types/sanity'

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) setCart(JSON.parse(saved))
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: ProcessedProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id)
      if (existing) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item._id !== productId))
  }

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId)
    } else {
      setCart(prev =>
        prev.map(item =>
          item._id === productId ? { ...item, qty } : item
        )
      )
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0)

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    total,
    itemCount,
  }
}

// Usage in component
function App() {
  const { cart, addToCart, removeFromCart, total } = useCart()

  return (
    <div>
      <p>Items: {cart.length} | Total: ₹{total}</p>
      <SanityProductList onBuy={addToCart} />
    </div>
  )
}
```

---

## Example 8: Format Prices

```typescript
// Using in component
import { formatPrice } from '@/utils/razorpay'

function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.title}</h3>
      {/* Original price with discount */}
      {product.discount && (
        <span style={{ textDecoration: 'line-through' }}>
          {formatPrice(product.price)}
        </span>
      )}
      {/* Sale price */}
      <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
        {formatPrice(product.price - (product.price * product.discount / 100))}
      </span>
    </div>
  )
}
```

---

## Example 9: Error Boundary Component

```typescript
// src/components/ErrorBoundary.tsx
import React, { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#dc2626' }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage
import { ErrorBoundary } from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <SanityProductList />
    </ErrorBoundary>
  )
}
```

---

## Example 10: Complete App Integration

```typescript
// src/App.tsx - Full example
import React, { useState } from 'react'
import Header from './components/Header'
import SanityProductList from './components/SanityProductList'
import Cart from './components/Cart'
import { useCart } from './hooks/useCart'
import { ErrorBoundary } from './components/ErrorBoundary'

export default function App() {
  const [showCart, setShowCart] = useState(false)
  const { cart, addToCart, removeFromCart, updateQty, total, itemCount } = useCart()

  return (
    <ErrorBoundary>
      <div className="app">
        <Header
          cartCount={itemCount}
          onCartClick={() => setShowCart(!showCart)}
        />

        {showCart ? (
          <Cart
            items={cart}
            onRemove={removeFromCart}
            onUpdateQty={updateQty}
            total={total}
            onContinueShopping={() => setShowCart(false)}
          />
        ) : (
          <SanityProductList onBuy={addToCart} />
        )}
      </div>
    </ErrorBoundary>
  )
}
```

---

## 🚀 Start Here

1. Copy `.env` template and fill credentials
2. Copy one example at a time
3. Test each part before moving to next
4. See `QUICK_REFERENCE.md` for checklist

Good luck! 🎉
