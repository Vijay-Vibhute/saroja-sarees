# Ratnaprabha Backend Server

Express.js backend server for Razorpay payment integration.

## 📋 Overview

This backend handles:
- ✅ Creating Razorpay orders
- ✅ Verifying payment signatures (HMAC-SHA256)
- ✅ Managing order lifecycle
- ✅ Secure payment processing

## 🚀 Quick Start

### 1. Setup

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` file:
```bash
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

Get keys from: https://dashboard.razorpay.com/app/settings/api-keys

### 3. Development

```bash
# Development (with auto-reload)
npm run dev

# Build TypeScript
npm run build

# Production
npm run start
```

Server runs on `http://localhost:3001`

## 📡 API Endpoints

### 1. Health Check
```
GET /health
```
Check if server is running.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### 2. Create Order
```
POST /api/orders/create
```

**Request Body:**
```json
{
  "amount": 1299,
  "currency": "INR",
  "receipt": "order_123",
  "notes": {
    "product_id": "s1",
    "product_title": "Red Silk Saree",
    "customer_email": "user@example.com"
  }
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "order": {
    "id": "order_DBJOWzybf0sJbb",
    "entity": "order",
    "amount": 129900,
    "amount_paid": 0,
    "amount_due": 129900,
    "currency": "INR",
    "receipt": "order_123",
    "status": "created",
    "attempts": 0,
    "notes": {...},
    "created_at": 1234567890
  }
}
```

**Response (Error - 400/500):**
```json
{
  "success": false,
  "error": "Invalid amount",
  "details": "Amount must be greater than 0"
}
```

### 3. Verify Payment
```
POST /api/orders/verify
```

**Request Body:**
```json
{
  "razorpay_order_id": "order_DBJOWzybf0sJbb",
  "razorpay_payment_id": "pay_DBJOWzybf0sJbb",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response (Success):**
```json
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

**Response (Invalid Signature):**
```json
{
  "success": false,
  "error": "Payment signature verification failed"
}
```

### 4. Get Payment Details (Optional)
```
GET /api/payments/:payment_id
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "pay_DBJOWzybf0sJbb",
    "entity": "payment",
    "amount": 129900,
    "currency": "INR",
    "status": "captured",
    "method": "card",
    ...
  }
}
```

## 🔐 Security Features

### HMAC Signature Verification
✅ Implements HMAC-SHA256 signature verification
✅ Prevents payment tampering
✅ Validates all incoming payments

### Environment Variables
✅ Sensitive data in `.env` (not committed)
✅ RAZORPAY_KEY_SECRET never exposed
✅ Different credentials for test/live

### CORS
✅ Restrict origin to frontend URL
✅ Configurable in `.env`

### Logging
✅ Request logging on all endpoints
✅ Error logging with details
✅ Production-ready error handling

## 🧪 Testing with cURL

### Test Order Creation
```bash
curl -X POST http://localhost:3001/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1299,
    "currency": "INR",
    "notes": {
      "product_id": "test_product"
    }
  }'
```

### Test Payment Verification
```bash
curl -X POST http://localhost:3001/api/orders/verify \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_DBJOWzybf0sJbb",
    "razorpay_payment_id": "pay_DBJOWzybf0sJbb",
    "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
  }'
```

## 🗄️ Database Integration (Optional)

To save orders, add database code in the verify endpoint:

```typescript
// After successful verification:
await db.orders.create({
  razorpay_order_id,
  razorpay_payment_id,
  status: 'verified',
  created_at: new Date(),
})
```

Supported databases:
- PostgreSQL (recommended)
- MongoDB
- MySQL
- SQLite

## 📧 Email Notifications (Optional)

Send confirmation emails:

```typescript
// After successful verification:
await sendEmail({
  to: customer_email,
  subject: 'Order Confirmed',
  template: 'order-confirmation',
  data: { order_id, payment_id }
})
```

## 🚀 Deployment

### Heroku
```bash
git push heroku main
heroku config:set RAZORPAY_KEY_ID=... RAZORPAY_KEY_SECRET=...
```

### AWS Lambda
```bash
# Use Serverless Framework or AWS SAM
serverless deploy
```

### DigitalOcean App Platform
```bash
# Connect GitHub repo and deploy
# Set environment variables in dashboard
```

### Azure App Service
```bash
# Deploy via Azure CLI
az webapp up --name your-app-name
# Set environment variables via Azure Portal
```

## 📝 Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| RAZORPAY_KEY_ID | Yes | rzp_test_abc123 |
| RAZORPAY_KEY_SECRET | Yes | your_secret_key |
| PORT | No | 3001 |
| NODE_ENV | No | development |
| FRONTEND_URL | No | http://localhost:8080 |
| DATABASE_URL | No | postgresql://... |

## 🔥 Production Checklist

- [ ] Use LIVE Razorpay keys (not test)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Setup database connection
- [ ] Enable request logging
- [ ] Setup error tracking (Sentry)
- [ ] Setup monitoring/alerts
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Setup database backups
- [ ] Test payment flow
- [ ] Document API for frontend team

## 🐛 Troubleshooting

### "Invalid Razorpay Key"
- Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
- Restart server after changing .env
- Use test mode keys for testing

### "CORS Error"
- Check FRONTEND_URL in .env
- Ensure frontend URL matches exactly
- Include credentials: true in frontend fetch

### "Signature Verification Failed"
- Verify RAZORPAY_KEY_SECRET is correct
- Check signature calculation logic
- Ensure order and payment IDs match

### "Order Creation Failed"
- Check amount is > 0
- Verify Razorpay credentials
- Check network connectivity
- Enable server logs for details

## 📚 Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Razorpay Order API](https://razorpay.com/docs/api/orders/)
- [Razorpay Payment API](https://razorpay.com/docs/api/payments/)

## 📞 Support

Issues? Check:
1. Server logs (bottom of console)
2. Razorpay dashboard for payment status
3. .env file configuration
4. CORS settings
5. Network connectivity

## 📄 License

MIT

---

**Ready to start?**
```bash
npm install
npm run dev
```

Server will start on http://localhost:3001 🚀
