# Sanity CMS Integration for Saroja-Saree's

## ✅ Current Status

Your store is already connected to Sanity CMS:
- **Project ID:** 1wmevimt
- **Dataset:** production
- **Frontend:** Already configured in `.env`
- **Sanity Client:** Ready in `src/utils/sanityClient.ts`

## 🌐 Access Sanity Studio (Web-Based - RECOMMENDED)

Since local installation has Node.js compatibility issues, use the web-based Studio:

### Option 1: Direct Studio Access
Go to: **https://1wmevimt.sanity.studio**

### Option 2: Via Sanity Dashboard
1. Go to: **https://www.sanity.io/manage**
2. Sign in with your Sanity account
3. Find your project: **1wmevimt**
4. Click **"Open Studio"** or **"Content"**

## 📋 Setting Up Product Schema (Web Interface)

You need to add the product schema to your Sanity project before adding products.

### Step 1: Install Sanity CLI Globally (One-time)

If you haven't already, install the Sanity CLI:
```bash
npm install -g @sanity/cli
```

### Step 2: Navigate to Studio Folder
```bash
cd studio
```

### Step 3: Deploy Schema to Sanity
```bash
npx sanity deploy
```

This will:
- Deploy your product schema to the cloud
- Make it available in the web-based Studio
- Enable you to start adding products

### Alternative: Manual Schema Deployment

If the deploy command has issues, you can:

1. **Log in to Sanity CLI:**
   ```bash
   npx sanity login
   ```

2. **Deploy the GraphQL API (optional but recommended):**
   ```bash
   npx sanity graphql deploy
   ```

## 🎨 Product Schema Overview

The schema in `studio/schemas/product.ts` includes:

- **ID**: Unique identifier (e.g., s1, s2, i1)
- **Name**: Multi-language
  - English
  - Hindi (हिंदी)
  - Marathi (मराठी)
- **Description**: Product details
- **Price**: In rupees (₹)
- **Category**: saree | innerwear | accessories
- **Image**: Product photo with CDN hosting
- **Stock**: Available quantity
- **Featured**: Mark products to show first

## 🚀 Adding Your First Product

Once schema is deployed:

1. Go to https://1wmevimt.sanity.studio
2. Click **"Product"** in the sidebar
3. Click **"Create new Product"**
4. Fill in:
   - ID: `s1`
   - Name (EN): "Banarasi Silk Saree"
   - Name (HI): "बनारसी सिल्क साड़ी"
   - Name (MR): "बनारसी सिल्क साडी"
   - Description: "Premium silk saree from Banaras"
   - Price: `5999`
   - Category: Select "saree"
   - Upload an image
   - Stock: `10`
   - Featured: Check if you want it highlighted
5. Click **"Publish"**

## 🔄 How It Works

Your frontend is configured to:

1. ✅ Check Sanity CMS for products first
2. 📦 Fall back to local products if Sanity is empty
3. 🔄 Auto-refresh when you add products in Sanity

**Check browser console for:**
- `✅ Using Sanity CMS products: X` (Sanity active)
- `ℹ️ Using local products (Sanity has no products yet)` (Fallback mode)

## 📝 Bulk Import (For 100+ Products)

### Option 1: Use Sanity CLI
Create a JSON file with your products:

```json
[
  {
    "_type": "product",
    "id": "s1",
    "name": {
      "en": "Banarasi Silk Saree",
      "hi": "बनारसी सिल्क साड़ी",
      "mr": "बनारसी सिल्क साडी"
    },
    "price": 5999,
    "category": "saree",
    "stock": 10,
    "featured": true
  }
]
```

Import using:
```bash
cd studio
npx sanity dataset import products.json production
```

### Option 2: Use Sanity API

Create a script to upload products programmatically:

1. Get an API token from https://www.sanity.io/manage
2. Add to `.env`:
   ```
   SANITY_API_TOKEN=your_token_here
   ```
3. Use the Sanity client to create products via API

## 🛠️ Troubleshooting

### "Schema not found" error in Studio
Run: `npx sanity deploy` from the studio folder

### Products not appearing in frontend
1. Check browser console for Sanity errors
2. Verify products are published (not drafts) in Sanity
3. Check project ID matches in `.env`

### Images not loading
Ensure images are uploaded through Sanity Studio's image field

## ⚡ Next Steps

1. **Deploy Schema:** `cd studio && npx sanity deploy`
2. **Access Studio:** https://1wmevimt.sanity.studio
3. **Add Products:** Start adding your 100+ products
4. **Test:** Products auto-appear in your store front end

---

**Need Help?** Check [Sanity Documentation](https://www.sanity.io/docs)
