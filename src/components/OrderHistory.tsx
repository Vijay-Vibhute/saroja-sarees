import React, { useState, useEffect } from 'react';
import { useAuth, getAuthToken } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface OrderHistoryProps {
  onClose: () => void;
}

interface OrderItem {
  id: number;
  product_id: string;
  product_title: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  order_number: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  items: OrderItem[];
}

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export default function OrderHistory({ onClose }: OrderHistoryProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
        return 'status-success';
      case 'pending':
        return 'status-pending';
      case 'failed':
      case 'cancelled':
        return 'status-error';
      default:
        return 'status-default';
    }
  };

  const getDeliveryInfo = (order: Order) => {
    const created = new Date(order.created_at);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const eta = new Date(created);
    eta.setDate(eta.getDate() + 5);

    let phase: string;
    if (order.status.toLowerCase() === 'cancelled') {
      phase = 'This order was cancelled.';
    } else if (order.status.toLowerCase() === 'failed') {
      phase = 'Payment failed. No delivery is scheduled.';
    } else if (diffDays <= 0) {
      phase = 'Order confirmed. We are preparing your items.';
    } else if (diffDays === 1 || diffDays === 2) {
      phase = 'Packed and handed over to our delivery partner.';
    } else if (diffDays === 3 || diffDays === 4) {
      phase = 'In transit. Your order is on the way.';
    } else {
      phase = 'Out for delivery or delivered recently.';
    }

    const etaText = eta.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return { phase, etaText };
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content order-history-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        
        <h2 className="modal-title">{t('orders.title', 'Order History')}</h2>
        
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-spinner">
            <p>{t('orders.loading', 'Loading orders...')}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p>{t('orders.empty', 'You have no orders yet')}</p>
            <button className="btn btn-primary" onClick={onClose}>
              {t('orders.startShopping', 'Start Shopping')}
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>{t('orders.orderNumber', 'Order')} #{order.order_number}</h3>
                    <p className="order-date">{formatDate(order.created_at)}</p>
                  </div>
                  
                  <div className="order-status-badges">
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                    <span className={`status-badge ${getStatusBadgeClass(order.payment_status)}`}>
                      {order.payment_status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <div className="order-item-details">
                        <p className="order-item-title">{item.product_title}</p>
                        <p className="order-item-quantity">
                          {t('orders.quantity', 'Qty')}: {item.quantity}
                        </p>
                      </div>
                      <p className="order-item-price">
                        ₹{item.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <strong>{t('orders.total', 'Total')}:</strong>
                    <strong className="order-total-amount">
                      ₹{order.total_amount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  
                  {order.razorpay_payment_id && (
                    <p className="order-payment-id">
                      {t('orders.paymentId', 'Payment ID')}: {order.razorpay_payment_id}
                    </p>
                  )}

                  <button
                    type="button"
                    className="order-status-toggle"
                    onClick={() =>
                      setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                    }
                  >
                    {expandedOrderId === order.id
                      ? t('orders.hideStatus', 'Hide Delivery Status')
                      : t('orders.viewStatus', 'View Delivery Status')}
                  </button>
                  {expandedOrderId === order.id && (() => {
                    const info = getDeliveryInfo(order);
                    return (
                      <div className="order-delivery-status">
                        <p className="order-delivery-phase">{info.phase}</p>
                        <p className="order-delivery-eta">
                          {t('orders.eta', 'Estimated arrival')}: <strong>{info.etaText}</strong>
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
