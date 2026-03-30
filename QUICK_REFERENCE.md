# Quick Reference Guide

Quick setup and reference for Sanity + Razorpay integration.

## 📦 Installation

```bash
# Install Sanity packages
npm install @sanity/client @sanity/image-url

# or with yarn
yarn add @sanity/client @sanity/image-url
```

## 🔧 Configuration Steps

### 1. Create `.env` file
```bash
REACT_APP_SANITY_PROJECT_ID=abc123xyz
REACT_APP_SANITY_DATASET=production
REACT_APP_SANITY_API_VERSION=2024-01-01
REACT_APP_RAZORPAY_KEY_ID=rzp_test_abc123
REACT_APP_SHOP_NAME=Ratnaprabha Saree's
```

### 2. Create Sanity Project
```bash
npm create sanity@latest
# Copy schema from sanity-schema/product.ts
```

### 3. Add to Sanity project
```typescript
// your-sanity-project/schemaTypes.ts
import product from './schemas/product'
export const schemaTypes = [product]
```

### 4. Deploy Schema
```bash
cd your-sanity-project
sanity deploy
```

## 📝 File Summary

| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/sanity.ts` | 80 | Sanity client, imageBuilder, GROQ queries |
| `src/types/sanity.ts` | 90 | TypeScript interfaces for products, cart, checkout |
| `src/utils/razorpay.ts` | 200 | Razorpay initialization, order creation, verification |
| `src/components/SanityProductList.tsx` | 350 | Product listing with buy and checkout flow |
| `sanity-schema/product.ts` | 130 | Complete Sanity schema with all fields |

**Total Code**: ~850 lines of well-typed, production-ready code

## 🚀 Usage Examples

### Fetch Products
```typescript
import { fetchProducts } from '@/lib/sanity'

const products = await fetchProducts()
// Returns: Product[]
```

### Process Image URLs
```typescript
import { urlFor } from '@/lib/sanity'

const imageUrl = urlFor(product.image).url()
```

### Handle Purchase
```typescript
const handleBuy = async (product: ProcessedProduct) => {
  const order = await createRazorpayOrder(product.price)
  await initializeRazorpay(orderData, formData, onSuccess, onError)
}
```

## 🔑 Keys Needed

| Key | Where to Get | For |
|-----|-------------|-----|
| REACT_APP_SANITY_PROJECT_ID | Sanity Dashboard | API access |
| REACT_APP_RAZORPAY_KEY_ID | Razorpay Dashboard (Settings > API Keys) | Checkout modal |
| RAZORPAY_KEY_SECRET | Backend only - Never frontend | Signature verification |

## 🔗 API Endpoints Required

```
POST /api/orders/create    - Create Razorpay order
POST /api/orders/verify    - Verify payment signature
```

See `BACKEND_SETUP.md` for implementations.

## ✅ Checklist

- [ ] Install `@sanity/client` and `@sanity/image-url`
- [ ] Create `.env` with credentials
- [ ] Create Sanity project
- [ ] Add product schema
- [ ] Deploy Sanity schema
- [ ] Setup backend endpoints
- [ ] Update App.tsx to use SanityProductList
- [ ] Test with `fetchProducts()`
- [ ] Test payment flow with test cards
- [ ] Deploy to production

## 🧪 Test Credentials

**Razorpay Test Cards:**
- Success: `4111 1111 1111 1111` - Expiry: Any future date - CVV: 123
- Failure: `4222 2222 2222 2222` - Expiry: Any future date - CVV: 123

## 📱 Environment Variables Cheat Sheet

```bash
# Copy and paste into .env

# Sanity
REACT_APP_SANITY_PROJECT_ID=
REACT_APP_SANITY_DATASET=production
REACT_APP_SANITY_API_VERSION=2024-01-01

# Razorpay (Use test keys first)
REACT_APP_RAZORPAY_KEY_ID=rzp_test_

# App
REACT_APP_SHOP_NAME=Ratnaprabha Saree's
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Products not loading" | Check env vars, verify Sanity Project ID |
| "Images broken" | Verify image uploaded in Sanity, check CDN |
| "Razorpay not opening" | Ensure backend `/api/orders/create` works |
| "Payment fails to verify" | Check backend has correct RAZORPAY_KEY_SECRET |
| "env vars undefined" | Restart dev server after changing .env |

## 📚 Documentation

- Full guide: [SANITY_INTEGRATION.md](SANITY_INTEGRATION.md)
- Backend examples: [BACKEND_SETUP.md](BACKEND_SETUP.md)
- Admin panel: [ADMIN_PANEL.md](ADMIN_PANEL.md)
- Original README: [README.md](README.md)

## 🎯 Next Steps

1. **Today**: Setup env vars and Sanity project
2. **Today**: Deploy Sanity schema
3. **Tomorrow**: Create backend endpoints
4. **Day 3**: Test full payment flow
5. **Day 4**: Deploy to production

Ready to go? Start with the `.env` file! 🎉
