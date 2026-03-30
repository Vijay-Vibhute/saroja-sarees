import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '../data/products';
import { useAuth } from '../context/AuthContext';

type CartItem = { id: string; qty: number };
type PaymentMethod = 'razorpay' | 'whatsapp';

type Props = {
  cartItems: CartItem[];
  products: Product[];
  total: number;
  onBack: () => void;
  onSuccess?: () => void;
};

export default function Checkout({ cartItems, products, total, onBack, onSuccess }: Props) {
  const { t, i18n } = useTranslation();
  const { token, user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = formData.name && formData.email && formData.phone && formData.address && formData.city && formData.zip;

  const getCartSummary = () => {
    let summary = 'Saroja-Saree\'s Order:\n\n';
    cartItems.forEach((item) => {
      const product = products.find((p) => p.id === item.id);
      if (product) {
        const name = product.name[i18n.language as 'en' | 'hi' | 'mr'] || product.name.en;
        summary += `• ${name} x${item.qty} = ₹${product.price * item.qty}\n`;
      }
    });
    summary += `\n*Total: ₹${total}*\n`;
    summary += `\nCustomer: ${formData.name}\nPhone: ${formData.phone}\nAddress: ${formData.address}, ${formData.city} ${formData.zip}`;
    return summary;
  };

  const createOrder = async (): Promise<{ id: string; amount: number } | null> => {
    try {
      // Step 1: Create Razorpay order with just the amount
      const response = await fetch(`${API_URL}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const data = await response.json();
      return { id: data.order.id, amount: total };
    } catch (error) {
      console.error('Error creating order:', error);
      setMessage({ type: 'error', text: 'Failed to create order. Please try again.' });
      return null;
    }
  };

  const handleRazorpayPayment = async () => {
    if (!isFormValid) {
      setMessage({ type: 'error', text: 'Please fill in all customer details' });
      return;
    }

    if (!token || !user) {
      setMessage({ type: 'error', text: 'Please login to place an order' });
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      // Create order on backend
      const order = await createOrder();
      if (!order) {
        setIsProcessing(false);
        return;
      }

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || '',
          amount: order.amount * 100, // Amount in paise
          currency: 'INR',
          name: 'Saroja-Saree\'s',
          description: `Order for ${formData.name}`,
          order_id: order.id,
          handler: async (response: any) => {
            // Verify payment on backend
            try {
              const orderItems = cartItems.map(item => {
                const product = products.find(p => p.id === item.id);
                return {
                  product_id: item.id,
                  name: product?.name.en || 'Product',
                  quantity: item.qty,
                  price: product?.price || 0
                };
              });

              const verifyResponse = await fetch(`${API_URL}/api/orders/verify`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  user_id: user?.id,
                  amount: total,
                  items: orderItems,
                }),
              });

              if (verifyResponse.ok) {
                if (onSuccess) {
                  onSuccess();
                }
              } else {
                const errorData = await verifyResponse.json();
                setMessage({
                  type: 'error',
                  text:
                    errorData.error ||
                    'Payment verification failed. Please contact support.',
                });
              }
            } catch (error) {
              console.error('Verification error:', error);
              setMessage({ type: 'error', text: 'Payment verification error. Please try again.' });
            }
            setIsProcessing(false);
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#dc2626'
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              setMessage({ type: 'error', text: 'Payment cancelled. Please try again.' });
            }
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error('Payment error:', error);
      setMessage({ type: 'error', text: 'Payment failed. Please try again.' });
      setIsProcessing(false);
    }
  };

  const handleWhatsAppCheckout = () => {
    if (!isFormValid) {
      setMessage({ type: 'error', text: 'Please fill in all customer details' });
      return;
    }
    const message = getCartSummary();
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/917507100140?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleUpiCheckout = () => {
    // Deprecated manual UPI flow; keep Razorpay and WhatsApp only
    setMessage({ type: 'error', text: 'UPI via Razorpay is available under the Razorpay option above.' });
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="btn-back" onClick={onBack}>
          ← Back to Cart
        </button>
        <h2>Checkout</h2>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`checkout-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="checkout-layout">
        {/* Customer Details */}
        <div className="checkout-section">
          <h3>Customer Details</h3>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="10-digit phone number"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              placeholder="Street address"
              rows={2}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleFormChange}
                placeholder="City"
                required
              />
            </div>
            <div className="form-group">
              <label>ZIP Code *</label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleFormChange}
                placeholder="ZIP code"
                required
              />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="checkout-section">
          <h3>Payment Method</h3>
          <div className="payment-methods">
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="razorpay"
                checked={paymentMethod === 'razorpay'}
                onChange={() => setPaymentMethod('razorpay')}
              />
              <span className="payment-label">💳 Razorpay (Secure)</span>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="whatsapp"
                checked={paymentMethod === 'whatsapp'}
                onChange={() => setPaymentMethod('whatsapp')}
              />
              <span className="payment-label">💬 WhatsApp Order</span>
            </label>
          </div>

          {/* Razorpay Payment */}
          {paymentMethod === 'razorpay' && (
            <div className="payment-details">
              <h4>Secure Payment via Razorpay</h4>
              <p className="info-text">
                Click the button below to proceed with secure Razorpay payment. You can use all major credit cards, debit cards, netbanking, and UPI inside the Razorpay window.
              </p>
              <button
                className="btn-pay"
                onClick={handleRazorpayPayment}
                disabled={!isFormValid || isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${total} Securely`}
              </button>
            </div>
          )}

          {/* WhatsApp Order */}
          {paymentMethod === 'whatsapp' && (
            <div className="payment-details">
              <h4>Order via WhatsApp</h4>
              <p className="info-text">
                Click the button below to send your order details to WhatsApp. Our team will contact you shortly to confirm payment and delivery details.
              </p>
              <div className="whatsapp-info">
                <span>📱 WhatsApp: +91 7507100140</span>
              </div>
              <button
                className="btn-whatsapp"
                onClick={handleWhatsAppCheckout}
                disabled={!isFormValid}
              >
                💬 Send Order on WhatsApp @ +91 7507100140
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cartItems.map((item) => {
              const product = products.find((p) => p.id === item.id);
              if (!product) return null;
              const name = product.name[i18n.language as 'en' | 'hi' | 'mr'] || product.name.en;
              return (
                <div key={item.id} className="summary-item">
                  <span>{name} x{item.qty}</span>
                  <span>₹{product.price * item.qty}</span>
                </div>
              );
            })}
          </div>
          <div className="summary-total">
            <strong>Total Amount</strong>
            <strong>₹{total}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
