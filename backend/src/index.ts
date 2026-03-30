import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { userQueries, addressQueries, wishlistQueries, orderQueries } from './db.js';
import { hashPassword, comparePassword, generateToken, authenticateToken, isValidEmail, isValidPassword, AuthRequest } from './auth.js';
import { fetchSanityProducts } from './sanity.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Type definitions
interface CreateOrderRequest extends Request {
  body: {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: Record<string, any>;
  };
}

interface VerifyPaymentRequest extends Request {
  body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    user_id?: number;
    amount?: number;
    items?: Array<{
      product_id: string;
      quantity: number;
      price: number;
      name: string;
    }>;
  };
}

// ===========================
// ROUTES
// ===========================

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

/**
 * Fetch products from Sanity (used by frontend to avoid CORS issues)
 */
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const products = await fetchSanityProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('❌ Error fetching products from Sanity (backend):', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products from Sanity',
    });
  }
});

/**
 * Create Razorpay Order
 * POST /api/orders/create
 * Body: { amount (in rupees), currency (optional), receipt (optional), notes (optional) }
 */
app.post('/api/orders/create', async (req: CreateOrderRequest, res: Response) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid amount. Amount must be greater than 0.',
      });
      return;
    }

    console.log(`📦 Creating order for amount: ₹${amount}`);

    // Create order with Razorpay
    const option = {
      amount: Math.round(amount * 100), // Convert to paise (₹1 = 100 paise)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(option);

    console.log(`✅ Order created: ${order.id}`);

    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        entity: order.entity,
        amount: order.amount,
        amount_paid: order.amount_paid,
        amount_due: order.amount_due,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        attempts: order.attempts,
        notes: order.notes,
        created_at: order.created_at,
      },
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Verify Payment
 * POST /api/orders/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
app.post('/api/orders/verify', async (req: VerifyPaymentRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields for verification',
      });
      return;
    }

    console.log(`🔍 Verifying payment: ${razorpay_payment_id}`);

    // Verify signature using HMAC-SHA256
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    const isValidSignature = expectedSignature === razorpay_signature;

    console.log(`📋 Signature verification:`);
    console.log(`   Body: ${body}`);
    console.log(`   Expected: ${expectedSignature.substring(0, 20)}...`);
    console.log(`   Received: ${razorpay_signature.substring(0, 20) || 'EMPTY'}...`);
    console.log(`   Match: ${isValidSignature ? '✅ YES' : '❌ NO'}`);

    if (!isValidSignature) {
      console.error('❌ Invalid signature - Verification failed');
      res.status(400).json({
        success: false,
        error: 'Payment signature verification failed',
        debug: {
          bodyUsed: body,
          expectedSigStart: expectedSignature.substring(0, 20),
          receivedSigStart: razorpay_signature?.substring(0, 20)
        }
      });
      return;
    }

    console.log(`✅ Payment verified: ${razorpay_payment_id}`);

    // Save order to database
    const { user_id, amount, items } = req.body;
    
    if (user_id && amount) {
      try {
        // Create order record
        const orderResult = orderQueries.create(
          user_id,
          razorpay_order_id,
          razorpay_payment_id,
          amount,
          'paid'
        );
        const orderId = orderResult.lastInsertRowid as number;

        // Add order items if provided
        if (items && items.length > 0) {
          for (const item of items) {
            orderQueries.addItem(
              orderId,
              item.product_id,
              item.quantity,
              item.price,
              item.name
            );
          }
        }

        console.log(`💾 Order saved to database: ID ${orderId}`);
      } catch (dbError) {
        console.error('⚠️ Warning: Failed to save order to database:', dbError);
        // Continue even if database save fails
      }
    }

    // Send confirmation email (optional)
    // await sendConfirmationEmail(customer)

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        verified_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Get Payment Details (optional - for debugging)
 * GET /api/payments/:payment_id
 */
app.get('/api/payments/:payment_id', async (req: Request, res: Response) => {
  try {
    const { payment_id } = req.params;

    const payment = await razorpay.payments.fetch(payment_id);

    res.json({
      success: true,
      payment: {
        id: payment.id,
        entity: payment.entity,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        description: payment.description,
        amount_refunded: payment.amount_refunded,
        refund_status: payment.refund_status,
        captured: payment.captured,
        card_id: payment.card_id,
        bank: payment.bank,
        wallet: payment.wallet,
        vpa: payment.vpa,
        email: payment.email,
        contact: payment.contact,
        notes: payment.notes,
        fee: payment.fee,
        tax: payment.tax,
        error_code: payment.error_code,
        error_description: payment.error_description,
        error_source: payment.error_source,
        error_step: payment.error_step,
        error_reason: payment.error_reason,
        acquirer_data: payment.acquirer_data,
        created_at: payment.created_at,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

/**
 * User Signup
 * POST /api/auth/signup
 */
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validate input
    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
      return;
    }

    if (!isValidPassword(password)) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
      return;
    }

    // Check if user already exists
    const existingUser = userQueries.getByEmail(email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = userQueries.create(email, hashedPassword, name, phone);
    const userId = result.lastInsertRowid as number;

    // Generate JWT token
    const token = generateToken({
      userId,
      email,
      name,
    });

    console.log(`✅ New user created: ${email} (ID: ${userId})`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: {
          id: userId,
          email,
          name,
          phone,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create account',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * User Login
 * POST /api/auth/login
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    // Get user
    const user = userQueries.getByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Update last login
    userQueries.updateLastLogin(user.id);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    console.log(`✅ User logged in: ${email} (ID: ${user.id})`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error logging in:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Get User Profile
 * GET /api/auth/profile
 */
app.get('/api/auth/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = userQueries.getById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        created_at: user.created_at,
        last_login: user.last_login,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Update User Profile
 * PUT /api/auth/profile
 */
app.put('/api/auth/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, phone } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: 'Name is required',
      });
      return;
    }

    userQueries.update(userId, name, phone);

    console.log(`✅ Profile updated for user ID: ${userId}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        name,
        phone,
      },
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// ADDRESS ROUTES
// ============================================

/**
 * Get User Addresses
 * GET /api/addresses
 */
app.get('/api/addresses', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const addresses = addressQueries.getByUserId(userId);

    res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error('❌ Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch addresses',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Add New Address
 * POST /api/addresses
 */
app.post('/api/addresses', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { full_name, phone, address, city, state, postal_code, is_default } = req.body;

    if (!full_name || !phone || !address || !city || !state || !postal_code) {
      res.status(400).json({
        success: false,
        error: 'All address fields are required',
      });
      return;
    }

    const result = addressQueries.create(
      userId,
      full_name,
      phone,
      address,
      city,
      state,
      postal_code,
      is_default || 0
    );

    const addressId = result.lastInsertRowid as number;

    console.log(`✅ Address added for user ID: ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: {
        id: addressId,
      },
    });
  } catch (error) {
    console.error('❌ Error adding address:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add address',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Delete Address
 * DELETE /api/addresses/:id
 */
app.delete('/api/addresses/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const addressId = parseInt(req.params.id);

    addressQueries.delete(userId, addressId);

    console.log(`✅ Address ${addressId} deleted for user ID: ${userId}`);

    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting address:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete address',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// WISHLIST ROUTES
// ============================================

/**
 * Get User Wishlist
 * GET /api/wishlist
 */
app.get('/api/wishlist', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const wishlist = wishlistQueries.getByUserId(userId);

    res.json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error('❌ Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wishlist',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Add to Wishlist
 * POST /api/wishlist
 */
app.post('/api/wishlist', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { product_id } = req.body;

    if (!product_id) {
      res.status(400).json({
        success: false,
        error: 'Product ID is required',
      });
      return;
    }

    const result = wishlistQueries.add(userId, product_id);

    console.log(`✅ Product ${product_id} added to wishlist for user ID: ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Added to wishlist',
      data: {
        id: result.lastInsertRowid,
      },
    });
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add to wishlist',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Remove from Wishlist
 * DELETE /api/wishlist/:productId
 */
app.delete('/api/wishlist/:productId', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const productId = req.params.productId;

    wishlistQueries.remove(userId, productId);

    console.log(`✅ Product ${productId} removed from wishlist for user ID: ${userId}`);

    res.json({
      success: true,
      message: 'Removed from wishlist',
    });
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove from wishlist',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// ORDER ROUTES
// ============================================

/**
 * Get User Order History
 * GET /api/orders
 */
app.get('/api/orders', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const orders = orderQueries.getByUserId(userId);

    // Get items for each order
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: orderQueries.getOrderItems(order.id),
    }));

    res.json({
      success: true,
      data: ordersWithItems,
    });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`💳 Razorpay Mode: ${process.env.RAZORPAY_KEY_ID?.includes('test') ? 'TEST' : 'LIVE'}`);
  console.log(`\n📚 Available endpoints:`);
  console.log(`\n💳 Payment:`);
  console.log(`   GET  /health`);
  console.log(`   POST /api/orders/create`);
  console.log(`   POST /api/orders/verify`);
  console.log(`   GET  /api/payments/:payment_id`);
  console.log(`\n👤 Authentication:`);
  console.log(`   POST /api/auth/signup`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/profile (protected)`);
  console.log(`   PUT  /api/auth/profile (protected)`);
  console.log(`\n📍 Addresses:`);
  console.log(`   GET    /api/addresses (protected)`);
  console.log(`   POST   /api/addresses (protected)`);
  console.log(`   DELETE /api/addresses/:id (protected)`);
  console.log(`\n💝 Wishlist:`);
  console.log(`   GET    /api/wishlist (protected)`);
  console.log(`   POST   /api/wishlist (protected)`);
  console.log(`   DELETE /api/wishlist/:productId (protected)`);
  console.log(`\n📦 Orders:`);
  console.log(`   GET  /api/orders (protected)`);
});

export default app;
