/**
 * EXAMPLE BACKEND ENDPOINTS FOR RAZORPAY
 * 
 * This file shows example endpoints for creating and verifying Razorpay orders.
 * You can use these with Express.js, Node.js, or any backend framework.
 * 
 * These endpoints should be implemented in your backend server.
 */

// ============================================
// EXPRESS.JS EXAMPLE
// ============================================

/*
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const app = express();
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
app.post('/api/orders/create', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount), // Amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Verify Payment
app.post('/api/orders/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment verified successfully
      // Save order to database
      // Send confirmation email
      // etc.

      res.json({
        success: true,
        message: 'Payment verified successfully',
        order_id: razorpay_order_id,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
*/

// ============================================
// NODE.JS / VIA LAMBDA FUNCTION EXAMPLE
// ============================================

/*
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// CreateOrder Function
export const createOrder = async (amount, currency = 'INR', receipt, notes) => {
  try {
    const options = {
      amount: Math.round(amount), // in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);
    return {
      statusCode: 200,
      body: JSON.stringify(order),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// VerifyPayment Function
export const verifyPayment = async (orderId, paymentId, signature) => {
  try {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === signature) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Payment verified',
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Invalid signature',
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
*/

// ============================================
// PYTHON / FLASK EXAMPLE
// ============================================

/*
from flask import Flask, request, jsonify
from razorpay import Client
import hmac
import hashlib
import os

app = Flask(__name__)

razorpay_client = Client(
    auth=(os.getenv('RAZORPAY_KEY_ID'), os.getenv('RAZORPAY_KEY_SECRET'))
)

@app.route('/api/orders/create', methods=['POST'])
def create_order():
    try:
        data = request.json
        amount = data.get('amount')
        currency = data.get('currency', 'INR')
        receipt = data.get('receipt', f'receipt_{int(time.time())}')
        notes = data.get('notes', {})

        if not amount or amount <= 0:
            return jsonify({'error': 'Invalid amount'}), 400

        order = razorpay_client.order.create({
            'amount': int(amount),
            'currency': currency,
            'receipt': receipt,
            'notes': notes
        })

        return jsonify(order), 200
    except Exception as error:
        return jsonify({'error': str(error)}), 500

@app.route('/api/orders/verify', methods=['POST'])
def verify_payment():
    try:
        data = request.json
        order_id = data.get('razorpay_order_id')
        payment_id = data.get('razorpay_payment_id')
        signature = data.get('razorpay_signature')

        # Verify signature
        body = f'{order_id}|{payment_id}'
        expected_signature = hmac.new(
            os.getenv('RAZORPAY_KEY_SECRET').encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()

        if expected_signature == signature:
            return jsonify({
                'success': True,
                'message': 'Payment verified successfully',
                'order_id': order_id
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid payment signature'
            }), 400
    except Exception as error:
        return jsonify({
            'success': False,
            'message': str(error)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=3001)
*/

// ============================================
// SETUP INSTRUCTIONS
// ============================================

/*
1. Install Razorpay SDK:
   - Node.js: npm install razorpay
   - Python: pip install razorpay
   - Go: go get github.com/razorpay/razorpay-go

2. Set Environment Variables:
   - RAZORPAY_KEY_ID: Your Razorpay Key ID
   - RAZORPAY_KEY_SECRET: Your Razorpay Key Secret

3. Get Keys from Razorpay Dashboard:
   - Sign up at https://dashboard.razorpay.com
   - Navigate to Settings > API Keys
   - Copy your Key ID and Key Secret
   - Save them securely in your backend environment

4. Create Orders:
   - POST to /api/orders/create with amount in paise
   - Returns order object with order_id

5. Verify Payments:
   - POST to /api/orders/verify with payment details
   - Verify HMAC signature for security
   - Save verified orders to database

6. Important Security Notes:
   - Always verify signatures on backend
   - Never expose key_secret on frontend
   - Use HTTPS in production
   - Implement rate limiting on API endpoints
   - Log all transactions for auditing
*/

export {};
