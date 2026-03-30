# Backend Setup - 5 Minutes

Complete backend setup in 5 minutes.

## Step 1: Install (1 min)

```bash
cd backend
npm install
```

## Step 2: Get Razorpay Keys (2 min)

1. Visit https://dashboard.razorpay.com/app/settings/api-keys
2. Copy TEST keys (for development)
3. Save them

## Step 3: Configure .env (1 min)

Edit `backend/.env`:
```
RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_secret_key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

## Step 4: Start Server (1 min)

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3001
💳 Razorpay Mode: TEST
```

## Done! ✅

Your backend is live!

### Test It

```bash
curl http://localhost:3001/health
# Should return: {"status":"OK","message":"Server is running"}
```

### Next Steps

1. Update frontend to point to `http://localhost:3001`
2. Test order creation: Click "Buy Now" in store
3. Complete test payment with card: `4111 1111 1111 1111`
4. See success confirmation

## 📊 Endpoints Ready

- `POST /api/orders/create` - Create payment orders
- `POST /api/orders/verify` - Verify payment signatures
- `GET /health` - Health check

## 🚀 For Production

Replace TEST keys with LIVE keys in `.env`:
```
RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_secret_key
NODE_ENV=production
```

---

**That's it! Backend is ready!** 🎉
