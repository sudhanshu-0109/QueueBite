/* ============================================
   SMART CANTEEN – Authentication
   ============================================ */

const Auth = (() => {
  'use strict';

  /** Simple hash (base64) – not secure, demo only */
  function hashPassword(plain) {
    return btoa(plain);
  }

  function verifyPassword(plain, hashed) {
    return btoa(plain) === hashed;
  }

  /** Generate a random session ID */
  function generateSessionId() {
    return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
  }

  /** Login */
  function login(username, password, role) {
    const users = Storage.load('sc_users', []);
    const user = users.find(u => u.username === username && u.role === role);

    if (!user) return { success: false, message: 'User not found for this role' };
    if (!verifyPassword(password, user.password)) {
      return { success: false, message: 'Incorrect password' };
    }

    // Create session
    const sessionId = generateSessionId();
    Storage.setCookie('canteen_session', sessionId, 7);
    Storage.setCookie('user_role', user.role, 7);
    Storage.save('sc_currentSession', { sessionId, userId: user.id, role: user.role });

    return { success: true, user };
  }

  /** Get current user */
  function getCurrentUser() {
    const session = Storage.load('sc_currentSession', null);
    if (!session) return null;

    const cookieSession = Storage.getCookie('canteen_session');
    if (!cookieSession || cookieSession !== session.sessionId) {
      logout();
      return null;
    }

    const users = Storage.load('sc_users', []);
    return users.find(u => u.id === session.userId) || null;
  }

  /** Check if logged in */
  function isLoggedIn() {
    return getCurrentUser() !== null;
  }

  /** Get current role */
  function getRole() {
    const user = getCurrentUser();
    return user ? user.role : null;
  }

  /** Logout */
  function logout() {
    Storage.remove('sc_currentSession');
    Storage.deleteCookie('canteen_session');
    Storage.deleteCookie('user_role');
    Storage.sessionRemove('sc_cart');
  }

  /** Update user profile */
  function updateUser(userId, updates) {
    const users = Storage.load('sc_users', []);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    users[idx] = { ...users[idx], ...updates };
    Storage.save('sc_users', users);
    return true;
  }

  return { login, logout, getCurrentUser, isLoggedIn, getRole, updateUser, hashPassword };
})();
