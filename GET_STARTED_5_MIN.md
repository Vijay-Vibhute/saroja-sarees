# 📍 GET STARTED IN 5 MINUTES

Complete step-by-step guide to get your backend running.

---

## Step 1️⃣: Install Dependencies (2 minutes)

Open terminal and navigate to backend:
```bash
cd backend
npm install
```

You'll see it installing packages. When done:
```
added XX packages in X.XXs
```

✅ **Dependencies installed**

---

## Step 2️⃣: Get Razorpay Keys (2 minutes)

1. Open browser: https://dashboard.razorpay.com
2. Click **Settings** in left sidebar
3. Click **API Keys**
4. You'll see two keys:
   - **Key ID** (starts with `rzp_test_...`)
   - **Key Secret** (long random string)
5. Copy both (you'll need them in 30 seconds)

✅ **Keys copied**

---

## Step 3️⃣: Configure Environment (1 minute)

Open `backend/.env` file and update:

```
RAZORPAY_KEY_ID=rzp_test_abc123...      # Test key
RAZORPAY_KEY_SECRET=your_secret...      # Test secret
FRONTEND_URL=http://localhost:3000      # Your local frontend
PORT=3001
NODE_ENV=development
```

Example of what it looks like:
```
RAZORPAY_KEY_ID=rzp_test_abc123xyzabc
RAZORPAY_KEY_SECRET=aBcDeFgHiJkLmNoPqRsT
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

✅ **Environment configured**

---

## Step 4️⃣: Start Backend Server (Takes few seconds)

Still in the terminal, run:
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

---

## Step 5️⃣: Quick Test (10 seconds)

Open a new terminal tab and test:
```bash
curl http://localhost:3001/health
```

You should see:
```json
{"status":"OK","message":"Server is running"}
```

✅ **Backend verified working!**

---

## 🎉 You're Done!

Your backend is now running and ready for use!

### What's Running
- Backend server on `http://localhost:3001`
- API endpoints ready
- Razorpay integrated
- Test mode active

### Next Actions

#### Option A: Test Everything (5-10 minutes)
1. Keep backend running
2. Open another terminal in root folder
3. Run: `npm start` (starts frontend)
4. Open browser: `http://localhost:8080`
5. Click "Buy Now" on a product
6. Fill checkout form
7. Click "Pay Now"
8. Razorpay modal opens
9. Use test card: `4111 1111 1111 1111`
10. Any future expiry, any 3-digit CVV
11. Complete payment ✅

#### Option B: Read Documentation First
- See: `QUICK_START.md` for more details
- See: `README.md` for full documentation
- See: `BACKEND_DEPLOYMENT.md` for production

#### Option C: Deploy to Production (30 minutes)
- See: `BACKEND_DEPLOYMENT.md`
- Choose platform (Heroku recommended)
- Deploy in 3 commands

---

## 📊 At a Glance

| Component | Status | Location |
|-----------|--------|----------|
| Backend Server | ✅ Running | `http://localhost:3001` |
| Health Check | ✅ Works | `/health` endpoint |
| Order Creation | ✅ Ready | `/api/orders/create` |
| Payment Verify | ✅ Ready | `/api/orders/verify` |
| Razorpay Keys | ✅ Configured | `.env` file |
| Frontend Ready | ✅ (when you start) | `http://localhost:8080` |

---

## 🔍 Verify It's Working

### Backend Logs Should Show
```
🚀 Server running on http://localhost:3001
📝 Environment: development
💳 Razorpay Mode: TEST
// ... more setup messages
```

### Health Check Response
```bash
curl http://localhost:3001/health
# Response: {"status":"OK","message":"Server is running"}
```

### Ready Indicators
- ✅ No errors in terminal
- ✅ Server stays running
- ✅ Listening on port 3001
- ✅ Razorpay SDK loaded

---

## 🚨 If Something Goes Wrong

### Port 3001 Already in Use
```bash
# Find what's using port 3001
netstat -ano | findstr :3001

# Kill the process
taskkill /PID <number_from_above> /F

# Try again
npm run dev
```

### "Cannot find module" Error
```bash
# Stop (Ctrl+C)
# Run again
npm install
npm run dev
```

### Keys Not Working
```bash
# Make sure .env file has no spaces around =
# Correct: RAZORPAY_KEY_ID=rzp_test_abc
# Wrong: RAZORPAY_KEY_ID = rzp_test_abc

# Save and restart
npm run dev
```

### CORS Error When Testing Frontend
```bash
# Make sure FRONTEND_URL in .env matches where frontend runs
# Default: http://localhost:8080

# Restart backend
npm run dev
```

---

## 🎯 Quick Reference

| Action | Command |
|--------|---------|
| Start backend | `npm run dev` |
| Stop backend | `Ctrl + C` |
| Test health | `curl http://localhost:3001/health` |
| Rebuild | `npm run build` |
| Start production | `npm start` |

---

## 📚 What to Read Next

After getting backend running:

1. **Next 10 minutes:** Read `BACKEND_DEPLOYMENT.md` if planning to deploy
2. **Next 20 minutes:** Test full payment flow with frontend
3. **Next hour:** Go through `TESTING_INTEGRATION.md` for testing guide
4. **This week:** Deploy to production

---

## ✨ Summary

```
✅ Backend installed
✅ Environment configured
✅ Server running
✅ Razorpay connected
✅ Ready for payments!
```

### Current Status
🟢 **OPERATIONAL** - Backend ready to handle orders and payments

### Time Invested
⏱️ **5 minutes** - You're all set!

### What's Next
🚀 Either:
- Test with frontend's "Buy Now" button, or
- Deploy to production, or
- Read more documentation

---

## 🎊 Congratulations!

Your Razorpay payment backend is now active! 

**The backend will stay running** in this terminal. Keep it open while testing or developing.

To work on other things, open new terminal tabs/windows.

---

## 📞 Quick Help

**Is the backend working?**
- Check terminal shows "🚀 Server running"
- Test: `curl http://localhost:3001/health`
- Should show JSON response

**Do I need to restart frontend?**
- Yes, after changing `.env` in root folder
- Change backend `.env`? No restart needed (already running)

**Can I have multiple terminals open?**
- Yes! Keep backend in one, frontend in another, testing in third

**What if I restart my computer?**
- Just run `cd backend && npm run dev` again

---

## 🎯 Next: Frontend Integration

When ready to test payments:

1. **In root folder**, create/update `.env`:
```
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key
```

2. **In new terminal**:
```bash
npm start
```

3. **Wait for** "Compiled successfully"

4. **Open** http://localhost:8080 in browser

5. **Click "Buy Now"** and test payment

**See `FRONTEND_INTEGRATION.md` for complete integration guide**

---

**🎉 Your backend is ready! Enjoy! 🚀**

**Still here? Great! Next steps:**
- ✅ Keep backend running (don't close this terminal)
- ✅ Open new terminal for frontend
- ✅ Test payment flow
- ✅ Read deployment guide when ready

Questions? Check `QUICK_REFERENCE.md` or other docs in `backend/` folder!
