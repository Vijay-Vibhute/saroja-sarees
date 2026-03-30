# Sanity + Razorpay Integration Guide

A comprehensive guide to integrate Sanity.io CMS and Razorpay payment gateway into your React + TypeScript saree store.

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Step 1: Setup Environment Variables](#step-1-setup-environment-variables)
3. [Step 2: Create Sanity Project](#step-2-create-sanity-project)
4. [Step 3: Install Dependencies](#step-3-install-dependencies)
5. [Step 4: Configure Sanity Client](#step-4-configure-sanity-client)
6. [Step 5: Create Backend Endpoints](#step-5-create-backend-endpoints)
7. [Step 6: Integrate into React](#step-6-integrate-into-react)
8. [Step 7: Testing](#step-7-testing)
9. [Production Deployment](#production-deployment)

---

## 📁 Project Structure

```
ratnaprabha-store/
├── .env                           # Environment variables (NOT committed)
├── src/
│   ├── components/
│   │   ├── SanityProductList.tsx  # NEW: Product list with buy functionality
│   │   ├── AdminProducts.tsx       # Existing admin panel
│   │   └── ...
│   ├── lib/
│   │   └── sanity.ts              # NEW: Sanity client & queries
│   ├── types/
│   │   └── sanity.ts              # NEW: TypeScript interfaces
│   ├── utils/
│   │   ├── razorpay.ts            # NEW: Razorpay integration
│   │   └── adminAuth.ts           # Existing
│   ├── App.tsx                    # Main app component
│   └── index.tsx
├── sanity-schema/
│   └── product.ts                 # NEW: Sanity schema (for your Sanity project)
├── SANITY_INTEGRATION.md          # NEW: This file
├── BACKEND_SETUP.md               # NEW: Backend examples
├── package.json
└── tsconfig.json

# In your separate Sanity project:
your-sanity-project/
├── schemas/
│   └── product.ts                 # Copy from sanity-schema/product.ts
├── sanity.config.ts
└── schemaTypes.ts
```

---

## Step 1: Setup Environment Variables

### 1.1 Create `.env` file in project root

```bash
# Sanity Configuration
REACT_APP_SANITY_PROJECT_ID=your_project_id_here
REACT_APP_SANITY_DATASET=production
REACT_APP_SANITY_API_VERSION=2024-01-01

# Razorpay Configuration
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_here

# App Configuration
REACT_APP_SHOP_NAME=Ratnaprabha Saree's
```

### 1.2 Get Sanity Project ID

1. Go to [Sanity.io Dashboard](https://manage.sanity.io)
2. Create a new project (if not already created)
3. Note your **Project ID** and **Dataset name**
4. Add them to `.env`

### 1.3 Get Razorpay Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **API Keys**
3. Copy your **Key ID** (public key)
4. Add to `REACT_APP_RAZORPAY_KEY_ID` in `.env`

### 1.4 Important Notes

⚠️ **Never commit `.env` to version control!**

```bash
# Add to .gitignore if not already there
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

---

## Step 2: Create Sanity Project

### 2.1 Create a new Sanity project (if you haven't already)

```bash
npm create sanity@latest -- --project random --dataset production

# or use the Sanity CLI
npm install -g @sanity/cli
sanity create
```

### 2.2 Add product schema to your Sanity project

1. Copy the schema from `sanity-schema/product.ts`
2. Paste it in your Sanity project at `schemas/product.ts`
3. Update `schemaTypes.ts` to include the product schema:

```typescript
// your-sanity-project/schemaTypes.ts
import product from './schemas/product'

export const schemaTypes = [product]
```

### 2.3 Deploy schema

```bash
cd your-sanity-project
sanity deploy
```

### 2.4 Access Sanity Studio

```bash
sanity start
# Opens at http://localhost:3333
```

---

## Step 3: Install Dependencies

### 3.1 Install Sanity packages

```bash
npm install @sanity/client @sanity/image-url
```

### 3.2 Verify installation

```bash
npm list @sanity/client @sanity/image-url
```

---

## Step 4: Configure Sanity Client

The Sanity client is already configured in `src/lib/sanity.ts`. It includes:

### 4.1 Features

- **Client initialization** with environment variables
- **Image URL builder** for optimized image URLs
- **GROQ query functions**:
  - `fetchProducts()` - Get all products
  - `fetchProductBySlug()` - Get single product
  - `fetchProductsByCategory()` - Filter by category

### 4.2 Example Usage

```typescript
import { fetchProducts } from '@/lib/sanity'

// Fetch all products
const products = await fetchProducts()

// Fetch by category
const sarees = await fetchProductsByCategory('Saree')
```

### 4.3 Custom Queries

Add more queries to `src/lib/sanity.ts` as needed:

```typescript
export const fetchDiscountedProducts = async () => {
  const query = `
    *[_type == "product" && discount > 0] {
      _id,
      title,
      price,
      discount,
      _updated_at,
      category,
      image { asset -> { url } }
    }
  `
  return await sanityClient.fetch(query)
}
```

---

## Step 5: Create Backend Endpoints

### 5.1 Why do we need backend?

1. **Security**: Never expose Razorpay secret key on frontend
2. **Order Creation**: Create orders server-side
3. **Payment Verification**: Verify signatures server-side (critical!)

### 5.2 Choose your backend framework

Refer to `BACKEND_SETUP.md` for examples:
- Express.js (Node.js)
- Python Flask
- AWS Lambda
- Any other framework

### 5.3 Required endpoints

**POST /api/orders/create**
```json
Request:
{
  "amount": 1299,
  "currency": "INR",
  "receipt": "order_123",
  "notes": {
    "product_id": "s1",
    "product_title": "Red Silk Saree"
  }
}

Response:
{
  "id": "order_DBJOWzybf0sJbb",
  "entity": "order",
  "amount": 129900,
  "currency": "INR",
  "status": "created"
}
```

**POST /api/orders/verify**
```json
Request:
{
  "razorpay_order_id": "order_DBJOWzybf0sJbb",
  "razorpay_payment_id": "pay_DBJOWzybf0sJbb",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}

Response:
{
  "success": true,
  "message": "Payment verified successfully",
  "order_id": "order_DBJOWzybf0sJbb"
}
```

---

## Step 6: Integrate into React

### 6.1 Use the SanityProductList component

Replace your existing ProductList with SanityProductList:

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

### 6.2 Component flow

```
SanityProductList
├── useEffect: Fetch products from Sanity
├── Display: Map products to grid
├── Buy Now: handleBuy(product)
├── Checkout Modal
│   ├── Form: Collect customer details
│   ├── Create: Order creation via backend
│   ├── Razorpay: Payment modal
│   ├── Verify: Verify payment via backend
│   └── Success: Show confirmation
```

### 6.3 Core Functions

**Fetch Products:**
```typescript
useEffect(() => {
  const loadProducts = async () => {
    const data = await fetchProducts()
    const processed = data.map(p => ({
      ...p,
      imageUrl: p.image?.asset?.url || ''
    }))
    setProducts(processed)
  }
  loadProducts()
}, [])
```

**Handle Payment:**
```typescript
const handleBuy = async (product: ProcessedProduct) => {
  // 1. Create order via backend
  const order = await createRazorpayOrder(product.price)
  
  // 2. Open Razorpay modal
  await initializeRazorpay(orderData, formData, onSuccess, onError)
  
  // 3. On success: Verify payment via backend
  const result = await verifyPayment(...)
}
```

---

## Step 7: Testing

### 7.1 Test Sanity connection

```typescript
// Add this to a test file or component
import { fetchProducts } from '@/lib/sanity'

async function testSanityConnection() {
  try {
    const products = await fetchProducts()
    console.log('✅ Sanity connected:', products.length, 'products')
  } catch (error) {
    console.error('❌ Sanity error:', error)
  }
}
```

### 7.2 Test Razorpay integration

Use Razorpay test credentials:
- **Test Key ID**: `rzp_test_...` (from test environment)
- **Test Cards**:
  - Success: `4111 1111 1111 1111`
  - Failure: `4222 2222 2222 2222`

### 7.3 Test payment flow

1. Add a product in Sanity Studio
2. Visit your app
3. Click "Buy Now"
4. Fill checkout form
5. Complete payment with test card
6. Verify order in backend logs

---

## Production Deployment

### 6.1 Pre-deployment checklist

- [ ] Change to live Razorpay keys
- [ ] Implement `.env.production` with live credentials
- [ ] Setup backend server with SSL/HTTPS
- [ ] Enable CORS properly (don't use `*`)
- [ ] Implement logging & monitoring
- [ ] Setup database for orders
- [ ] Add error tracking (Sentry)
- [ ] Test payment verification
- [ ] Setup backup & recovery

### 6.2 Environment variables

```bash
# .env.production
REACT_APP_SANITY_PROJECT_ID=your_production_id
REACT_APP_RAZORPAY_KEY_ID=rzp_live_... (NOT rzp_test)
REACT_APP_SHOP_NAME=Ratnaprabha Saree's
NODE_ENV=production
```

### 6.3 Backend deployment

Deploy your backend on:
- AWS Lambda
- Heroku
- Vercel Serverless
- DigitalOcean App Platform
- Azure Functions

### 6.4 Frontend deployment

Deploy React app on:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Azure Static Web Apps

---

## 🔒 Security Checklist

- ✅ Environment variables use `REACT_APP_` prefix
- ✅ Secret keys NEVER exposed in frontend code
- ✅ Payment verification ALWAYS done on backend
- ✅ CORS enabled only for trusted domains
- ✅ HTTPS enforced in production
- ✅ Rate limiting on API endpoints
- ✅ Input validation on all forms
- ✅ Database encryption for sensitive data
- ✅ Regular security audits

---

## 📚 File References

| File | Purpose |
|------|---------|
| `src/lib/sanity.ts` | Sanity client & queries |
| `src/types/sanity.ts` | TypeScript interfaces |
| `src/utils/razorpay.ts` | Razorpay integration |
| `src/components/SanityProductList.tsx` | Product listing & checkout |
| `sanity-schema/product.ts` | Sanity schema definition |
| `.env` | Environment variables |
| `BACKEND_SETUP.md` | Backend implementation examples |

---

## 🆘 Troubleshooting

### "Products not loading"
1. Check `.env` variables are set
2. Verify Sanity Project ID is correct
3. Check browser console for errors
4. Test with: `fetchProducts()` in console

### "Razorpay button not appearing"
1. Check `REACT_APP_RAZORPAY_KEY_ID` is set
2. Verify backend `/api/orders/create` is working
3. Check network requests in DevTools

### "Payment verification failing"
1. Ensure backend URL is correct
2. Verify signature verification logic
3. Check `RAZORPAY_KEY_SECRET` on backend
4. Enable backend logs for debugging

### "Images not showing"
1. Verify image was uploaded in Sanity Studio
2. Check image asset URL in GROQ query
3. Test URL directly in browser
4. Verify CDN access permissions

---

## 📞 Resources

- [Sanity.io Documentation](https://www.sanity.io/docs)
- [Sanity GROQ Query Documentation](https://www.sanity.io/docs/groq)
- [Razorpay Integration Guide](https://razorpay.com/docs/integrate/)
- [React Hooks Documentation](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📝 Next Steps

1. Setup Sanity project and schema
2. Install dependencies
3. Configure environment variables
4. Create backend endpoints
5. Test Sanity connection
6. Test Razorpay flow
7. Deploy to production
8. Monitor and optimize

Good luck! 🚀
