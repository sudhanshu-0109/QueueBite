/* ============================================
   SMART CANTEEN – UI Rendering Module
   ============================================ */

const UI = (() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ========== TOAST NOTIFICATIONS ========== */
  function showToast(message, type = 'info', duration = 3500) {
    const container = $('#toast-container');
    if (!container) return;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <span class="toast-msg">${Storage.escapeHTML(message)}</span>
      <button class="toast-close" aria-label="Close notification">✕</button>
    `;
    container.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
    setTimeout(() => removeToast(toast), duration);
  }

  function removeToast(el) {
    if (!el || !el.parentNode) return;
    el.classList.add('removing');
    setTimeout(() => el.remove(), 300);
  }

  /* ========== MODAL ========== */
  function showModal(title, bodyHTML, footerHTML = '') {
    const overlay = $('#modal-overlay');
    overlay.querySelector('.modal-header h3').textContent = title;
    overlay.querySelector('.modal-body').innerHTML = bodyHTML;
    overlay.querySelector('.modal-footer').innerHTML = footerHTML;
    overlay.classList.add('active');
  }

  function closeModal() {
    const overlay = $('#modal-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  /* ========== CART BADGE ========== */
  function updateCartBadge() {
    const badge = $('#cart-badge');
    if (!badge) return;
    const count = Cart.getTotalItems();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  /* ========== LOGIN SCREEN ========== */
  function renderLogin() {
    return `
    <div class="login-screen" id="login-screen">
      <div class="login-card">
        <div class="login-logo">
          <div class="logo-icon">🍽️</div>
          <h1>SMART CANTEEN</h1>
          <p>Management System</p>
        </div>
        <div class="role-selector" id="role-selector">
          <button class="role-btn active" data-role="student" type="button">🎓 Student</button>
          <button class="role-btn" data-role="kitchen" type="button">👨‍🍳 Kitchen</button>
          <button class="role-btn" data-role="admin" type="button">⚙️ Admin</button>
        </div>
        <form id="login-form">
          <div class="form-group" id="fg-username">
            <label for="login-username">Username</label>
            <input type="text" id="login-username" placeholder="Enter username" required autocomplete="username">
            <span class="error-msg" id="err-username"></span>
          </div>
          <div class="form-group" id="fg-password">
            <label for="login-password">Password</label>
            <input type="password" id="login-password" placeholder="Enter password" required autocomplete="current-password">
            <span class="error-msg" id="err-password"></span>
          </div>
          <button type="submit" class="btn btn-primary btn-block" id="login-submit">Sign In</button>
        </form>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--border);">
        <div class="demo-login-container">
          <button type="button" class="btn btn-outline btn-sm demo-login-btn" data-demo-role="student">🎓 Student</button>
          <button type="button" class="btn btn-outline btn-sm demo-login-btn" data-demo-role="kitchen">👨‍🍳 Kitchen</button>
          <button type="button" class="btn btn-outline btn-sm demo-login-btn" data-demo-role="admin">⚙️ Admin</button>
        </div>
      </div>
    </div>`;
  }

  /* ========== SIDEBAR ========== */
  function renderSidebar(role) {
    const navItems = {
      student: [
        { id: 'home', icon: '🏠', label: 'Home' },
        { id: 'menu', icon: '📋', label: 'Menu' },
        { id: 'assistant', icon: '🤖', label: 'Smart Assistant' },
        { id: 'cart-view', icon: '🛒', label: 'Cart', badge: true },
        { id: 'track', icon: '📍', label: 'Track Order' },
        { id: 'history', icon: '📜', label: 'Order History' },
        { id: 'favorites', icon: '❤️', label: 'Favorites' },
        { id: 'profile', icon: '👤', label: 'Profile' }
      ],
      kitchen: [
        { id: 'k-dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'k-queue', icon: '📋', label: 'Live Queue' },
        { id: 'k-current', icon: '🍳', label: 'Current Orders' },
        { id: 'k-ready', icon: '✅', label: 'Ready Orders' },
        { id: 'k-counters', icon: '🔢', label: 'Counters' },
        { id: 'k-scheduling', icon: '⚡', label: 'Smart Scheduling' }
      ],
      admin: [
        { id: 'a-dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'a-create-order', icon: '➕', label: 'Create Order' },
        { id: 'a-menu-manage', icon: '🍽️', label: 'Menu Management' },
        { id: 'a-orders', icon: '📦', label: 'Orders' },
        { id: 'a-users', icon: '👥', label: 'Users' },
        { id: 'a-analytics', icon: '📈', label: 'Analytics' },
        { id: 'a-settings', icon: '⚙️', label: 'Settings' }
      ]
    };

    const items = navItems[role] || [];
    const navHTML = items.map(item => `
      <button class="nav-item ${item.id === getDefaultView(role) ? 'active' : ''}" data-view="${item.id}">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
        ${item.badge ? '<span class="nav-badge" id="sidebar-cart-badge" style="display:none">0</span>' : ''}
      </button>
    `).join('');

    return `
    <div class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <h2>SMART CANTEEN</h2>
        <span>Management System</span>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-title">Main Menu</div>
        ${navHTML}
      </nav>
      <div class="sidebar-footer">
        <button class="nav-item" id="logout-btn">
          <span class="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>`;
  }

  function getDefaultView(role) {
    const defaults = { student: 'home', kitchen: 'k-dashboard', admin: 'a-dashboard' };
    return defaults[role] || 'home';
  }

  /* ========== TOP BAR ========== */
  function renderTopbar(user) {
    const waitingCount = Orders.getByStatus('waiting').length;
    let greeting = 'Welcome! Have a great day.';
    if (waitingCount > 5) greeting = "We're busy with a high volume of orders!";
    else if (waitingCount > 0) greeting = `${waitingCount} orders in queue. Things are moving smoothly.`;

    return `
    <header class="topbar" id="topbar">
      <button class="topbar-toggle" id="sidebar-toggle" aria-label="Toggle menu">☰</button>
      <div class="topbar-greeting">
        <h3>Hi, ${Storage.escapeHTML(user.name)} 👋</h3>
        <p>${greeting}</p>
      </div>
      <div class="topbar-right">
        <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">🌙</button>
        <div class="topbar-user">
          <div class="topbar-avatar">${Storage.escapeHTML(user.avatar)}</div>
          <div class="topbar-user-info">
            <div class="name">${Storage.escapeHTML(user.name)}</div>
            <div class="role">${user.role}</div>
          </div>
        </div>
      </div>
    </header>`;
  }

  /* ========== STUDENT VIEWS ========== */

  function renderStudentHome() {
    const settings = Storage.load('sc_settings', SEED_SETTINGS);
    const stats = Analytics.getDashboardStats();
    const popular = Analytics.getPopularDishes(4);
    const activeOrder = Orders.getMyActiveOrder();

    let activeOrderHTML = '';
    if (activeOrder) {
      activeOrderHTML = `
        <div class="card mb-24">
          <div class="card-header">
            <h3>📍 Active Order</h3>
            <span class="status-pill ${activeOrder.status}">${activeOrder.status}</span>
          </div>
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <div style="font-size:2rem;font-weight:700;color:var(--orange)">${activeOrder.token}</div>
                <p class="text-muted text-sm mt-8">${activeOrder.items.map(i=>`${i.emoji} ${i.name} ×${i.qty}`).join(', ')}</p>
              </div>
              <button class="btn btn-primary btn-sm" onclick="App.navigate('track')">Track Order →</button>
            </div>
          </div>
        </div>`;
    }

    return `
    <div class="view" id="view-home">
      <div class="promo-banner">
        <h2>🎉 ${Storage.escapeHTML(settings.promoBanner || "Welcome to Smart Canteen!")}</h2>
        <p>Order delicious food, skip the queue, and enjoy your meal faster.</p>
      </div>

      ${activeOrderHTML}

      <div class="stat-cards">
        <div class="stat-card highlight">
          <span class="stat-icon">📦</span>
          <div class="stat-value">${stats.totalToday}</div>
          <div class="stat-label">Orders Today</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">⏳</span>
          <div class="stat-value">${stats.waiting}</div>
          <div class="stat-label">In Queue</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">⏱️</span>
          <div class="stat-value">${stats.avgWait || '—'}</div>
          <div class="stat-label">Avg Wait (min)</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>🔥 Popular Right Now</h3>
          <button class="btn btn-sm btn-outline" onclick="App.navigate('menu')">View Menu →</button>
        </div>
        <div class="card-body">
          ${popular.length === 0 ? '<p class="text-muted text-center">No orders yet today</p>' : popular.map((f, i) => `
            <div class="popular-item">
              <span class="popular-rank ${i === 0 ? 'top' : ''}">${i + 1}</span>
              <span class="popular-thumb">${f.emoji}</span>
              <div class="popular-info">
                <h5>${Storage.escapeHTML(f.name)}</h5>
                <p>${f.todayOrders || 0} orders today · ⭐ ${f.rating}</p>
              </div>
              <span class="popular-price">₹${f.price}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
  }

  function renderMenu() {
    const menu = Storage.load('sc_menu', []);
    const categories = ['all', ...new Set(menu.map(f => f.category))];
    const filters = Storage.sessionLoad('sc_filters', { category: 'all', search: '', diet: 'all', sort: 'popular' });

    let filtered = [...menu];
    if (filters.category !== 'all') filtered = filtered.filter(f => f.category === filters.category);
    if (filters.diet !== 'all') filtered = filtered.filter(f => f.diet === filters.diet);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(f => f.name.toLowerCase().includes(s) || f.category.toLowerCase().includes(s));
    }

    switch (filters.sort) {
      case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      case 'fastest': filtered.sort((a, b) => a.prepTime - b.prepTime); break;
      default: filtered.sort((a, b) => b.popularity - a.popularity);
    }

    const catIcons = { all: '🍽️', breakfast: '🍳', lunch: '🍛', snacks: '🍔', dinner: '🌙', drinks: '☕', desserts: '🍰' };

    return `
    <div class="view" id="view-menu">
      <h2 class="mb-16" style="font-size:1.3rem;font-weight:700">Menu</h2>

      <div class="category-chips" id="menu-categories">
        ${categories.map(c => `
          <button class="chip ${filters.category === c ? 'active' : ''}" data-category="${c}">
            <span class="chip-icon">${catIcons[c] || '🍽️'}</span> ${c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        `).join('')}
      </div>

      <div class="flex gap-16 mb-24" style="flex-wrap:wrap">
        <div class="search-bar" style="flex:1;min-width:200px">
          <span class="search-icon">🔍</span>
          <input type="text" id="menu-search" placeholder="Search for an item..." value="${Storage.escapeHTML(filters.search || '')}">
        </div>
        <select class="filter-select" id="menu-diet-filter">
          <option value="all" ${filters.diet === 'all' ? 'selected' : ''}>All Diet</option>
          <option value="veg" ${filters.diet === 'veg' ? 'selected' : ''}>🟢 Veg Only</option>
          <option value="non-veg" ${filters.diet === 'non-veg' ? 'selected' : ''}>🔴 Non-Veg</option>
        </select>
        <select class="filter-select" id="menu-sort">
          <option value="popular" ${filters.sort === 'popular' ? 'selected' : ''}>Most Popular</option>
          <option value="price-low" ${filters.sort === 'price-low' ? 'selected' : ''}>Price: Low → High</option>
          <option value="price-high" ${filters.sort === 'price-high' ? 'selected' : ''}>Price: High → Low</option>
          <option value="rating" ${filters.sort === 'rating' ? 'selected' : ''}>Highest Rated</option>
          <option value="fastest" ${filters.sort === 'fastest' ? 'selected' : ''}>Fastest Prep</option>
        </select>
      </div>

      ${filtered.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No items found</h3>
          <p>Try changing your filters or search term</p>
        </div>` : `
        <div class="menu-grid" id="menu-grid">
          ${filtered.map(f => renderMenuCard(f)).join('')}
        </div>`}
    </div>`;
  }

  function renderMenuCard(food) {
    const isAvailable = food.available && food.stock > 0;
    const user = Auth.getCurrentUser();
    const profiles = Storage.load('sc_profiles', {});
    const profile = user ? profiles[user.id] : null;
    const isFav = profile && profile.favorites && profile.favorites.includes(food.id);

    return `
    <div class="menu-card ${!isAvailable ? 'unavailable' : ''}" data-food-id="${food.id}">
      ${!isAvailable ? '<span class="unavailable-badge">Unavailable</span>' : ''}
      <div class="menu-card-img-placeholder">${food.emoji || '🍽️'}</div>
      <div class="menu-card-body">
        <div class="flex items-center justify-between mb-8">
          <span class="menu-card-diet ${food.diet === 'veg' ? 'veg' : 'non-veg'}">
            ${food.diet === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
          </span>
          <button class="fav-btn ${isFav ? 'liked' : ''}" data-fav-id="${food.id}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">${isFav ? '❤️' : '🤍'}</button>
        </div>
        <div class="menu-card-name">${Storage.escapeHTML(food.name)}</div>
        ${food.isCombo ? '<span class="badge badge-orange" style="font-size:0.7rem;margin-bottom:6px">COMBO</span>' : ''}
        <div class="menu-card-meta">
          <span class="rating">⭐ ${food.rating}</span>
          <span>⏱️ ${food.prepTime} min</span>
          <span>${food.calories} cal</span>
        </div>
        <div class="menu-card-footer">
          <span class="menu-card-price">₹${food.price}</span>
          ${isAvailable ? `
            <button class="menu-card-add" data-add-id="${food.id}" title="Add to cart" aria-label="Add ${Storage.escapeHTML(food.name)} to cart">+</button>
          ` : '<span class="text-muted text-sm">Out of stock</span>'}
        </div>
        <div class="text-muted" style="font-size:0.72rem;margin-top:6px">${food.stock} left · ${food.spice} spice</div>
      </div>
    </div>`;
  }

  function renderCartView() {
    const items = Cart.getItems();
    const upsells = Recommend.getUpsellSuggestions();

    if (items.length === 0) {
      return `
      <div class="view" id="view-cart-view">
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Browse our delicious menu and add items to your cart</p>
          <button class="btn btn-primary" onclick="App.navigate('menu')">Browse Menu</button>
        </div>
      </div>`;
    }

    return `
    <div class="view" id="view-cart-view">
      <h2 class="mb-24" style="font-size:1.3rem;font-weight:700">🛒 Your Cart</h2>

      <div class="grid-sidebar-layout">
        <div>
          <div class="card mb-24">
            <div class="card-header">
              <h3>Cart Items (${Cart.getTotalItems()})</h3>
              <button class="btn btn-sm btn-outline" style="color:var(--red);border-color:var(--red)" onclick="Cart.clear();App.refreshView()">Clear All</button>
            </div>
            <div class="card-body">
              ${items.map(item => `
                <div class="cart-item" data-cart-food="${item.foodId}">
                  <div class="cart-item-img">${item.emoji}</div>
                  <div class="cart-item-info">
                    <div class="cart-item-name">${Storage.escapeHTML(item.name)}</div>
                    <div class="cart-item-price">₹${item.price} each · ${item.diet === 'veg' ? '🟢' : '🔴'}</div>
                  </div>
                  <div class="cart-qty">
                    <button onclick="Cart.updateQty('${item.foodId}', ${item.qty - 1});App.refreshView()" aria-label="Decrease quantity">−</button>
                    <span>${item.qty}</span>
                    <button onclick="Cart.updateQty('${item.foodId}', ${item.qty + 1});App.refreshView()" aria-label="Increase quantity">+</button>
                  </div>
                  <strong>₹${item.price * item.qty}</strong>
                  <button class="toast-close" onclick="Cart.removeItem('${item.foodId}');App.refreshView()" aria-label="Remove item">✕</button>
                </div>
              `).join('')}
            </div>
          </div>

          ${upsells.length > 0 ? `
          <div class="card mb-24">
            <div class="card-header"><h3>💡 You might also like</h3></div>
            <div class="card-body">
              <div class="flex gap-12" style="overflow-x:auto">
                ${upsells.map(f => `
                  <div style="min-width:140px;text-align:center;padding:12px;background:var(--bg);border-radius:var(--radius-sm)">
                    <div style="font-size:2rem">${f.emoji}</div>
                    <div style="font-size:0.82rem;font-weight:600;margin:4px 0">${Storage.escapeHTML(f.name)}</div>
                    <div style="font-size:0.82rem;color:var(--teal);font-weight:700">₹${f.price}</div>
                    <button class="btn btn-sm btn-outline mt-8" onclick="Cart.addItem('${f.id}');App.refreshView()">+ Add</button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>` : ''}
        </div>

        <div class="cart-sidebar">
          <div class="card">
            <div class="card-header"><h3>Order Summary</h3></div>
            <div class="card-body">
              <div class="cart-summary">
                <div class="cart-summary-row">
                  <span>Subtotal</span>
                  <span>₹${Cart.getTotal()}</span>
                </div>
                <div class="cart-summary-row">
                  <span>Est. Prep Time</span>
                  <span>~${Cart.getEstimatedPrepTime()} min</span>
                </div>
                <div class="cart-summary-row">
                  <span>Queue Position</span>
                  <span>#${orderQueue.size + 1}</span>
                </div>
                <div class="cart-summary-row total">
                  <span>Total</span>
                  <span>₹${Cart.getTotal()}</span>
                </div>
              </div>
              <button class="btn btn-orange btn-block mt-16" id="checkout-btn">
                Place Order 🎫
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function renderTrackOrder() {
    const activeOrder = Orders.getMyActiveOrder();

    if (!activeOrder) {
      return `
      <div class="view" id="view-track">
        <div class="empty-state">
          <div class="empty-icon">📍</div>
          <h3>No active order</h3>
          <p>Place an order from the menu to track it here</p>
          <button class="btn btn-primary" onclick="App.navigate('menu')">Order Now</button>
        </div>
      </div>`;
    }

    const statuses = ['waiting', 'preparing', 'ready', 'collected'];
    const currentIdx = statuses.indexOf(activeOrder.status);
    const icons = { waiting: '⏳', preparing: '🍳', ready: '✅', collected: '🎉' };
    const ahead = orderQueue.ordersAhead(activeOrder.id);
    const estWait = Scheduler.estimateWait(activeOrder.id);

    // Progress percentage
    let progressPct = 0;
    if (activeOrder.status === 'waiting') progressPct = 10;
    else if (activeOrder.status === 'preparing') {
      if (activeOrder.startedAt) {
        const elapsed = (Date.now() - new Date(activeOrder.startedAt).getTime()) / 60000;
        progressPct = 33 + Math.min(33, (elapsed / activeOrder.prepMinutes) * 33);
      } else {
        progressPct = 40;
      }
    } else if (activeOrder.status === 'ready') progressPct = 90;
    else if (activeOrder.status === 'collected') progressPct = 100;

    return `
    <div class="view" id="view-track">
      <div class="card mb-24">
        <div class="card-body">
          <div class="token-display">
            <div class="token-number">${activeOrder.token}</div>
            <div class="token-status">Status: ${activeOrder.status.toUpperCase()}</div>
          </div>

          <div class="status-stepper">
            ${statuses.map((s, i) => `
              ${i > 0 ? `<div class="stepper-line ${currentIdx >= i ? 'done' : ''}"></div>` : ''}
              <div class="stepper-step ${currentIdx > i ? 'done' : currentIdx === i ? 'current' : ''}">
                <div class="stepper-circle">${icons[s]}</div>
                <span class="stepper-label">${s.charAt(0).toUpperCase() + s.slice(1)}</span>
              </div>
            `).join('')}
          </div>

          <div class="progress-bar">
            <div class="progress-bar-fill" style="width:${progressPct}%"></div>
          </div>

          <div class="queue-info">
            <div class="queue-info-item">
              <div class="queue-info-value">${ahead >= 0 ? ahead : 0}</div>
              <div class="queue-info-label">People Ahead</div>
            </div>
            <div class="queue-info-item">
              <div class="queue-info-value">~${estWait}</div>
              <div class="queue-info-label">Minutes Wait</div>
            </div>
            <div class="queue-info-item">
              <div class="queue-info-value">${activeOrder.counter}</div>
              <div class="queue-info-label">Counter</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-24">
        <div class="card-header">
          <h3>Order Details</h3>
          <span class="status-pill ${activeOrder.status}">${activeOrder.status}</span>
        </div>
        <div class="card-body">
          ${activeOrder.items.map(i => `
            <div class="flex items-center justify-between" style="padding:8px 0;border-bottom:1px solid var(--border)">
              <div class="flex items-center gap-8">
                <span>${i.emoji}</span>
                <span>${Storage.escapeHTML(i.name)} × ${i.qty}</span>
              </div>
              <strong>₹${i.price * i.qty}</strong>
            </div>
          `).join('')}
          <div class="flex justify-between mt-16" style="font-size:1.05rem;font-weight:700">
            <span>Total</span>
            <span>₹${activeOrder.total}</span>
          </div>
        </div>
        ${activeOrder.status === 'waiting' ? `
          <div class="card-footer">
            <button class="btn btn-danger btn-sm" id="cancel-order-btn" data-order-id="${activeOrder.id}">Cancel Order</button>
          </div>
        ` : ''}
        ${activeOrder.status === 'ready' ? `
          <div class="card-footer">
            <button class="btn btn-success btn-block" id="collect-order-btn" data-order-id="${activeOrder.id}">✅ Collected</button>
          </div>
        ` : ''}
      </div>
    </div>`;
  }

  function renderHistory() {
    const orders = Orders.getMyOrders();
    const completed = orders.filter(o => o.status === 'collected' || o.status === 'cancelled');

    if (completed.length === 0) {
      return `
      <div class="view" id="view-history">
        <div class="empty-state">
          <div class="empty-icon">📜</div>
          <h3>No order history</h3>
          <p>Your past orders will appear here</p>
        </div>
      </div>`;
    }

    return `
    <div class="view" id="view-history">
      <h2 class="mb-24" style="font-size:1.3rem;font-weight:700">📜 Order History</h2>
      <div class="card">
        <div class="card-body">
          <ul class="order-list">
            ${completed.map(o => `
              <li class="order-item">
                <div class="order-token">${o.token}</div>
                <div class="order-info">
                  <h4>${o.items.map(i => `${i.emoji} ${i.name}×${i.qty}`).join(', ')}</h4>
                  <p>₹${o.total} · ${new Date(o.createdAt).toLocaleDateString()} at ${new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span class="status-pill ${o.status}">${o.status}</span>
                ${o.status === 'collected' && !o.rated ? `
                  <button class="btn btn-sm btn-outline" data-rate-id="${o.id}">⭐ Rate</button>
                ` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    </div>`;
  }

  function renderFavorites() {
    const user = Auth.getCurrentUser();
    const profiles = Storage.load('sc_profiles', {});
    const profile = user ? profiles[user.id] : null;
    const favIds = profile ? (profile.favorites || []) : [];
    const menu = Storage.load('sc_menu', []);
    const favItems = menu.filter(f => favIds.includes(f.id));

    if (favItems.length === 0) {
      return `
      <div class="view" id="view-favorites">
        <div class="empty-state">
          <div class="empty-icon">❤️</div>
          <h3>No favorites yet</h3>
          <p>Tap the heart icon on any menu item to save it here</p>
          <button class="btn btn-primary" onclick="App.navigate('menu')">Browse Menu</button>
        </div>
      </div>`;
    }

    return `
    <div class="view" id="view-favorites">
      <h2 class="mb-24" style="font-size:1.3rem;font-weight:700">❤️ Your Favorites</h2>
      <div class="menu-grid">
        ${favItems.map(f => renderMenuCard(f)).join('')}
      </div>
    </div>`;
  }

  function renderProfile() {
    const user = Auth.getCurrentUser();
    const profiles = Storage.load('sc_profiles', {});
    const profile = user ? profiles[user.id] : null;

    if (!user || !profile) return '<div class="view" id="view-profile"><p>Please login</p></div>';

    // Build preference bars
    const catCounts = profile.categoryCounts || {};
    const maxCat = Math.max(1, ...Object.values(catCounts));
    const catBars = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

    return `
    <div class="view" id="view-profile">
      <h2 class="mb-24" style="font-size:1.3rem;font-weight:700">👤 Profile</h2>

      <div class="grid-2">
        <div class="card">
          <div class="card-body text-center">
            <div class="topbar-avatar" style="width:72px;height:72px;font-size:1.5rem;margin:0 auto 16px">${Storage.escapeHTML(user.avatar)}</div>
            <h3>${Storage.escapeHTML(user.name)}</h3>
            <p class="text-muted">${user.role} · @${Storage.escapeHTML(user.username)}</p>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>📊 Stats</h3></div>
          <div class="card-body">
            <div class="stat-cards" style="grid-template-columns:1fr 1fr">
              <div class="stat-card">
                <div class="stat-value">${profile.totalOrders || 0}</div>
                <div class="stat-label">Total Orders</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">₹${profile.totalSpent || 0}</div>
                <div class="stat-label">Total Spent</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-24">
        <div class="card-header"><h3>🍽️ Food Preferences</h3></div>
        <div class="card-body">
          ${catBars.length === 0 ? '<p class="text-muted">Order some food to see your preferences!</p>' :
            catBars.map(([cat, count]) => `
              <div class="pref-bar-container">
                <div class="pref-bar-label">
                  <span>${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                  <span>${count} items</span>
                </div>
                <div class="pref-bar">
                  <div class="pref-bar-fill" style="width:${(count / maxCat) * 100}%"></div>
                </div>
              </div>
            `).join('')}
        </div>
      </div>
    </div>`;
  }

  /* ========== SMART ASSISTANT ========== */
  function renderAssistant() {
    return `
    <div class="view" id="view-assistant">
      <h2 class="mb-16" style="font-size:1.3rem;font-weight:700">🤖 Smart Food Assistant</h2>
      <p class="text-muted mb-24">Tell us your preferences and we'll recommend the perfect meal!</p>

      <div class="card mb-24" id="wizard-card">
        <div class="card-body">
          <div class="wizard-progress" id="wizard-progress">
            <div class="wizard-dot active" data-step="0"></div>
            <div class="wizard-dot" data-step="1"></div>
            <div class="wizard-dot" data-step="2"></div>
            <div class="wizard-dot" data-step="3"></div>
            <div class="wizard-dot" data-step="4"></div>
            <div class="wizard-dot" data-step="5"></div>
          </div>
          <div id="wizard-content"></div>
          <div class="flex justify-between mt-24">
            <button class="btn btn-outline btn-sm" id="wizard-prev" disabled>← Back</button>
            <button class="btn btn-primary btn-sm" id="wizard-next">Next →</button>
          </div>
        </div>
      </div>

      <div id="reco-results" style="display:none"></div>
    </div>`;
  }

  /* ========== KITCHEN VIEWS ========== */

  function renderKitchenDashboard() {
    const stats = Analytics.getDashboardStats();
    const insights = Scheduler.getInsights();
    const popular = Analytics.getPopularDishes(5);

    return `
    <div class="view" id="view-k-dashboard">
      <div class="promo-banner" style="background:linear-gradient(135deg, var(--teal-dark), #0E8A8F)">
        <h2>Kitchen Dashboard</h2>
        <p>${stats.waiting} orders waiting · ${stats.preparing} preparing · ${stats.ready} ready to collect</p>
      </div>

      <div class="stat-cards">
        <div class="stat-card highlight">
          <span class="stat-icon">📦</span>
          <div class="stat-value">${stats.totalToday}</div>
          <div class="stat-label">New Orders</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">✅</span>
          <div class="stat-value">${stats.completed}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">⏳</span>
          <div class="stat-value">${stats.waiting}</div>
          <div class="stat-label">Waiting</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🍳</span>
          <div class="stat-value">${stats.preparing}</div>
          <div class="stat-label">Preparing</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header"><h3>💡 Smart Insights</h3></div>
          <div class="card-body">
            ${insights.length === 0 ? '<p class="text-muted">No insights yet. Start processing orders!</p>' :
              insights.map(i => `
                <div class="insight-card">
                  <span class="insight-icon">${i.icon}</span>
                  <p>${Storage.escapeHTML(i.text)}</p>
                </div>
              `).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>🔥 Popular Dishes</h3></div>
          <div class="card-body">
            ${popular.map((f, i) => `
              <div class="popular-item">
                <span class="popular-rank ${i === 0 ? 'top' : ''}">${i + 1}</span>
                <span class="popular-thumb">${f.emoji}</span>
                <div class="popular-info">
                  <h5>${Storage.escapeHTML(f.name)}</h5>
                  <p>${f.todayOrders || 0} orders · ⭐ ${f.rating}</p>
                </div>
                <span class="popular-price">₹${f.price}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>`;
  }

  function renderKitchenQueue() {
    const queueArr = orderQueue.toArray();

    return `
    <div class="view" id="view-k-queue">
      <div class="flex items-center justify-between mb-24">
        <h2 style="font-size:1.3rem;font-weight:700">📋 Live Queue (${queueArr.length})</h2>
        <span class="text-muted text-sm">Updates in real-time</span>
      </div>

      ${queueArr.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">✨</div>
          <h3>Queue is empty!</h3>
          <p>No orders waiting. Time for a break!</p>
        </div>` : `
        <div class="card">
          <div class="card-body" style="padding:0">
            <ul class="queue-list">
              ${queueArr.map((o, i) => `
                <li class="queue-list-item">
                  <span class="q-position">${i + 1}</span>
                  <span class="q-token">${o.token}</span>
                  <div class="q-info">
                    <h5>${Storage.escapeHTML(o.userName)}</h5>
                    <p>${o.items.map(it => `${it.emoji} ${it.name}×${it.qty}`).join(', ')}</p>
                  </div>
                  <span class="q-time">~${o.prepMinutes} min · Counter ${o.counter}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>`}
    </div>`;
  }

  function renderKitchenCurrent() {
    const settings = Storage.load('sc_settings', SEED_SETTINGS);
    const counters = Storage.load('sc_counters', []);
    const orders = Orders.getAll();

    return `
    <div class="view" id="view-k-current">
      <h2 class="mb-24" style="font-size:1.3rem;font-weight:700">🍳 Current Orders by Counter</h2>

      <div class="grid-${Math.min(settings.counters, 3)}">
        ${counters.map(counter => {
          const currentOrder = counter.currentOrder ? orders.find(o => o.id === counter.currentOrder) : null;
          let timerDisplay = '--:--';
          let timerPct = 0;

          if (currentOrder && counter.startedAt) {
            const elapsed = Math.floor((Date.now() - new Date(counter.startedAt).getTime()) / 1000);
            const totalSec = currentOrder.prepMinutes * 60;
            const remaining = Math.max(0, totalSec - elapsed);
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            timerDisplay = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            timerPct = Math.min(100, (elapsed / totalSec) * 100);
          }

          return `
          <div class="counter-card">
            <div class="counter-header">
              <h4>Counter ${counter.id}</h4>
              <span class="counter-status ${counter.status}"></span>
            </div>
            <div class="counter-body">
              ${currentOrder ? `
                <div style="text-align:center">
                  <div class="order-token" style="margin:0 auto 12px;width:64px;height:64px;font-size:1rem">${currentOrder.token}</div>
                  <h4>${Storage.escapeHTML(currentOrder.userName)}</h4>
                  <p class="text-muted text-sm">${currentOrder.items.map(i => `${i.emoji}${i.name}×${i.qty}`).join(', ')}</p>
                  <div class="counter-timer" data-counter="${counter.id}" data-started="${counter.startedAt}" data-prep="${currentOrder.prepMinutes}">${timerDisplay}</div>
                  <div class="progress-bar">
                    <div class="progress-bar-fill" style="width:${timerPct}%" data-counter-progress="${counter.id}"></div>
                  </div>
                </div>
              ` : `
                <div class="text-center text-muted" style="padding:40px 0">
                  <div style="font-size:2.5rem;margin-bottom:8px">✨</div>
                  <p>No active order</p>
                </div>
              `}
            </div>
            <div class="counter-actions">
              ${currentOrder ? `
                <button class="btn btn-success btn-sm btn-block" data-mark-ready="${counter.id}">✅ Mark Ready</button>
              ` : `
                <button class="btn btn-primary btn-sm btn-block" data-start-next="${counter.id}">▶ Start Next</button>
              `}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  function renderKitchenReady() {
    const readyOrders = Orders.getByStatus('ready');

    return `
    <div class="view" id="view-k-ready">
      <h2 class="mb-24" style="font-size:1.3rem;font-weight:700">✅ Ready for Pickup (${readyOrders.length})</h2>

      ${readyOrders.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">🍽️</div>
          <h3>No ready orders</h3>
          <p>Orders will appear here when marked as ready</p>
        </div>` : `
        <div class="grid-3">
          ${readyOrders.map(o => `
            <div class="card">
              <div class="card-body text-center">
                <div class="order-token" style="margin:0 auto 12px;width:72px;height:72px;font-size:1.1rem">${o.token}</div>
                <h4>${Storage.escapeHTML(o.userName)}</h4>
                <p class="text-muted text-sm">${o.items.map(i => `${i.emoji}${i.name}`).join(', ')}</p>
                <p class="text-sm mt-8">Counter ${o.counter} · ₹${o.total}</p>
              </div>
            </div>
          `).join('')}
        </div>`}
    </div>`;
  }

  function renderKitchenCounters() {
    const settings = Storage.load('sc_settings', SEED_SETTINGS);
    const counters = Storage.load('sc_counters', []);
    const perf = Analytics.getCounterPerformance();

    return `
    <div class="view" id="view-k-counters">
      <h2 class="mb-24" style="font-size:1.3rem;font-weight:700">🔢 Counter Status</h2>

      <div class="grid-3">
        ${counters.map(c => {
          const p = perf.find(x => x.id === c.id) || {};
          return `
          <div class="card">
            <div class="card-header">
              <h4>Counter ${c.id}</h4>
              <span class="counter-status ${c.status}" title="${c.status}"></span>
            </div>
            <div class="card-body">
              <div class="stat-cards" style="grid-template-columns:1fr 1fr;gap:10px">
                <div class="stat-card" style="padding:12px">
                  <div class="stat-value" style="font-size:1.3rem">${p.totalOrders || 0}</div>
                  <div class="stat-label">Orders</div>
                </div>
                <div class="stat-card" style="padding:12px">
                  <div class="stat-value" style="font-size:1.3rem">${p.completed || 0}</div>
                  <div class="stat-label">Done</div>
                </div>
              </div>
              <p class="text-muted text-sm mt-8">Revenue: ₹${p.revenue || 0}</p>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  function renderScheduling() {
    const comparison = Scheduler.getComparison();
    const settings = Storage.load('sc_settings', SEED_SETTINGS);

    return `
    <div class="view" id="view-k-scheduling">
      <h2 class="mb-16" style="font-size:1.3rem;font-weight:700">⚡ Smart Scheduling</h2>
      <p class="text-muted mb-24">Compare FIFO and Shortest-Job-First scheduling strategies</p>

      <div class="flex items-center gap-16 mb-24">
        <span class="text-sm font-bold">Active Mode:</span>
        <div class="schedule-toggle">
          <button class="${settings.schedulingMode === 'fifo' ? 'active' : ''}" data-sched-mode="fifo">FIFO</button>
          <button class="${settings.schedulingMode === 'smart' ? 'active' : ''}" data-sched-mode="smart">Smart (SJF)</button>
        </div>
      </div>

      <div class="scheduling-compare">
        <div class="scheduling-card fifo">
          <h4>📋 FIFO (First In, First Out)</h4>
          <div class="avg-time">${comparison.fifoAvg.toFixed(1)}</div>
          <div class="unit">min avg wait</div>
        </div>
        <div class="scheduling-card smart">
          <h4>⚡ Smart (Shortest Job First)</h4>
          <div class="avg-time">${comparison.smartAvg.toFixed(1)}</div>
          <div class="unit">min avg wait</div>
          ${comparison.savings > 0 ? `<p style="color:var(--green);font-weight:600;margin-top:8px">Saves ~${comparison.savings.toFixed(1)} min</p>` : ''}
        </div>
      </div>

      <div class="grid-2 mt-24">
        <div class="card">
          <div class="card-header"><h3>FIFO Order</h3></div>
          <div class="card-body" style="padding:0">
            ${comparison.fifoOrder.length === 0 ? '<p class="text-muted text-center" style="padding:24px">Queue empty</p>' : `
              <ul class="queue-list">
                ${comparison.fifoOrder.map((o, i) => `
                  <li class="queue-list-item">
                    <span class="q-position">${i + 1}</span>
                    <span class="q-token">${o.token}</span>
                    <div class="q-info"><h5>${Storage.escapeHTML(o.userName)}</h5></div>
                    <span class="q-time">${o.prepMinutes} min</span>
                  </li>
                `).join('')}
              </ul>
            `}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>Smart Order</h3></div>
          <div class="card-body" style="padding:0">
            ${comparison.smartOrder.length === 0 ? '<p class="text-muted text-center" style="padding:24px">Queue empty</p>' : `
              <ul class="queue-list">
                ${comparison.smartOrder.map((o, i) => `
                  <li class="queue-list-item">
                    <span class="q-position">${i + 1}</span>
                    <span class="q-token">${o.token}</span>
                    <div class="q-info">
                      <h5>${Storage.escapeHTML(o.userName)}</h5>
                      ${o._aged ? '<span class="badge badge-red" style="font-size:0.65rem">AGED</span>' : ''}
                    </div>
                    <span class="q-time">${o.prepMinutes} min</span>
                  </li>
                `).join('')}
              </ul>
            `}
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ========== ADMIN VIEWS ========== */

  function renderAdminDashboard() {
    const stats = Analytics.getDashboardStats();
    const popular = Analytics.getPopularDishes(5);
    const orders = Orders.getTodayOrders().filter(o => o.status !== 'cancelled').slice(-6).reverse();
    const readyOrders = Orders.getByStatus('ready');

    return `
    <div class="view" id="view-a-dashboard">
      <div class="promo-banner">
        <h2>Administration Dashboard</h2>
        <p>Overview of today's canteen operations</p>
      </div>

      <div class="stat-cards">
        <div class="stat-card highlight">
          <span class="stat-icon">📦</span>
          <div class="stat-value">${stats.totalToday}</div>
          <div class="stat-label">New Orders</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">✅</span>
          <div class="stat-value">${stats.completed}</div>
          <div class="stat-label">Total Orders</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">⏳</span>
          <div class="stat-value">${stats.waiting + stats.preparing}</div>
          <div class="stat-label">Waiting List</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">💰</span>
          <div class="stat-value">₹${stats.revenue}</div>
          <div class="stat-label">Revenue Today</div>
        </div>
      </div>

      <div class="grid-sidebar-layout">
        <div>
          <div class="card mb-24">
            <div class="card-header">
              <h3>📋 Recent Orders</h3>
            </div>
            <div class="card-body" style="padding:0">
              ${orders.length === 0 ? '<p class="text-muted text-center" style="padding:24px">No orders today</p>' : `
                <ul class="order-list">
                  ${orders.map(o => `
                    <li class="order-item">
                      <div class="order-token">${o.token}</div>
                      <div class="order-info">
                        <h4>${Storage.escapeHTML(o.userName)}</h4>
                        <p>${o.items.length} items · ₹${o.total}</p>
                      </div>
                      <span class="status-pill ${o.status}">${o.status}</span>
                      <span class="text-muted text-sm">Ready in ~${o.prepMinutes} min</span>
                    </li>
                  `).join('')}
                </ul>
              `}
            </div>
          </div>

          ${readyOrders.length > 0 ? `
          <div class="card mb-24">
            <div class="card-header"><h3>💳 Payment Pending</h3></div>
            <div class="card-body" style="padding:0">
              <ul class="order-list">
                ${readyOrders.filter(o => !o.paid).map(o => `
                  <li class="order-item">
                    <div class="order-token">${o.token}</div>
                    <div class="order-info">
                      <h4>${Storage.escapeHTML(o.userName)}</h4>
                      <p>${o.items.length} items · ₹${o.total}</p>
                    </div>
                    <button class="btn btn-yellow btn-sm" data-pay-id="${o.id}">Pay Now</button>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>` : ''}
        </div>

        <div>
          <button class="btn btn-primary btn-block mb-24" style="background:var(--teal)" onclick="App.navigate('a-create-order')">
            ➕ CREATE NEW ORDER
          </button>

          <div class="card mb-24">
            <div class="card-header"><h3>📂 Categories</h3></div>
            <div class="card-body">
              <div class="category-grid">
                ${Object.entries(FOOD_EMOJIS).map(([cat, icon]) => `
                  <div class="category-card" data-cat-filter="${cat}">
                    <div class="cat-icon">${icon}</div>
                    <div class="cat-name">${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><h3>🔥 Popular Dishes</h3></div>
            <div class="card-body">
              ${popular.map((f, i) => `
                <div class="popular-item">
                  <span class="popular-rank ${i === 0 ? 'top' : ''}">${i + 1}</span>
                  <span class="popular-thumb">${f.emoji}</span>
                  <div class="popular-info">
                    <h5>${Storage.escapeHTML(f.name)}</h5>
                    <p>${f.todayOrders || 0} orders · ⭐ ${f.rating}</p>
                  </div>
                  <span class="popular-price">₹${f.price}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function renderAdminCreateOrder() {
    const menu = Storage.load('sc_menu', []).filter(f => f.available && f.stock > 0);

    return `
    <div class="view" id="view-a-create-order">
      <h2 class="mb-24" style="font-size:1.3rem;font-weight:700">➕ Create New Order</h2>

      <div class="grid-sidebar-layout">
        <div class="card">
          <div class="card-header"><h3>Select Items</h3></div>
          <div class="card-body">
            <div class="form-group">
              <label for="admin-customer-name">Customer Name</label>
              <input type="text" id="admin-customer-name" placeholder="Walk-in Customer">
            </div>
            <div class="search-bar mb-16">
              <span class="search-icon">🔍</span>
              <input type="text" id="admin-menu-search" placeholder="Search menu...">
            </div>
            <div id="admin-menu-list">
              ${menu.map(f => `
                <div class="flex items-center justify-between" style="padding:10px 0;border-bottom:1px solid var(--border)">
                  <div class="flex items-center gap-8">
                    <span>${f.emoji}</span>
                    <div>
                      <div style="font-size:0.85rem;font-weight:600">${Storage.escapeHTML(f.name)}</div>
                      <div class="text-muted text-sm">₹${f.price} · ${f.prepTime}min</div>
                    </div>
                  </div>
                  <button class="btn btn-sm btn-outline" data-admin-add="${f.id}">+ Add</button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="cart-sidebar">
          <div class="card">
            <div class="card-header"><h3>Order Items</h3></div>
            <div class="card-body">
              <div id="admin-order-items">
                <p class="text-muted text-center">No items added yet</p>
              </div>
            </div>
            <div class="card-footer">
              <button class="btn btn-orange btn-block" id="admin-place-order">Place Order 🎫</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function renderAdminMenuManage() {
    const menu = Storage.load('sc_menu', []);

    return `
    <div class="view" id="view-a-menu-manage">
      <div class="flex items-center justify-between mb-24">
        <h2 style="font-size:1.3rem;font-weight:700">🍽️ Menu Management</h2>
        <button class="btn btn-primary btn-sm" id="add-food-btn">+ Add Item</button>
      </div>

      <div class="card">
        <div class="card-body" style="overflow-x:auto">
          <table class="data-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Prep</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${menu.map(f => `
                <tr>
                  <td>${f.emoji}</td>
                  <td><strong>${Storage.escapeHTML(f.name)}</strong>${f.isCombo ? ' <span class="badge badge-orange">COMBO</span>' : ''}</td>
                  <td>${f.category}</td>
                  <td>₹${f.price}</td>
                  <td>${f.prepTime}m</td>
                  <td>${f.stock}</td>
                  <td>⭐ ${f.rating}</td>
                  <td>
                    <label class="toggle-switch">
                      <input type="checkbox" ${f.available ? 'checked' : ''} data-toggle-food="${f.id}">
                      <span class="toggle-slider"></span>
                    </label>
                  </td>
                  <td>
                    <div class="flex gap-8">
                      <button class="btn btn-sm btn-outline" data-edit-food="${f.id}">✏️</button>
                      <button class="btn btn-sm btn-outline" style="color:var(--red);border-color:var(--red)" data-delete-food="${f.id}">🗑️</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  }

  function renderAdminOrders() {
    const orders = Orders.getAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return `
    <div class="view" id="view-a-orders">
      <div class="flex items-center justify-between mb-24">
        <h2 style="font-size:1.3rem;font-weight:700">📦 All Orders</h2>
        <button class="btn btn-sm btn-outline" id="export-csv-btn">📥 Export CSV</button>
      </div>

      <div class="card">
        <div class="card-body" style="overflow-x:auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Counter</th>
                <th>Status</th>
                <th>Paid</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(o => `
                <tr>
                  <td><strong style="color:var(--orange)">${o.token}</strong></td>
                  <td>${Storage.escapeHTML(o.userName)}</td>
                  <td>${o.items.map(i => `${i.emoji}${i.name}×${i.qty}`).join(', ')}</td>
                  <td>₹${o.total}</td>
                  <td>${o.counter}</td>
                  <td><span class="status-pill ${o.status}">${o.status}</span></td>
                  <td>${o.paid ? '✅' : '❌'}</td>
                  <td class="text-sm">${new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  }

  function renderAdminUsers() {
    const users = Storage.load('sc_users', []);

    return `
    <div class="view" id="view-a-users">
      <h2 class="mb-24" style="font-size:1.3rem;font-weight:700">👥 Users</h2>

      <div class="card">
        <div class="card-body" style="overflow-x:auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td><div class="topbar-avatar" style="width:32px;height:32px;font-size:0.7rem">${Storage.escapeHTML(u.avatar)}</div></td>
                  <td><strong>${Storage.escapeHTML(u.name)}</strong></td>
                  <td>${Storage.escapeHTML(u.username)}</td>
                  <td><span class="status-pill ${u.role === 'admin' ? 'preparing' : u.role === 'kitchen' ? 'waiting' : 'ready'}">${u.role}</span></td>
                  <td class="text-muted">${u.id}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  }

  function renderAdminAnalytics() {
    const stats = Analytics.getDashboardStats();
    const peakData = Analytics.getPeakHourData();
    const maxCount = Math.max(1, ...peakData.map(b => b.count));
    const highestRated = Analytics.getHighestRated(5);
    const fastest = Analytics.getFastestItems(5);

    return `
    <div class="view" id="view-a-analytics">
      <h2 class="mb-24" style="font-size:1.3rem;font-weight:700">📈 Analytics</h2>

      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-value">${stats.totalToday}</div>
          <div class="stat-label">Orders Today</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.completed}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">₹${stats.revenue}</div>
          <div class="stat-label">Revenue</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.avgWait || '—'}</div>
          <div class="stat-label">Avg Wait (min)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.avgPrep || '—'}</div>
          <div class="stat-label">Avg Prep (min)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.cancelled}</div>
          <div class="stat-label">Cancelled</div>
        </div>
      </div>

      <div class="card mb-24">
        <div class="card-header"><h3>📊 Peak Hours</h3></div>
        <div class="card-body">
          <div class="bar-chart" style="padding-bottom:40px">
            ${peakData.map(b => `
              <div class="bar ${b.isPeak ? 'peak' : ''}" style="height:${maxCount > 0 ? (b.count / maxCount) * 100 : 0}%">
                <span class="bar-value">${b.count}</span>
                <span class="bar-label">${b.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header"><h3>⭐ Highest Rated</h3></div>
          <div class="card-body">
            ${highestRated.map((f, i) => `
              <div class="popular-item">
                <span class="popular-rank ${i === 0 ? 'top' : ''}">${i + 1}</span>
                <span class="popular-thumb">${f.emoji}</span>
                <div class="popular-info">
                  <h5>${Storage.escapeHTML(f.name)}</h5>
                  <p>⭐ ${f.rating} (${f.ratingCount} reviews)</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>⚡ Fastest Items</h3></div>
          <div class="card-body">
            ${fastest.map((f, i) => `
              <div class="popular-item">
                <span class="popular-rank">${i + 1}</span>
                <span class="popular-thumb">${f.emoji}</span>
                <div class="popular-info">
                  <h5>${Storage.escapeHTML(f.name)}</h5>
                  <p>⏱️ ${f.prepTime} min prep time</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>`;
  }

  function renderAdminSettings() {
    const settings = Storage.load('sc_settings', SEED_SETTINGS);

    return `
    <div class="view" id="view-a-settings">
      <h2 class="mb-24" style="font-size:1.3rem;font-weight:700">⚙️ Settings</h2>

      <div class="grid-2">
        <div class="card">
          <div class="card-header"><h3>General Settings</h3></div>
          <div class="card-body">
            <div class="form-group">
              <label for="set-counters">Number of Counters</label>
              <input type="number" id="set-counters" min="1" max="10" value="${settings.counters}">
            </div>
            <div class="form-group">
              <label for="set-aging">Aging Threshold (minutes)</label>
              <input type="number" id="set-aging" min="5" max="60" value="${settings.agingThreshold}">
            </div>
            <div class="form-group">
              <label for="set-promo">Promo Banner Text</label>
              <textarea id="set-promo" rows="3">${Storage.escapeHTML(settings.promoBanner)}</textarea>
            </div>
            <button class="btn btn-primary btn-block" id="save-settings-btn">Save Settings</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>⚠️ Danger Zone</h3></div>
          <div class="card-body">
            <p class="text-muted mb-16">Reset all data back to demo defaults. This cannot be undone.</p>
            <button class="btn btn-danger btn-block" id="reset-demo-btn">🔄 Reset Demo Data</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ========== VIEW REGISTRY ========== */
  const viewRenderers = {
    // Student
    'home': renderStudentHome,
    'menu': renderMenu,
    'assistant': renderAssistant,
    'cart-view': renderCartView,
    'track': renderTrackOrder,
    'history': renderHistory,
    'favorites': renderFavorites,
    'profile': renderProfile,
    // Kitchen
    'k-dashboard': renderKitchenDashboard,
    'k-queue': renderKitchenQueue,
    'k-current': renderKitchenCurrent,
    'k-ready': renderKitchenReady,
    'k-counters': renderKitchenCounters,
    'k-scheduling': renderScheduling,
    // Admin
    'a-dashboard': renderAdminDashboard,
    'a-create-order': renderAdminCreateOrder,
    'a-menu-manage': renderAdminMenuManage,
    'a-orders': renderAdminOrders,
    'a-users': renderAdminUsers,
    'a-analytics': renderAdminAnalytics,
    'a-settings': renderAdminSettings
  };

  function renderView(viewId) {
    const renderer = viewRenderers[viewId];
    return renderer ? renderer() : `<div class="view active"><div class="empty-state"><h3>View not found</h3></div></div>`;
  }

  return {
    showToast, removeToast,
    showModal, closeModal,
    updateCartBadge,
    renderLogin, renderSidebar, renderTopbar,
    renderView, renderMenuCard,
    getDefaultView,
    $, $$
  };
})();
