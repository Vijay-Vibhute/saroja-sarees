import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface SignupProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function Signup({ onClose, onSwitchToLogin }: SignupProps) {
  const { signup } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('signup.passwordMismatch', 'Passwords do not match'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('signup.passwordLength', 'Password must be at least 6 characters'));
      return;
    }

    setLoading(true);

    try {
      await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.phone || undefined
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        
        <h2 className="modal-title">{t('signup.title', 'Create Your Account')}</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">{t('signup.name', 'Full Name')}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder={t('signup.namePlaceholder', 'Enter your full name')}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('signup.email', 'Email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder={t('signup.emailPlaceholder', 'Enter your email')}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">{t('signup.phone', 'Phone Number (Optional)')}</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t('signup.phonePlaceholder', 'Enter your phone number')}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('signup.password', 'Password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder={t('signup.passwordPlaceholder', 'At least 6 characters')}
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('signup.confirmPassword', 'Confirm Password')}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder={t('signup.confirmPasswordPlaceholder', 'Re-enter password')}
              disabled={loading}
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('signup.creatingAccount', 'Creating account...') : t('signup.submit', 'Sign Up')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('signup.haveAccount', 'Already have an account?')}{' '}
            <button 
              type="button" 
              className="link-button" 
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              {t('signup.loginLink', 'Login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
