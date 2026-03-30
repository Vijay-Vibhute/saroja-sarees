# Ratnaprabha Saree's — React + TypeScript Shop

A production-ready e-commerce store for Ratnaprabha Saree's (sarees & ladies innerwear), built with React + TypeScript, powered by Sanity.io CMS and Razorpay payments.

## 🚀 Quick Start
**New to this project?** Start here → **[START_HERE.md](START_HERE.md)** (complete guide)

🎯 **First time setup**: 45 minutes to getting products from Sanity!

## Quick Start (Windows)

```bash
npm install
npm run start
```

## Build Production Bundle

```bash
npm run build
```

## Features

### 🛍️ Store Features
- Browse products by category (Sarees, Innerwear)
- Multi-language support (English, हिंदी, मराठी)
- Shopping cart with quantity management
- Checkout page with order summary

### 🔐 Admin Panel
- **Full Product Management**: Add, edit, and delete products
- **Dynamic Pricing**: Update prices anytime
- **Multi-language Support**: Manage product names and descriptions in 3 languages
- **Image Management**: Add product images via URL
- **Data Persistence**: All changes saved to browser storage
- **Secure Access**: Password-protected admin area (demo password: `admin123`)

Access the admin panel by clicking the **⚙** button in the bottom-right corner of the store.

📖 **[See Admin Panel Documentation](ADMIN_PANEL.md)** for detailed usage and security guidelines.

### 🏪 Sanity CMS Integration (New!)
- **Dynamic Content**: Use Sanity.io as your product database
- **Easy Content Management**: Rich content editor in Sanity Studio
- **Image Optimization**: Automatic image URL building and CDN delivery
- **Typed Queries**: GROQ queries with full TypeScript support
- **Scalable**: Grow your catalog without code changes

📖 **[See Sanity Integration Guide](SANITY_INTEGRATION.md)** for complete setup instructions.

### 💳 Razorpay Payment Integration
- **Live Payments**: Accept payments securely with Razorpay
- **Test Mode**: Complete test environment for development
- **Order Management**: Backend order creation and verification
- **Customer Data**: Collect and process customer information
- **Payment Verification**: HMAC signature verification for security

📖 **[See Backend Setup Guide](BACKEND_SETUP.md)** for payment integration examples.

### 🚀 Quick Start for Sanity + Razorpay

1. **Setup**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 5-minute checklist
2. **Configure**: Get API keys from Sanity and Razorpay dashboards
3. **Backend**: Choose framework and implement order endpoints
4. **Test**: Use test credentials to verify payment flow
5. **Deploy**: Move to production with live keys

## Project Structure

```
src/
├── components/
│   ├── Cart.tsx                # Shopping cart
│   ├── CategoryFilter.tsx      # Product categories
│   ├── Checkout.tsx            # Checkout page
│   ├── Header.tsx              # Navigation header
│   ├── ProductCard.tsx         # Individual product card
│   ├── ProductList.tsx         # Product grid
│   ├── Toast.tsx               # Toast notifications
│   ├── AdminLogin.tsx          # Admin login form
│   └── AdminProducts.tsx       # Admin product management
├── data/
│   └── products.ts             # Product catalog with multilingual support
├── locales/
│   ├── en.json                 # English translations
│   ├── hi.json                 # Hindi translations
│   └── mr.json                 # Marathi translations
├── utils/
│   └── adminAuth.ts            # Admin authentication logic
├── styles/
│   └── global.css              # Global styles
└── App.tsx                      # Main app with admin routing
```

## Notes

- Translations are in `src/locales` (English, Hindi, Marathi)
- Product data is managed via the admin panel and persisted in localStorage
- Default admin password is `admin123` (change in production!)
- This is a front-end scaffold — connect to a backend or payment gateway as next steps

## Production Deployment

⚠️ **Before deploying to production**:

1. Change the admin password in `src/utils/adminAuth.ts`
2. Implement a proper backend for data storage
3. Set up secure authentication (JWT, OAuth, etc.)
4. Add HTTPS enforcement
5. Implement proper error handling and logging
6. Add payment gateway integration
7. Set up database backups

## Development

For development with hot reload:

```bash
npm run start
```

This will open the app in your browser at `http://localhost:8080`
