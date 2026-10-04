/* ============================================
   SMART CANTEEN – Storage Layer
   localStorage / sessionStorage / Cookies
   ============================================ */

const Storage = (() => {
  'use strict';

  /* ---------- Feature Detection ---------- */
  function isAvailable(type) {
    try {
      const s = window[type];
      const k = '__sc_test__';
      s.setItem(k, '1');
      s.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }

  const hasLocal = isAvailable('localStorage');
  const hasSession = isAvailable('sessionStorage');

  if (!hasLocal) {
    console.warn('localStorage unavailable – data will not persist.');
  }

  /* ---------- localStorage Wrappers ---------- */
  function load(key, fallback = null) {
    if (!hasLocal) return fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.error(`Storage.load('${key}') failed:`, e);
      return fallback;
    }
  }

  function save(key, value) {
    if (!hasLocal) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Storage.save('${key}') failed:`, e);
      return false;
    }
  }

  function remove(key) {
    if (!hasLocal) return;
    localStorage.removeItem(key);
  }

  /* ---------- sessionStorage Wrappers ---------- */
  function sessionLoad(key, fallback = null) {
    if (!hasSession) return fallback;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.error(`Storage.sessionLoad('${key}') failed:`, e);
      return fallback;
    }
  }

  function sessionSave(key, value) {
    if (!hasSession) return false;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Storage.sessionSave('${key}') failed:`, e);
      return false;
    }
  }

  function sessionRemove(key) {
    if (!hasSession) return;
    sessionStorage.removeItem(key);
  }

  /* ---------- Cookie Wrappers ---------- */
  function setCookie(name, value, days = 7) {
    if (window.location.protocol === 'file:') {
      sessionSave('cookie_' + name, value);
      return;
    }
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  }

  function getCookie(name) {
    if (window.location.protocol === 'file:') {
      return sessionLoad('cookie_' + name);
    }
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  function deleteCookie(name) {
    if (window.location.protocol === 'file:') {
      sessionRemove('cookie_' + name);
      return;
    }
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
  }

  /* ---------- Cross-Tab Sync ---------- */
  const listeners = new Map();

  function onStorageChange(callback) {
    const handler = (e) => {
      if (e.storageArea !== localStorage) return;
      callback(e.key, e.newValue ? JSON.parse(e.newValue) : null, e.oldValue ? JSON.parse(e.oldValue) : null);
    };
    window.addEventListener('storage', handler);
    return handler;
  }

  function offStorageChange(handler) {
    window.removeEventListener('storage', handler);
  }

  /* ---------- Seed Data Init ---------- */
  function initSeedData() {
    if (!load('sc_users')) {
      save('sc_users', SEED_USERS);
    }
    if (!load('sc_menu')) {
      save('sc_menu', SEED_MENU);
    }
    if (!load('sc_orders')) {
      save('sc_orders', []);
    }
    if (!load('sc_queue')) {
      save('sc_queue', []);
    }
    if (!load('sc_ratings')) {
      save('sc_ratings', []);
    }
    if (!load('sc_settings')) {
      save('sc_settings', SEED_SETTINGS);
    }
    if (!load('sc_profiles')) {
      const profiles = {};
      SEED_USERS.forEach(u => {
        profiles[u.id] = { ...DEFAULT_PROFILE };
      });
      save('sc_profiles', profiles);
    }
    // Token counter: {date: 'YYYY-MM-DD', counter: 0}
    if (!load('sc_tokenCounter')) {
      save('sc_tokenCounter', { date: new Date().toISOString().slice(0, 10), counter: 0 });
    }
    // Counter states
    if (!load('sc_counters')) {
      const settings = load('sc_settings', SEED_SETTINGS);
      const counters = [];
      for (let i = 1; i <= settings.counters; i++) {
        counters.push({ id: i, status: 'idle', currentOrder: null, startedAt: null });
      }
      save('sc_counters', counters);
    }
  }

  /* ---------- Reset ---------- */
  function resetAll() {
    if (!hasLocal) return;
    const keys = ['sc_users', 'sc_menu', 'sc_orders', 'sc_queue', 'sc_ratings',
      'sc_profiles', 'sc_tokenCounter', 'sc_counters', 'sc_settings'];
    keys.forEach(k => localStorage.removeItem(k));
    if (hasSession) {
      sessionStorage.removeItem('sc_cart');
      sessionStorage.removeItem('sc_filters');
      sessionStorage.removeItem('sc_checkoutDraft');
    }
    initSeedData();
  }

  /* ---------- Helper: escape HTML ---------- */
  function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return {
    load, save, remove,
    sessionLoad, sessionSave, sessionRemove,
    setCookie, getCookie, deleteCookie,
    onStorageChange, offStorageChange,
    initSeedData, resetAll,
    escapeHTML,
    hasLocal, hasSession
  };
})();
