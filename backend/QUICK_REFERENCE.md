# ⚡ Backend Quick Reference

Essential commands and information you'll need daily.

---

## 🚀 Daily Commands

### Start Development Backend
```bash
cd backend
npm run dev
```
✅ Server runs on `http://localhost:3001`

### Stop Backend
```bash
Ctrl + C
```

---

## 📋 Configuration Quick Checklist

### Before First Start
```
✅ Run: npm install
✅ Create/edit: backend/.env
✅ Add RAZORPAY_KEY_ID=rzp_test_...
✅ Add RAZORPAY_KEY_SECRET=...
✅ Add FRONTEND_URL=http://localhost:8080
✅ Run: npm run dev
```

### Environment Variables
```
RAZORPAY_KEY_ID        # From Razorpay dashboard
RAZORPAY_KEY_SECRET    # From Razorpay dashboard
PORT                   # Default: 3001
NODE_ENV              # development or production
FRONTEND_URL          # Where frontend is running
```

---

## 🔗 API Quick Reference

### Test Backend Health
```bash
curl http://localhost:3001/health
```
Response:
```json
{ "status": "OK", "message": "Server is running" }
```

### Create Order
```bash
curl -X POST http://localhost:3001/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"amount": 1299}'
```

### Verify Payment
```bash
curl -X POST http://localhost:3001/api/orders/verify \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_id_here",
    "razorpay_payment_id": "payment_id_here",
    "razorpay_signature": "signature_here"
  }'
```

---

## 🧪 Test Card Numbers

### For Testing
- **Number:** 4111 1111 1111 1111
- **Expiry:** Any future date (e.g., 12/25)
- **CVV:** Any 3 digits (e.g., 123)

### Test Outcomes
- Any card works in test mode
- Payment always succeeds
- Check backend logs for verification

---

## 🐛 Quick Troubleshooting

### Backend Won't Start
```
Error: Cannot find module 'razorpay'
→ Solution: npm install
```

### Port 3001 in Use
```
Error: EADDRINUSE :::3001
→ Windows: netstat -ano | findstr :3001, then taskkill /PID <PID>
→ Mac/Linux: lsof -i :3001, then kill -9 <PID>
```

### CORS Error
```
Error: Access blocked by CORS
→ Check: FRONTEND_URL in .env
→ Restart: npm run dev
```

### Keys Not Working
```
Error: Invalid Razorpay Keys
→ Verify: rzp_test_ prefix (test mode)
→ Check: No extra spaces in .env
→ Restart: npm run dev
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Main server (all code here!) |
| `.env` | Your secrets (don't commit!) |
| `.env.example` | Template for .env |
| `package.json` | Dependencies |
| `tsconfig.json` | TypeScript config |

---

## 🔒 Security Reminders

- ✅ **DO:** Commit `.env.example`
- ❌ **DON'T:** Commit `.env` with real keys
- ✅ **DO:** Use test keys first (`rzp_test_`)
- ✅ **DO:** Keep `RAZORPAY_KEY_SECRET` secret
- ❌ **DON'T:** Share .env file
- ✅ **DO:** Use environment variables

---

## 🚢 Deployment Quick Steps

### Heroku (Recommended)
```bash
heroku login
heroku create your-app-name
heroku config:set RAZORPAY_KEY_ID=rzp_live_...
heroku config:set RAZORPAY_KEY_SECRET=...
git push heroku main
```

### Others
- **DigitalOcean:** Connect GitHub, deploy
- **AWS Lambda:** Serverless framework, deploy
- **Azure:** az webapp up
- **Render:** Connect GitHub, deploy

See `BACKEND_DEPLOYMENT.md` for details.

---

## 🧠 How It Works (60 seconds version)

```
1. User clicks "Pay"
   ↓
2. Frontend calls POST /api/orders/create
   ↓
3. Backend creates Razorpay order, returns order ID
   ↓
4. Frontend opens Razorpay modal with order ID
   ↓
5. User enters card, clicks Pay
   ↓
6. Razorpay processes, returns payment result
   ↓
7. Frontend calls POST /api/orders/verify
   ↓
8. Backend verifies signature with HMAC-SHA256
   ↓
9. If signature matches: payment is legit ✓
   If not: payment is fake ✗
   ↓
10. Backend returns success/fail
    ↓
11. Frontend shows success message
```

---

## 📊 Performance Tips

- Backend responds in < 500ms
- Use test mode for development
- Check logs for slow requests
- Razorpay charges small fee (~2%)

---

## 🎯 Production Checklist

Before going live:

- [ ] Backend deployed
- [ ] Live Razorpay keys configured
- [ ] FRONTEND_URL points to production
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Test payment completed
- [ ] Order appears in dashboard
- [ ] No console errors
- [ ] Error logging setup (optional)

---

## 📞 Need Help?

| Need | Document |
|------|----------|
| First time setup | `QUICK_START.md` |
| Step-by-step guide | `README.md` |
| Deployment | `BACKEND_DEPLOYMENT.md` |
| Testing & integration | `TESTING_INTEGRATION.md` |
| Full overview | `START_HERE.md` |

---

## ✨ Key Achievements

✅ Backend complete
✅ Razorpay integrated
✅ Payment verification working
✅ Type-safe throughout
✅ Production-ready
✅ Well-documented
✅ Easy to deploy

---

**Start with:** `npm run dev`

**Test with:** Test card 4111 1111 1111 1111

**Deploy with:** `git push heroku main` (after setup)

**Questions?** Check the docs in `backend/` folder!
