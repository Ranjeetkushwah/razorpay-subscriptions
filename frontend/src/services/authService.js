import { toast } from 'react-toastify';

class AuthService {
  // Get token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Get user from localStorage
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Set token and user in localStorage
  setAuthData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Clear auth data from localStorage
  clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Check if user is admin
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  }

  // Get current user role
  getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }

  // Logout user
  logout() {
    this.clearAuthData();
    toast.success('Logged out successfully');
    window.location.href = '/login';
  }

  // Initialize auth state
  initializeAuth() {
    const token = this.getToken();
    const user = this.getUser();
    
    if (token && user) {
      return { isAuthenticated: true, user };
    }
    
    return { isAuthenticated: false, user: null };
  }
}

export default new AuthService();
