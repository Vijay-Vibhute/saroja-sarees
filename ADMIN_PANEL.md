# Admin Panel Documentation

## Overview
The Ratnaprabha Store now includes a built-in admin panel for managing products, images, prices, and titles. The admin panel is accessible through a floating button in the bottom-right corner of the store with a gear icon (⚙).

## Features

### 1. **Authentication**
- **Password Protected**: Admin access requires a password
- **Default Password**: `admin123` (⚠️ Change this in production)
- **Session Duration**: 24 hours (auto-logout after inactivity)
- **Secure Storage**: Authentication tokens stored in localStorage

### 2. **Product Management**

#### Add New Products
- Click "Add New Product" button on the dashboard
- Fill in the product details form:
  - **Product ID**: Auto-generated (optional, custom for new products)
  - **Price**: Product price in rupees (₹)
  - **Category**: Choose between "Sarees" or "Innerwear"
  - **Image URL**: Provide a direct link to the product image
  - **Image Preview**: See how the image will look before saving
  - **Product Names**: Add names in English, हिंदी (Hindi), and मराठी (Marathi)
  - **Descriptions**: Optional descriptions in three languages

#### Edit Products
- Click the "Edit" button on any product card
- Modify any product details
- Click "Save Product" to update
- All changes are reflected in real-time across the store

#### Delete Products
- Click the "Delete" button on any product card
- Confirm deletion when prompted
- Deleted products are immediately removed from the store

#### View Products
- See all products in a grid layout
- Each card displays:
  - Product image
  - Product ID
  - Price
  - Category
  - Product description preview
  - Edit and Delete buttons

### 3. **Data Persistence**
- All products are saved to **localStorage** (browser storage)
- Data persists across browser sessions
- Changes are automatically synchronized across open windows

### 4. **Multi-Language Support**
The admin panel supports managing product information in:
- **English** (en)
- **हिंदी** (Hindi - hi)
- **मराठी** (Marathi - mr)

## How to Access

### From the Store
1. Look for the red floating button with "⚙" icon in the bottom-right corner
2. Click to open the admin login screen
3. Enter the admin password: `admin123`
4. Click "Login"

### From the Admin Panel
1. Click "Logout" button in the top-right corner to return to the store

## File Structure

```
src/
├── components/
│   ├── AdminLogin.tsx          # Admin login form
│   └── AdminProducts.tsx       # Product management dashboard
├── utils/
│   └── adminAuth.ts            # Authentication logic
└── App.tsx                      # Updated with admin routing
```

## Technical Details

### Authentication (`adminAuth.ts`)
- **`adminAuth.login(password)`**: Authenticates and creates session
- **`adminAuth.logout()`**: Clears authentication
- **`adminAuth.isAuthenticated()`**: Checks if admin is logged in

### Data Storage
- Products are stored in `localStorage` with key: `store_products`
- Falls back to default products if localStorage is empty
- Supports real-time synchronization across tabs

### Product Type
```typescript
type Product = {
  id: string;
  price: number;
  image?: string;
  category: 'sarees' | 'innerwear';
  name: { en: string; hi: string; mr: string };
  desc?: { en?: string; hi?: string; mr?: string };
};
```

## Security Considerations

⚠️ **Important for Production**:

1. **Change the Default Password**
   - Edit `src/utils/adminAuth.ts`
   - Replace `admin123` with a strong password

2. **Implement Backend Authentication**
   - Current implementation uses localStorage (client-side only)
   - For production, implement:
     - Backend API authentication
     - JWT tokens or sessions
     - Encrypted password storage
     - Two-factor authentication optional

3. **Data Backup**
   - localStorage data is not backed up automatically
   - Implement database backup system

4. **Access Control**
   - Add IP whitelisting
   - Implement role-based access control (RBAC)
   - Add audit logging for admin actions

## Troubleshooting

### Products Not Saving
- Check browser localStorage is enabled
- Clear cache if facing issues
- Use browser DevTools (F12) → Application → Local Storage → Check `store_products`

### Forgotten Admin Password
- Edit `src/utils/adminAuth.ts` directly
- Change the `ADMIN_PASSWORD` constant

### Image Not Loading
- Ensure the image URL is publicly accessible
- Check CORS policies
- Use alternative image hosting if needed

## Future Enhancements

Potential features for future versions:
- [ ] Export/Import product data (CSV, JSON)
- [ ] Bulk upload images
- [ ] Product analytics and sales tracking
- [ ] Admin user management (multiple admins)
- [ ] Audit logs for all admin actions
- [ ] Product categories management
- [ ] Discount and coupon management
- [ ] Inventory tracking
- [ ] Backend database integration
- [ ] Image upload functionality (not just URLs)
