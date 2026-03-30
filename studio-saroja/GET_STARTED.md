# Sanity Studio Setup Complete! 🎉

## ✅ What's Been Created

Your Sanity Studio is ready at: `studio-saroja/`

- **Project ID:** 1wmevimt
- **Dataset:** production  
- **Product Schema:** Configured with multi-language support (EN/HI/MR)

## 🚀 Quick Start

### 1. Start the Studio
```bash
cd studio-saroja
npm run dev
```

The studio will open at: **http://localhost:3333**

### 2. Add Your First Product

1. Click **"Product"** in the sidebar
2. Click **"Create new Product"**
3. Fill in the details:
   - **ID:** `s1` (unique identifier)
   - **Name (English):** "Banarasi Silk Saree"
   - **Name (Hindi):** "बनारसी सिल्क साड़ी"  
   - **Name (Marathi):** "बनारसी सिल्क साडी"
   - **Description:** "Premium silk saree from Banaras"
   - **Price:** `5999`
   - **Category:** Select "Sarees"
   - **Image:** Upload product photo
   - **Stock:** `10`
   - **Featured:** ✓ Check this box
4. Click **"Publish"**

### 3. View Products in Your Store

Products you add in Sanity will automatically appear at:
- **Frontend:** http://localhost:3000

Check browser console for: `✅ Using Sanity CMS products: X`

## 📦 Adding Multiple Products

### Quick Entry Template

For each product, use this format:
- **ID:** `s1`, `s2`, `s3` (for sarees), `i1`, `i2` (for innerwear)
- **Name:** Multi-language required
- **Price:** In rupees (₹)
- **Category:** saree | innerwear | accessories
- **Image:** JPEG/PNG recommended
- **Featured:** Check for homepage display

### Bulk Import (Optional)

To import many products at once:

1. Create a JSON file with your products
2. Use Sanity CLI:
   ```bash
   cd studio-saroja
   npx sanity dataset import products.json production
   ```

## 🔧 Available Commands

```bash
cd studio-saroja

# Start development server
npm run dev

# Build for production
npm run build

# Deploy studio to Sanity cloud
npx sanity deploy
```

## 🌐 Web-Based Studio

After deploying, access your studio anywhere at:
**https://saroja-sarees.sanity.studio**

To deploy:
```bash
cd studio-saroja
npx sanity deploy
```

## 🎯 Product Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ID | String | ✅ | Unique identifier (s1, s2, etc.) |
| Name | Object | ✅ | Multi-language (en, hi, mr) |
| Description | Text | ❌ | Product details |
| Price | Number | ✅ | Price in rupees (₹) |
| Category | String | ✅ | saree/innerwear/accessories |
| Image | Image | ❌ | Product photo with CDN |
| Stock | Number | ❌ | Available quantity |
| Featured | Boolean | ❌ | Show on homepage first |

## 💡 Tips

1. **Images:** Sanity automatically optimizes and serves images via CDN
2. **Multi-language:** Fill in all three languages for better customer experience
3. **Featured Products:** Mark your best sellers to show them first
4. **Stock Management:** Update stock quantity as items sell
5. **Categories:** Keep consistent for proper filtering

## 🔗 Useful Links

- **Your Studio:** http://localhost:3333 (when running)
- **Sanity Dashboard:** https://www.sanity.io/manage
- **Documentation:** https://www.sanity.io/docs

---

**Ready to start?** Run:
```bash
cd studio-saroja
npm run dev
```
