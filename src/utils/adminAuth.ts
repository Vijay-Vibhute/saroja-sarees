// Simple admin authentication utility
// In production, use proper backend authentication

const ADMIN_PASSWORD = 'admin123'; // Default password - change in production
const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const adminAuth = {
  login: (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      const token = {
        timestamp: Date.now(),
        expires: Date.now() + ADMIN_SESSION_DURATION,
      };
      localStorage.setItem(ADMIN_TOKEN_KEY, JSON.stringify(token));
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) return false;
    
    try {
      const parsed = JSON.parse(token);
      if (Date.now() > parsed.expires) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },
};
