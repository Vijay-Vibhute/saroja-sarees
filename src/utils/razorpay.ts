import { RazorpayOrderData, RazorpayOrderResponse, CheckoutFormData } from '../types/sanity';

/**
 * Load Razorpay script from CDN
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

/**
 * Initialize Razorpay checkout modal
 */
export const initializeRazorpay = async (
  orderData: RazorpayOrderData,
  formData: CheckoutFormData,
  onSuccess: (response: any) => void,
  onError: (error: any) => void
): Promise<void> => {
  // Load Razorpay script if not already loaded
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    onError(new Error('Failed to load Razorpay'));
    return;
  }

  // Get Razorpay key from environment
  const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;
  if (!razorpayKey) {
    onError(new Error('Razorpay Key ID not configured'));
    return;
  }

  // Create Razorpay options
  const options = {
    key: razorpayKey,
    amount: orderData.amount, // Amount in paise
    currency: orderData.currency || 'INR',
    name: process.env.REACT_APP_SHOP_NAME || 'Saroja-Saree\'s',
    description: `Purchase - ${orderData.notes?.product_title || 'Products'}`,
    order_id: orderData.receipt, // This should be the order ID from your backend
    prefill: {
      name: formData.fullName,
      email: formData.email,
      contact: formData.phone,
    },
    notes: {
      ...orderData.notes,
      customer_address: formData.address,
      customer_city: formData.city,
      customer_state: formData.state,
      customer_postal_code: formData.postalCode,
    },
    theme: {
      color: '#dc2626', // Red color matching the brand
    },
    handler: (response: any) => {
      onSuccess(response);
    },
    modal: {
      ondismiss() {
        onError(new Error('Payment cancelled by user'));
      },
    },
  };

  // Open Razorpay checkout
  const razorpay = new (window as any).Razorpay(options);
  razorpay.open();
};

/**
 * Create order on backend (call your API)
 * Note: This assumes you have a backend endpoint to create Razorpay orders
 */
export const createRazorpayOrder = async (
  amount: number,
  notes?: Record<string, any>
): Promise<RazorpayOrderResponse> => {
  try {
    // Use backend URL from environment
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        notes,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Razorpay order');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Verify payment on backend
 * Note: This assumes you have a backend endpoint to verify payments
 */
export const verifyPayment = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Use backend URL from environment
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/orders/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

/**
 * Calculate total price for cart
 */
export const calculateTotal = (items: Array<{ price: number; qty: number }>): number => {
  return items.reduce((total, item) => total + item.price * item.qty, 0);
};

/**
 * Format price for display
 */
export const formatPrice = (price: number, currency: string = '₹'): string => {
  return `${currency}${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};
