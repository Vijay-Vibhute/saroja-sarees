import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface UserProfileProps {
  onClose: () => void;
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { user, updateProfile, logout } = useAuth();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile(formData.name, formData.phone || undefined);
      setSuccess(t('profile.updateSuccess', 'Profile updated successfully!'));
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        
        <h2 className="modal-title">{t('profile.title', 'My Profile')}</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {!isEditing ? (
          <div className="profile-view">
            <div className="profile-field">
              <label>{t('profile.name', 'Name')}</label>
              <p>{user?.name}</p>
            </div>

            <div className="profile-field">
              <label>{t('profile.email', 'Email')}</label>
              <p>{user?.email}</p>
            </div>

            <div className="profile-field">
              <label>{t('profile.phone', 'Phone')}</label>
              <p>{user?.phone || t('profile.notProvided', 'Not provided')}</p>
            </div>

            <div className="profile-actions">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                {t('profile.edit', 'Edit Profile')}
              </button>
              
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleLogout}
              >
                {t('profile.logout', 'Logout')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">{t('profile.name', 'Name')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">{t('profile.phone', 'Phone Number')}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="profile-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? t('profile.saving', 'Saving...') : t('profile.save', 'Save Changes')}
              </button>
              
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user?.name || '',
                    phone: user?.phone || '',
                  });
                }}
                disabled={loading}
              >
                {t('profile.cancel', 'Cancel')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
