# 🚀 Deployment Checklist

Complete checklist for deploying your Sanity + Razorpay integrated e-commerce store.

## Phase 1: Pre-Development Setup (1-2 hours)

### Create API Credentials
- [ ] Create Sanity account at https://sanity.io
- [ ] Create Sanity project
- [ ] Note down: Project ID, Dataset name
- [ ] Create Razorpay account at https://razorpay.com
- [ ] Get Razorpay API key (test mode): key_test_...
- [ ] Note down: Key ID and Key Secret

### Local Setup
- [ ] Install Node.js 16+
- [ ] Install dependencies: `npm install @sanity/client @sanity/image-url`
- [ ] Create `.env` file in project root
- [ ] Fill in all credentials in `.env`:
  ```
  REACT_APP_SANITY_PROJECT_ID=your_id
  REACT_APP_SANITY_DATASET=production
  REACT_APP_SANITY_API_VERSION=2024-01-01
  REACT_APP_RAZORPAY_KEY_ID=rzp_test_...
  REACT_APP_SHOP_NAME=Ratnaprabha Saree's
  ```
- [ ] Verify `.env` is in `.gitignore`
- [ ] Test environment variables loaded: `echo $REACT_APP_SANITY_PROJECT_ID`

### Documentation Review
- [ ] Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md) (10 min)
- [ ] Read [SANITY_INTEGRATION.md](SANITY_INTEGRATION.md) (30 min)
- [ ] Review [INTEGRATION_EXAMPLES.md](INTEGRATION_EXAMPLES.md) (20 min)

---

## Phase 2: Sanity CMS Setup (2-3 hours)

### Sanity Project Setup
- [ ] Open [Sanity Dashboard](https://manage.sanity.io)
- [ ] Create new project(s if not exists)
- [ ] Get project ID and dataset
- [ ] Add to `.env`

### Sanity Schema Deployment
- [ ] Copy schema from `sanity-schema/product.ts`
- [ ] Create new Sanity project/CLI: `npm create sanity@latest`
- [ ] Create `schemas/product.ts` in your Sanity project
- [ ] Paste product schema
- [ ] Update `schemaTypes.ts` to include product schema
- [ ] Run: `sanity deploy`
- [ ] Verify schema deployed: Open Sanity Studio (http://localhost:3333)

### Sanity Studio Configuration
- [ ] Access Sanity Studio
- [ ] Create test products:
  - [ ] 1 Saree product
  - [ ] 1 Innerwear product
- [ ] Upload images for products
- [ ] Set prices
- [ ] Fill descriptions
- [ ] Publish products

### Test Sanity Connection
- [ ] Run app: `npm run start`
- [ ] Check browser console
- [ ] Run: `await fetchProducts()` in console
- [ ] Verify products load from Sanity ✅
- [ ] Check image URLs are valid

---

## Phase 3: Backend Setup (3-4 hours)

### Choose Backend Framework
- [ ] Select framework:
  - [ ] Express.js (Node.js) - Recommended for beginners
  - [ ] Python Flask
  - [ ] AWS Lambda
  - [ ] Other: ________
- [ ] Reference: [BACKEND_SETUP.md](BACKEND_SETUP.md)

### Backend Directory Structure
```
backend/
├── .env                 # Environment variables
├── package.json
├── src/
│   ├── index.ts         # Entry point
│   ├── routes/
│   │   └── orders.ts    # Order endpoints
│   └── middleware/      # Auth, logging, etc
└── dist/                # Built files
```

### Backend Implementation
- [ ] Create backend project folder
- [ ] Initialize: `npm init -y`
- [ ] Install framework packages
- [ ] Install Razorpay SDK: `npm install razorpay`
- [ ] Install utilities: `npm install dotenv cors`
- [ ] Create `.env` with:
  ```
  RAZORPAY_KEY_ID=rzp_test_...
  RAZORPAY_KEY_SECRET=...
  PORT=3001
  NODE_ENV=development
  ```
- [ ] Implement POST `/api/orders/create` endpoint:
  ```typescript
  // Should use Razorpay SDK to create order
  // Return order ID and details
  ```
- [ ] Implement POST `/api/orders/verify` endpoint:
  ```typescript
  // Should verify HMAC signature
  // Check signature validity
  // Return success/failure
  ```

### Backend Testing
- [ ] Start backend: `npm run dev` (on port 3001)
- [ ] Test order creation endpoint:
  ```bash
  curl -X POST http://localhost:3001/api/orders/create \
    -H "Content-Type: application/json" \
    -d '{"amount": 1299}'
  ```
  Response should have order ID
- [ ] Test verification endpoint with valid signature
- [ ] Test verification endpoint with invalid signature
- [ ] Verify all error cases handled

### Backend Database (Optional)
- [ ] Choose database (MongoDB, PostgreSQL, etc.)
- [ ] Setup database connection
- [ ] Create orders table/collection
- [ ] Save verified orders to database
- [ ] Add order status field
- [ ] Setup database backups

---

## Phase 4: Frontend Integration (2-3 hours)

### Import New Components
- [ ] Add to `src/App.tsx`:
  ```typescript
  import SanityProductList from './components/SanityProductList'
  ```
- [ ] Try rendering component: `<SanityProductList />`

### Update Config
- [ ] Ensure `.env` variables are set
- [ ] Restart dev server: `npm run start`
- [ ] Verify no console errors

### Frontend Adjustments
- [ ] Verify Sanity products display
- [ ] Click "Buy Now" button
- [ ] Checkout form should appear
- [ ] Fill form with test data
- [ ] Click "Pay" button
- [ ] Razorpay modal should appear

### Update Backend URL (if needed)
- [ ] In `src/utils/razorpay.ts`, verify API endpoints:
  - [ ] Check `createRazorpayOrder()` points to correct backend
  - [ ] Check `verifyPayment()` points to correct backend
  - [ ] Update if using different URL:
    ```typescript
    const response = await fetch('http://localhost:3001/api/orders/create', ...
    ```

### Add CORS Configuration (Backend)
- [ ] In backend, add CORS for localhost:
  ```typescript
  app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true
  }))
  ```

---

## Phase 5: Testing (2-3 hours)

### Sanity Testing
- [ ] [ ] Products load from Sanity: ✅
- [ ] [ ] Images display correctly: ✅
- [ ] [ ] Product details show: ✅
- [ ] [ ] Category filtering works: ✅

### Razorpay Test Mode Testing
- [ ] [ ] Use test key ID (rzp_test_...)
- [ ] [ ] Test payment flow:
  1. [ ] Click "Buy Now"
  2. [ ] Fill checkout form
  3. [ ] Click "Pay"
  4. [ ] Razorpay modal opens
  5. [ ] Select test card
  6. [ ] Enter card details:
     - Card: 4111 1111 1111 1111
     - Expiry: Any future date
     - CVV: 123
  7. [ ] Payment should succeed
  8. [ ] See success message
  9. [ ] Order appears in backend logs

### Test Payment Failure
- [ ] [ ] Test with card: 4222 2222 2222 2222 (fails)
- [ ] [ ] Verify error message displays
- [ ] [ ] Verify retry works

### Verify Payment Backend
- [ ] [ ] Payment verified in backend logs
- [ ] [ ] Order saved to database (if implemented)
- [ ] [ ] Email sent (if implemented)
- [ ] [ ] Order ID matches payment ID

### Multi-Language Testing
- [ ] [ ] Switch language to हिंदी
- [ ] [ ] Product names display in Hindi
- [ ] [ ] Switch to मराठी
- [ ] [ ] Product names display in Marathi

### Mobile Testing
- [ ] [ ] Test on mobile browser
- [ ] [ ] Product grid responsive
- [ ] [ ] Checkout form readable
- [ ] [ ] Payment modal works

### Admin Panel Testing
- [ ] [ ] Click ⚙ button to access admin
- [ ] [ ] Login with password: admin123
- [ ] [ ] Add new product from admin
- [ ] [ ] Edit existing product
- [ ] [ ] Delete product
- [ ] [ ] Verify changes reflect in store

### Error Handling Testing
- [ ] [ ] Test with network off (use DevTools)
- [ ] [ ] Verify error messages display
- [ ] [ ] Test with invalid Sanity credentials
- [ ] [ ] Test with invalid Razorpay key
- [ ] [ ] Verify graceful failure handling

---

## Phase 6: Production Preparation (1-2 hours)

### Change to Live Keys (IMPORTANT!)
- [ ] [ ] Create new `.env.production` file
- [ ] [ ] Switch Razorpay to live mode:
  ```
  REACT_APP_RAZORPAY_KEY_ID=rzp_live_...  (NOT rzp_test)
  ```
- [ ] [ ] Update backend with live secret:
  ```
  RAZORPAY_KEY_SECRET=... (live secret, not test)
  ```

### Security Review
- [ ] [ ] No secrets hardcoded in code
- [ ] [ ] `.env` not committed to git
- [ ] [ ] `.env.production` not committed
- [ ] [ ] Backend validates all inputs
- [ ] [ ] CORS restricted to your domain
- [ ] [ ] HTTPS enforced in production
- [ ] [ ] Rate limiting enabled (optional)
- [ ] [ ] Logging enabled

### Performance Optimization
- [ ] [ ] Build frontend: `npm run build`
- [ ] [ ] Check bundle size
- [ ] [ ] Enable gzip compression
- [ ] [ ] CDN image optimization working
- [ ] [ ] Lazy loading considered
- [ ] [ ] Caching headers set

### Database Backup
- [ ] [ ] Setup daily backups (if using backend DB)
- [ ] [ ] Test restore process
- [ ] [ ] Store backups securely

### Monitoring Setup
- [ ] [ ] Setup error tracking (e.g., Sentry)
- [ ] [ ] Setup analytics
- [ ] [ ] Setup payment monitoring
- [ ] [ ] Setup uptime monitoring

---

## Phase 7: Deployment (1-2 hours)

### Deploy Backend
- [ ] [ ] Choose hosting: AWS, Heroku, DigitalOcean, etc.
- [ ] [ ] Create account on hosting platform
- [ ] [ ] Deploy backend code:
  ```bash
  git push heroku main  # if using Heroku
  # or follow platform-specific instructions
  ```
- [ ] [ ] Set environment variables on platform:
  - [ ] [ ] RAZORPAY_KEY_ID (live key)
  - [ ] [ ] RAZORPAY_KEY_SECRET (live secret)
  - [ ] [ ] DATABASE connection string (if applicable)
  - [ ] [ ] PORT
- [ ] [ ] Test backend is live: `curl https://your-backend.com/api/orders/create`
- [ ] [ ] Verify responses correct

### Deploy Frontend
- [ ] [ ] Choose hosting: Vercel, Netlify, AWS S3, Azure, etc.
- [ ] [ ] Build: `npm run build`
- [ ] [ ] Deploy built files:
  ```bash
  npm run build  # creates dist folder
  # Upload dist folder to hosting
  ```
- [ ] [ ] Set environment variables:
  - [ ] [ ] REACT_APP_SANITY_PROJECT_ID
  - [ ] [ ] REACT_APP_SANITY_DATASET
  - [ ] [ ] REACT_APP_RAZORPAY_KEY_ID (live key)
  - [ ] [ ] REACT_APP_SHOP_NAME
- [ ] [ ] Configure custom domain (if applicable)
- [ ] [ ] Enable HTTPS
- [ ] [ ] Test frontend is live: Visit your domain

### Deploy Sanity (if needed)
- [ ] [ ] Already deployed schema
- [ ] [ ] Verify Sanity Studio access working
- [ ] [ ] Backup Sanity data

---

## Phase 8: Live Testing (1-2 hours)

### Pre-Launch Testing
- [ ] [ ] Clear browser cache
- [ ] [ ] Visit live domain
- [ ] [ ] Products load: ✅
- [ ] [ ] Images display: ✅
- [ ] [ ] "Buy Now" works: ✅

### Complete Payment Flow (Live)
- [ ] [ ] Click "Buy Now"
- [ ] [ ] Fill checkout form
- [ ] [ ] Click "Pay"
- [ ] [ ] Razorpay opens (should show "LIVE MODE" if available)
- [ ] [ ] Complete with test card (if available in live mode):
  - Card: 4111 1111 1111 1111
  - Expiry: Any future date
  - CVV: 123
- [ ] [ ] See success message
- [ ] [ ] Check backend payment was recorded
- [ ] [ ] Check customer received confirmation (if email enabled)
- [ ] [ ] Verify Razorpay dashboard shows payment

### Cross-Browser Testing
- [ ] [ ] Google Chrome
- [ ] [ ] Mozilla Firefox
- [ ] [ ] Safari
- [ ] [ ] Mobile Safari (iOS)
- [ ] [ ] Chrome Mobile (Android)

### Real Payment Test (Optional)
- [ ] [ ] Make real test purchase with small amount
- [ ] [ ] Verify payment processes correctly
- [ ] [ ] Verify order recorded accurately

---

## Phase 9: Post-Launch Monitoring (Ongoing)

### Daily Checks (First Week)
- [ ] [ ] No errors in error tracking
- [ ] [ ] Payment success rate > 95%
- [ ] [ ] Response time < 2 seconds
- [ ] [ ] No database issues
- [ ] [ ] Customer inquiries addressed

### Weekly Checks
- [ ] [ ] Sanity content updates working
- [ ] [ ] Payments processing in real-time
- [ ] [ ] Backup jobs running
- [ ] [ ] Admin panel access working

### Monthly Checks
- [ ] [ ] Database optimization
- [ ] [ ] Security audit
- [ ] [ ] Performance review
- [ ] [ ] Backup restoration test
- [ ] [ ] Costs review

### Quarterly Review
- [ ] [ ] Feature requests evaluation
- [ ] [ ] Scaling needs assessment
- [ ] [ ] Security updates
- [ ] [ ] Performance improvements
- [ ] [ ] Customer feedback analysis

---

## 🎯 Critical Paths

### Minimum Viable Deployment
```
✅ 1. Setup .env with credentials
✅ 2. Deploy Sanity schema
✅ 3. Add products in Sanity
✅ 4. Create backend endpoints
✅ 5. Test locally
✅ 6. Deploy backend
✅ 7. Deploy frontend
✅ 8. Update backend URL in frontend
✅ 9. Test live payment (live key)
✅ 10. Go live
```

### Recommended Full Deployment
```
✅ 1. All of above, plus:
✅ 2. Database setup
✅ 3. Email notifications
✅ 4. Admin panel setup
✅ 5. Monitoring setup
✅ 6. CDN setup
✅ 7. Backup system
✅ 8. Security audit
```

---

## ⏱️ Time Breakdown

| Phase | Hours | Task |
|-------|-------|------|
| Phase 1 | 2 | Setup credentials & local |
| Phase 2 | 3 | Sanity CMS setup |
| Phase 3 | 4 | Backend development |
| Phase 4 | 3 | Frontend integration |
| Phase 5 | 3 | Testing |
| Phase 6 | 2 | Production prep |
| Phase 7 | 2 | Deployment |
| Phase 8 | 2 | Live testing |
| **Total** | **21 hours** | **~3 days of work** |

---

## 📞 Support Resources

| Need | Resource |
|------|----------|
| Sanity help | [Sanity Docs](https://www.sanity.io/docs) |
| Razorpay help | [Razorpay Docs](https://razorpay.com/docs/) |
| React help | [React Docs](https://react.dev) |
| TypeScript help | [TypeScript Docs](https://www.typescriptlang.org/docs/) |
| Deployment help | Platform-specific docs |

---

## ✅ Final Checklist

Before declaring launch complete:

- [ ] Website loads without errors
- [ ] Products display from Sanity
- [ ] Images load correctly
- [ ] Checkout form works
- [ ] Payment processes
- [ ] Orders appear in backend
- [ ] Admin panel works
- [ ] Mobile responsive
- [ ] Multi-language works
- [ ] Error handling works
- [ ] Monitoring active
- [ ] Backups running
- [ ] Team trained
- [ ] Documentation updated
- [ ] Speed acceptable (< 3s)

---

## 🎉 Launch!

Once all checkboxes are ticked, you're ready to go live!

**Congratulations on your new e-commerce store!** 🚀

---

*Last Updated: February 2026*
*Next Review: March 2026*
