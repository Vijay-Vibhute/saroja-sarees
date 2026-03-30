# 🎯 Frontend Integration Checklist

Complete checklist to verify backend integration with your React app.

---

## ✅ Pre-Integration Setup

Before connecting frontend to backend:

- [ ] Backend installed: `npm install` in backend folder
- [ ] Backend running: `npm run dev` shows "🚀 Server running"
- [ ] Health check works: `curl http://localhost:3001/health`
- [ ] Razorpay keys in `backend/.env` (test mode)
- [ ] Frontend running: `npm start` in root folder
- [ ] Frontend shows products on homepage

---

## 🔌 Integration Steps

### Step 1: Update Frontend Environment

Create or update `.env` in project **root folder** (not backend):

```
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_RAZORPAY_KEY_ID=rzp_test_<your_test_key>
```

✅ Checkpoint: Env variables set

---

### Step 2: Verify Razorpay Key in Frontend

The frontend expects your test key. Check it's available:

In `src/utils/razorpay.ts`, the key is loaded from environment:
```typescript
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID!
```

✅ Checkpoint: Frontend can access Razorpay key

---

### Step 3: Verify Backend URL

Update `src/utils/razorpay.ts` to use backend URL from environment:

**Current code (find this):**
```typescript
const response = await fetch('/api/orders/create', {
```

**Should be (look for or update to this):**
```typescript
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
const response = await fetch(`${BACKEND_URL}/api/orders/create`, {
```

**Do the same for verification endpoint:**

**Find:**
```typescript
const verifyResponse = await fetch('/api/orders/verify', {
```

**Update to:**
```typescript
const verifyResponse = await fetch(`${BACKEND_URL}/api/orders/verify`, {
```

✅ Checkpoint: Frontend knows backend URL

---

### Step 4: Restart Frontend

After updating environment variables:

1. Stop frontend: Press `Ctrl+C` in terminal
2. Restart: `npm start`
3. Verify it shows "Compiled successfully"

✅ Checkpoint: Frontend restarted with new config

---

## 🧪 Integration Testing

### Test 1: Backend Connectivity

In browser DevTools (F12), Console tab, run:

```javascript
fetch('http://localhost:3001/health')
  .then(r => r.json())
  .then(console.log)
```

Expected output:
```json
{ status: 'OK', message: 'Server is running' }
```

✅ Test 1 passed: Frontend can reach backend

---

### Test 2: Order Creation

In browser DevTools Console:

```javascript
fetch('http://localhost:3001/api/orders/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 299 })
})
.then(r => r.json())
.then(console.log)
```

Expected output:
```json
{
  "success": true,
  "order": {
    "id": "order_...",
    "amount": 29900,
    "currency": "INR"
  }
}
```

✅ Test 2 passed: Order creation working

---

### Test 3: Full Payment Flow

1. Navigate to homepage: http://localhost:8080
2. Click "Buy Now" on any product
3. Fill out checkout form:
   ```
   Name: Test User
   Email: test@example.com
   Phone: 9999999999
   Address: 123 Test St
   ```
4. Click "Pay Now"
5. Razorpay modal opens
6. Enter test card:
   - Card: 4111 1111 1111 1111
   - Expiry: 12/25
   - CVV: 123
7. Click Pay
8. Should see success ✅

✅ Test 3 passed: Full payment flow working

---

## 🔍 Verification Checklist

After completing all tests:

- [ ] Backend running on http://localhost:3001
- [ ] Frontend running on http://localhost:8080 (or custom port)
- [ ] Health check endpoint responds
- [ ] Order creation returns valid order ID
- [ ] Razorpay modal opens when clicking "Pay"
- [ ] Test card payment completes
- [ ] Success message appears in frontend
- [ ] Order visible in Razorpay dashboard
- [ ] Backend logs show verified payment
- [ ] No console errors (frontend)
- [ ] No backend errors (backend terminal)

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" or CORS error

**Cause:** Frontend can't reach backend

**Checklist:**
- [ ] Backend running: `npm run dev` in backend folder
- [ ] Backend URL correct: Should be `http://localhost:3001`
- [ ] Frontend .env has: `REACT_APP_BACKEND_URL=http://localhost:3001`
- [ ] Frontend restarted after changing .env

**Fix:**
```bash
# Restart frontend
npm start
```

---

### Issue: Razorpay modal doesn't open

**Cause:** Razorpay script not loaded or keys missing

**Checklist:**
- [ ] Razorpay key set: `REACT_APP_RAZORPAY_KEY_ID` in .env
- [ ] Key is test key: Starts with `rzp_test_`
- [ ] Frontend .env reloaded

**In DevTools Console, check:**
```javascript
console.log(process.env.REACT_APP_RAZORPAY_KEY_ID)
// Should show: rzp_test_abc123...
```

---

### Issue: "Payment verification failed"

**Cause:** Backend can't verify signature

**Checklist:**
- [ ] Backend has test keys in `.env`
- [ ] `RAZORPAY_KEY_SECRET` is correct (not Key ID)
- [ ] Backend restarted after .env change

**Backend logs should show:**
```
POST /api/orders/verify - 200 - SUCCESS ✓
```

---

### Razorpay Key ID shows as undefined

**Cause:** Environment variable not loaded

**Fix:**
1. Check `.env` file exists in **project root** (not backend)
2. Format is exactly: `REACT_APP_RAZORPAY_KEY_ID=rzp_test_abc123`
3. No spaces around `=`
4. Restart frontend: Stop and `npm start`

---

## 📊 Expected Behavior

### When Everything Works

1. **Click "Buy Now"**
   - ✅ Form modal appears
   - ✅ No console errors

2. **Fill Form + Click "Pay"**
   - ✅ Razorpay modal opens immediately
   - ✅ Razorpay logo visible
   - ✅ Can enter card details

3. **Complete Payment**
   - ✅ Modal processes payment
   - ✅ See success/failure message
   - ✅ Backend logs show verification

4. **Check Backend Logs**
   ```
   POST /api/orders/create - 201
   POST /api/orders/verify - 200 - ✓ Verified
   ```

5. **Check Razorpay Dashboard**
   - ✅ Order appears in Payments section
   - ✅ Status shows "Captured" or "Authorized"

---

## 🎯 What Each Layer Does

### Frontend (`src/utils/razorpay.ts`)
1. Takes amount from cart
2. Calls `POST /api/orders/create` on backend
3. Receives order ID from backend
4. Opens Razorpay modal with order ID
5. User completes payment in modal
6. Calls `POST /api/orders/verify` on backend
7. Backend returns success/fail
8. Shows message to user

### Backend (`backend/src/index.ts`)
1. Receives amount from frontend
2. Creates order with Razorpay SDK
3. Returns order ID to frontend
4. Receives payment details from frontend
5. Verifies HMAC signature (security check)
6. If valid, marks as verified
7. Returns success to frontend
8. (Optional) Saves to database

### Razorpay (Cloud Service)
1. Powers the payment modal UI
2. Collects card details securely
3. Processes payment
4. Returns payment result to frontend
5. Records transaction in dashboard

---

## 🚀 Next: Production Deployment

After verifying everything works locally:

1. **Deploy Backend**
   - Push to GitHub
   - Deploy to Heroku (or your choice)
   - See `BACKEND_DEPLOYMENT.md`

2. **Update Frontend URLs**
   - Change `REACT_APP_BACKEND_URL` to production URL
   - Example: `https://your-api.herokuapp.com`

3. **Switch Razorpay Keys**
   - Change from test (`rzp_test_`) to live (`rzp_live_`)
   - Update both frontend and backend

4. **Deploy Frontend**
   - Build: `npm run build`
   - Deploy to hosting (Netlify, Vercel, etc.)

---

## 📝 Quick Commands Reference

```bash
# Start backend (Terminal 1)
cd backend
npm install
npm run dev

# Start frontend (Terminal 2)
cd root
npm install
npm start

# Test health (Terminal 3)
curl http://localhost:3001/health

# Test order creation
curl -X POST http://localhost:3001/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"amount":299}'
```

---

## ✨ Final Verification

After completing integration:

```
✅ Backend running on port 3001
✅ Frontend running on port 8080 (or custom)
✅ .env configured with keys
✅ API endpoints accessible
✅ Test payment successful
✅ Order verified in backend
✅ No console errors
✅ Ready for production!
```

---

**All set! Your store is now fully functional with payments!** 🎉

Next step: See `BACKEND_DEPLOYMENT.md` to deploy to production.
