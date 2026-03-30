# 🚀 Backend Setup Guide

Complete guide to deploy your backend server with working Razorpay endpoints.

## 📋 Overview

You now have a complete Express.js backend with:
- ✅ Order creation endpoint
- ✅ Payment verification endpoint
- ✅ HMAC signature verification
- ✅ Error handling
- ✅ CORS configured
- ✅ Request logging
- ✅ Production-ready code

---

## Part 1: LOCAL DEVELOPMENT (15 minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

Expected output: `added X packages`

### Step 2: Get Razorpay Keys

1. Open https://dashboard.razorpay.com
2. Click "Settings" in sidebar
3. Click "API Keys"
4. Copy your **Key ID** (starts with `rzp_test_`)
5. Copy your **Key Secret**
6. Keep these secure!

### Step 3: Configure Environment

Create/update `backend/.env`:
```
RAZORPAY_KEY_ID=rzp_test_your_actual_key
RAZORPAY_KEY_SECRET=your_actual_secret
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

### Step 4: Start Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3001
📝 Environment: development
💳 Razorpay Mode: TEST

📚 Available endpoints:
   GET  /health
   POST /api/orders/create
   POST /api/orders/verify
   GET  /api/payments/:payment_id
```

✅ **Backend is running!**

### Step 5: Test Local Connection

In a new terminal, test the health endpoint:
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

---

## Part 2: CONNECT FRONTEND (5 minutes)

### Update Frontend URL

The frontend should already have the correct URL if running on `http://localhost:8080`.

Check `src/utils/razorpay.ts`:
```typescript
const response = await fetch('/api/orders/create', ...)
// This uses relative URLs (good for same origin)
// For different ports, update to:
const response = await fetch('http://localhost:3001/api/orders/create', ...)
```

### Test Payment Flow

1. Open store: http://localhost:8080
2. Click "Buy Now"
3. Fill checkout form
4. Click "Pay"
5. Razorpay modal opens
6. Use test card: **4111 1111 1111 1111**
7. Any future expiry date
8. Any 3-digit CVV
9. Click Pay
10. Should see success ✅

---

## Part 3: PRODUCTION DEPLOYMENT (30-60 minutes)

### Choose Your Platform

#### Option A: Heroku (Easiest - Free tier available)
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set RAZORPAY_KEY_ID=rzp_test_...
heroku config:set RAZORPAY_KEY_SECRET=...

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Option B: DigitalOcean App Platform
1. Push code to GitHub
2. Connect GitHub repo on DO
3. Set environment variables
4. Deploy
5. Ready!

#### Option C: AWS Lambda (Serverless)
```bash
# Using Serverless Framework
npm install -g serverless
serverless create --template aws-nodejs-typescript
serverless deploy

# Set environment variables via AWS console
```

#### Option D: Azure App Service
```bash
# Using Azure CLI
az login
az webapp up --name your-app-name --runtime node
# Set variables via Azure Portal
```

### Heroku Step-by-Step

1. **Create Heroku Account**
   - Visit https://heroku.com
   - Sign up free

2. **Install Heroku CLI**
   ```bash
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   # Or use: choco install heroku-cli
   
   # Verify
   heroku --version
   ```

3. **Login to Heroku**
   ```bash
   heroku login
   ```

4. **Create App**
   ```bash
   cd backend
   heroku create ratnaprabha-backend
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set RAZORPAY_KEY_ID=rzp_live_your_key_id
   heroku config:set RAZORPAY_KEY_SECRET=your_live_key_secret
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://your-frontend-domain.com
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **View Logs**
   ```bash
   heroku logs --tail
   ```

8. **Your backend URL**
   ```
   https://ratnaprabha-backend.herokuapp.com
   ```

### Update Frontend URL

After deployment, update frontend to use new backend URL:

In `src/utils/razorpay.ts`:
```typescript
// Before (local)
const response = await fetch('/api/orders/create', ...)

// After (production)
const response = await fetch('https://ratnaprabha-backend.herokuapp.com/api/orders/create', ...)
```

Or use environment variable:
```typescript
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'
const response = await fetch(`${BACKEND_URL}/api/orders/create`, ...)
```

---

## Part 4: SWITCH TO LIVE KEYS

⚠️ **IMPORTANT: Only do this after testing everything!**

### Get Live Keys

1. In Razorpay Dashboard, switch from TEST to LIVE mode
2. Copy LIVE Key ID (starts with `rzp_live_`)
3. Copy LIVE Key Secret

### Update Backend Environment

```
# OLD (Test)
RAZORPAY_KEY_ID=rzp_test_abc123
RAZORPAY_KEY_SECRET=test_secret

# NEW (Live)
RAZORPAY_KEY_ID=rzp_live_abc123
RAZORPAY_KEY_SECRET=live_secret
```

### Redeploy

```bash
# For Heroku
heroku config:set RAZORPAY_KEY_ID=rzp_live_...
heroku config:set RAZORPAY_KEY_SECRET=...

# For others, update .env and redeploy
```

---

## Testing Checklist

Before going live:

- [ ] Backend starts without errors
- [ ] Health check works: `curl /health`
- [ ] Order creation works: can create orders
- [ ] Payment verification works: test card payment
- [ ] Signature verification works: payment is marked verified
- [ ] Frontend connects to backend
- [ ] Frontend can complete payment
- [ ] Orders appear in Razorpay dashboard
- [ ] No console errors (frontend or backend)

---

## Troubleshooting

### Backend won't start
```
Error: Cannot find module 'razorpay'
Solution: npm install
```

### Port 3001 already in use
```
Error: listen EADDRINUSE :::3001
Solution: Kill process on port 3001
# Windows: netstat -ano | findstr :3001 → taskkill /PID <PID>
# Mac/Linux: lsof -i :3001 → kill -9 <PID>
```

### CORS Error from frontend
```
Error: Access to XMLHttpRequest blocked by CORS
Solution: Check FRONTEND_URL in .env matches your frontend exactly
```

### Invalid Razorpay Keys
```
Error: Invalid Razorpay Keys
Solution: 
- Verify keys from dashboard
- Restart server after updating .env
- Use test mode keys (rzp_test_)
```

### Payment verification fails
```
Error: Signature verification failed
Solution:
- Check RAZORPAY_KEY_SECRET is correct
- Verify order_id and payment_id match
- Check no typos in signature
```

---

## File Structure

```
backend/
├── src/
│   └── index.ts           ← Main server file
├── .env                   ← Configuration (gitignored)
├── .env.example          ← Template
├── .gitignore            ← Git ignore file
├── package.json          ← Dependencies
├── tsconfig.json         ← TypeScript config
├── README.md             ← Full documentation
├── QUICK_START.md        ← Quick setup
└── BACKEND_SETUP.md      ← This file
```

---

## API Response Examples

### Successful Order Creation
```
Status: 201
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

### Successful Payment Verification
```
Status: 200
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "order_id": "order_DBJOWzybf0sJbb",
    "payment_id": "pay_DBJOWzybf0sJbb",
    "verified_at": "2026-02-18T10:30:00Z"
  }
}
```

---

## Production Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Heroku account created
- [ ] Heroku app created
- [ ] Environment variables set (live keys)
- [ ] Backend deployed
- [ ] Health check works on live URL
- [ ] Payment endpoint works
- [ ] Verification endpoint works
- [ ] Frontend updated with new URL
- [ ] End-to-end payment test completed
- [ ] Orders visible in Razorpay dashboard
- [ ] Error handling tested
- [ ] Logs being captured

---

## Next Steps

1. **Start backend**: `npm run dev`
2. **Test locally**: Complete payment flow
3. **Deploy**: Push to Heroku/cloud
4. **Update frontend**: Point to production backend
5. **Test live**: Real payment (with test card first)
6. **Go live**: Switch to live keys

---

## Support Resources

| Need | Link |
|------|------|
| Razorpay Docs | https://razorpay.com/docs/ |
| Express.js | https://expressjs.com/ |
| Heroku | https://devcenter.heroku.com/ |
| TypeScript | https://www.typescriptlang.org/ |

---

## Summary

✅ Backend server created
✅ Two endpoints implemented (/create, /verify)
✅ HMAC verification configured
✅ Ready for local development
✅ Ready for production deployment

**You're all set!** 🚀

Next: Start backend with `npm run dev` and test!
