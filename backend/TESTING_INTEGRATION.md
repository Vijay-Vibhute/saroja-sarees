# 🧪 Backend Testing & Frontend Integration Guide

Complete guide to test and integrate the backend with your React frontend.

---

## Part 1: TESTING THE BACKEND LOCALLY

### 1.1 Start the Backend

```bash
cd backend
npm install        # If not done yet
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:3001
📝 Environment: development
💳 Razorpay Mode: TEST
```

Keep this terminal open.

---

### 1.2 Test Health Endpoint

Open a new terminal:

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

✅ **Health check passed**

---

### 1.3 Test Order Creation Endpoint

Create a test order (1299 rupees = ₹12.99):

```bash
curl -X POST http://localhost:3001/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1299
  }'
```

Expected response:
```json
{
  "success": true,
  "order": {
    "id": "order_DBJOWzybf0sJbb",
    "amount": 129900,
    "currency": "INR",
    "status": "created"
  }
}
```

✅ **Order creation working**

📝 Note the `order.id` - you'll use this for verification.

---

### 1.4 Test Payment Verification Endpoint

For this test, we need:
1. A real payment ID from Razorpay
2. The HMAC signature

**Quick test with dummy data:**

```bash
curl -X POST http://localhost:3001/api/orders/verify \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_DBJOWzybf0sJbb",
    "razorpay_payment_id": "pay_DBJOWzybf0sJbb",
    "razorpay_signature": "test_signature"
  }'
```

Expected response (will fail verification, that's OK):
```json
{
  "success": false,
  "error": "Signature verification failed"
}
```

✅ **Verification endpoint working**

---

### 1.5 Full End-to-End Test (Frontend)

1. **Start frontend**
   ```bash
   # New terminal
   npm start
   ```

2. **Navigate to homepage**
   - Open http://localhost:8080
   - You should see products

3. **Click "Buy Now"** on a product
   - Checkout modal opens

4. **Fill checkout form**
   ```
   Name: Test User
   Email: test@example.com
   Phone: 9999999999
   Address: 123 Test Street
   ```

5. **Click "Pay Now"**
   - Razorpay modal opens

6. **Use test card**
   ```
   Card Number: 4111 1111 1111 1111
   Expiry: Any future date (e.g., 12/25)
   CVV: Any 3 digits (e.g., 123)
   Name: Test User
   ```

7. **Complete payment**
   - Should see success message ✅
   - Backend log should show verification success
   - Order should appear in Razorpay dashboard

---

## Part 2: FRONTEND INTEGRATION

### 2.1 Current Setup

Your frontend already has Razorpay integration in `src/utils/razorpay.ts`.

The key function:
```typescript
export async function createRazorpayOrder(amount: number) {
  const response = await fetch('/api/orders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });
  
  const data = await response.json();
  return data.order;
}
```

**This uses relative URLs** - so it looks for `/api/orders/create` on the same host.

---

### 2.2 Configuration for Local Development

When running both frontend and backend locally:
- Frontend: http://localhost:8080 (or port from `npm start`)
- Backend: http://localhost:3001

**Problem:** They're on different ports, so relative URLs won't work.

**Solution:** Update frontend to use absolute backend URL.

Edit `src/utils/razorpay.ts`:

**Find this:**
```typescript
const response = await fetch('/api/orders/create', {
```

**Replace with:**
```typescript
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
const response = await fetch(`${BACKEND_URL}/api/orders/create`, {
```

**Also update the verify endpoint:**

**Find this:**
```typescript
const verifyResponse = await fetch('/api/orders/verify', {
```

**Replace with:**
```typescript
const verifyResponse = await fetch(`${BACKEND_URL}/api/orders/verify`, {
```

---

### 2.3 Setup Environment Variable

Create/update `.env` in project root:

```
REACT_APP_BACKEND_URL=http://localhost:3001
```

Now restart frontend:
```bash
npm start
```

Webpack will pick up the environment variable.

---

### 2.4 Verify Frontend Backend Connection

In browser DevTools (F12), open Console and test:

```javascript
fetch('http://localhost:3001/health')
  .then(r => r.json())
  .then(console.log)
```

Should print:
```json
{ status: 'OK', message: 'Server is running' }
```

✅ **Frontend can reach backend**

---

## Part 3: TROUBLESHOOTING

### Issue: "Cannot POST /api/orders/create"

**Cause:** Backend not running or wrong URL

**Fix:**
1. Check backend is running: `npm run dev` in backend folder
2. Check URL: Should be http://localhost:3001
3. Check .env: `REACT_APP_BACKEND_URL` should match

---

### Issue: "Cross-Origin Request Blocked (CORS)"

**Cause:** Frontend and backend on different origins

**Fix:** CORS is already configured in backend, but verify:

In `backend/src/index.ts`, check:
```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
```

Update `backend/.env`:
```
FRONTEND_URL=http://localhost:8080
```

---

### Issue: "Payment verification failed"

**Cause:** Invalid Razorpay keys or signature mismatch

**Fix:**
1. Verify you have test keys in `.env` (not live keys)
2. Check `RAZORPAY_KEY_SECRET` is correct
3. Restart backend: `npm run dev`

---

### Issue: Razorpay modal won't open

**Cause:** Script not loaded or Razorpay keys missing

**Fix:**
1. Check `src/utils/razorpay.ts` loadRazorpayScript() function
2. Verify Razorpay script loads (DevTools Network tab)
3. Check frontend env has REACT_APP_RAZORPAY_KEY_ID

---

### Issue: "Port 3001 already in use"

**Cause:** Another process using port 3001

**Fix - Windows:**
```powershell
netstat -ano | findstr :3001
# Get PID from output
taskkill /PID <PID> /F
```

**Fix - Mac/Linux:**
```bash
lsof -i :3001
kill -9 <PID>
```

---

## Part 4: MONITORING & DEBUGGING

### 4.1 Backend Logs

When running `npm run dev`, you'll see logs like:

```
GET /health - 200 - 1.23ms
POST /api/orders/create - 201 - 456ms
  └─ Amount: 1299, Order ID: order_abc123
POST /api/orders/verify - 200 - 234ms
  └─ Payment verified ✓
```

---

### 4.2 Frontend DevTools

Open browser DevTools (F12):

**Network tab:**
- See all API calls to backend
- Check response status (200, 201, 400, 500)
- View request/response JSON

**Console tab:**
- See any errors
- Manually test: `fetch('http://localhost:3001/health').then(r=>r.json()).then(console.log)`

---

### 4.3 Razorpay Dashboard

Go to https://dashboard.razorpay.com:

1. **Test Mode** - See test orders/payments
2. **Payments** section - See all transactions
3. **Settings > API Keys** - Verify your keys
4. **Webhooks** (optional) - Setup real-time notifications

---

## Part 5: ADVANCED SETUP

### 5.1 Environment Variables Summary

**Frontend (.env)**
```
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_RAZORPAY_KEY_ID=rzp_test_abc123
```

**Backend (.env)**
```
RAZORPAY_KEY_ID=rzp_test_abc123
RAZORPAY_KEY_SECRET=rzp_test_secret_xyz
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

---

### 5.2 Production Configuration

When deploying:

**Backend .env (Production)**
```
RAZORPAY_KEY_ID=rzp_live_abc123
RAZORPAY_KEY_SECRET=rzp_live_secret_xyz
PORT=3000 (or provided by platform)
NODE_ENV=production
FRONTEND_URL=https://your-store.com
```

**Frontend .env (Production)**
```
REACT_APP_BACKEND_URL=https://your-api.herokuapp.com
REACT_APP_RAZORPAY_KEY_ID=rzp_live_abc123
```

---

### 5.3 Database Integration (Optional)

Backend code includes comments for database integration:

In `backend/src/index.ts`, after verification:
```typescript
// TODO: Save order to database
// const savedOrder = await db.orders.create({
//   razorpay_order_id: razorpay_order_id,
//   razorpay_payment_id: razorpay_payment_id,
//   amount: req.body.amount,
//   customer_name: req.body.customer_name,
//   verified_at: new Date()
// });
```

To use:
1. Install database package: `npm install postgres` or `npm install mongodb`
2. Create connection in `src/db.ts`
3. Uncomment and update the database save code

---

## Part 6: TESTING SCENARIOS

### Scenario 1: Successful Payment
1. Start both frontend and backend
2. Complete checkout with test card
3. Verify success message appears
4. Check Razorpay dashboard shows the order

---

### Scenario 2: Failed Payment
1. In Razorpay modal, try invalid card: 4000 0000 0000 0002
2. Should see error message
3. Try again with valid test card

---

### Scenario 3: Verify Signature
1. Complete payment successfully
2. Check backend logs show "✓ Payment verified"
3. If using database, order should be saved

---

### Scenario 4: Multiple Products
1. Add multiple products to cart
2. Verify total amount calculation
3. Complete payment with combined amount
4. Verify Razorpay order amount is correct

---

## Part 7: PERFORMANCE CHECKLIST

- [ ] API responses < 500ms
- [ ] Razorpay modal opens instantly
- [ ] No unnecessary API calls
- [ ] Error messages clear and helpful
- [ ] Loading states visible
- [ ] No console errors
- [ ] No memory leaks
- [ ] Backend logs clean

---

## Summary

✅ Backend tested locally  
✅ Frontend integrated with backend  
✅ Payment flow working  
✅ Verification working  
✅ Ready for production  

**Next Step:** Deploy to production platform (Heroku, etc.)

See `BACKEND_DEPLOYMENT.md` for deployment instructions.
