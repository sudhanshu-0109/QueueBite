/* ============================================
   SMART CANTEEN – Main Application
   Router, Event Wiring, Init
   ============================================ */

const App = (() => {
  'use strict';

  let currentView = null;
  let timerInterval = null;
  let trackInterval = null;
  let wizardState = { step: 0, answers: {} };
  let adminOrderItems = [];

  /* ========== ROUTER ========== */
  function navigate(viewId) {
    const role = Auth.getRole();
    if (!role) return;

    currentView = viewId;
    window.location.hash = '#/' + viewId;
    renderCurrentView();
    updateSidebarActive(viewId);
  }

  function handleHashChange() {
    const hash = window.location.hash.replace('#/', '');
    if (hash && Auth.isLoggedIn()) {
      navigate(hash);
    }
  }

  function updateSidebarActive(viewId) {
    UI.$$('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === viewId);
    });
  }

  /* ========== RENDER ========== */
  function renderApp() {
    const user = Auth.getCurrentUser();
    const root = document.getElementById('app');

    if (!user) {
      root.innerHTML = UI.renderLogin();
      bindLoginEvents();
      return;
    }

    const role = user.role;
    const defaultView = currentView || UI.getDefaultView(role);
    currentView = defaultView;

    root.innerHTML = `
      <div class="app-shell">
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        ${UI.renderSidebar(role)}
        <div class="main-content">
          ${UI.renderTopbar(user)}
          <div class="page-content" id="page-content">
            ${UI.renderView(defaultView)}
          </div>
        </div>
      </div>
      <div class="toast-container" id="toast-container" aria-live="polite"></div>
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3></h3>
            <button class="modal-close" id="modal-close-btn" aria-label="Close modal">✕</button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer"></div>
        </div>
      </div>
    `;

    // Show active view
    const viewEl = document.querySelector(`#view-${defaultView}`);
    if (viewEl) viewEl.classList.add('active');

    // Apply theme
    applyTheme();
    bindAppEvents();
    bindViewEvents(defaultView);
    UI.updateCartBadge();
    startTimers();

    window.location.hash = '#/' + defaultView;
  }

  function renderCurrentView() {
    let content = document.getElementById('page-content');
    if (!content) return;

    // Clone and replace the content node to wipe accumulated event listeners
    const newContent = content.cloneNode(false);
    content.parentNode.replaceChild(newContent, content);
    content = newContent;

    content.innerHTML = UI.renderView(currentView);
    const viewEl = content.querySelector(`[id^="view-"]`);
    if (viewEl) viewEl.classList.add('active');

    bindViewEvents(currentView);

    // Refresh topbar greeting
    const user = Auth.getCurrentUser();
    if (user) {
      const topbar = document.getElementById('topbar');
      if (topbar) {
        const greeting = topbar.querySelector('.topbar-greeting');
        if (greeting) {
          const waitingCount = Orders.getByStatus('waiting').length;
          let msg = 'Welcome! Have a great day.';
          if (waitingCount > 5) msg = "We're busy with a high volume of orders!";
          else if (waitingCount > 0) msg = `${waitingCount} orders in queue. Things are moving smoothly.`;
          greeting.querySelector('p').textContent = msg;
        }
      }
    }
  }

  function refreshView() {
    renderCurrentView();
  }

  /* ========== THEME ========== */
  function applyTheme() {
    const theme = Storage.getCookie('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function toggleTheme() {
    const current = Storage.getCookie('theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    Storage.setCookie('theme', next, 365);
    applyTheme();
  }

  /* ========== LOGIN EVENTS ========== */
  function bindLoginEvents() {
    const form = document.getElementById('login-form');
    const roleSelector = document.getElementById('role-selector');

    if (!form) return;

    // Role selector
    roleSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.role-btn');
      if (!btn) return;
      roleSelector.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });

    // Login form
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      const activeRole = roleSelector.querySelector('.role-btn.active');
      const role = activeRole ? activeRole.dataset.role : 'student';

      // Clear errors
      ['fg-username', 'fg-password'].forEach(id => {
        document.getElementById(id).classList.remove('has-error');
      });

      if (!username) {
        document.getElementById('fg-username').classList.add('has-error');
        document.getElementById('err-username').textContent = 'Username is required';
        return;
      }

      if (!password) {
        document.getElementById('fg-password').classList.add('has-error');
        document.getElementById('err-password').textContent = 'Password is required';
        return;
      }

      const result = Auth.login(username, password, role);
      if (result.success) {
        renderApp();
      } else {
        document.getElementById('fg-password').classList.add('has-error');
        document.getElementById('err-password').textContent = result.message;
      }
    });

    // Demo login buttons
    const demoBtns = document.querySelectorAll('.demo-login-btn');
    demoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.demoRole;
        // The default passwords for demo accounts are 1234
        const result = Auth.login(role, '1234', role); // user names in SEED_USERS match the roles (student, kitchen, admin)
        if (result.success) {
          renderApp();
        } else {
          UI.showToast(result.message, 'error');
        }
      });
    });
  }

  /* ========== APP EVENTS ========== */
  let appEventsBound = false;
  function bindAppEvents() {
    if (appEventsBound) return;
    appEventsBound = true;

    // Sidebar nav
    document.addEventListener('click', (e) => {
      const navItem = e.target.closest('.nav-item[data-view]');
      if (navItem) {
        navigate(navItem.dataset.view);
        closeMobileSidebar();
        return;
      }

      // Mobile sidebar
      if (e.target.id === 'sidebar-toggle') {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        return;
      }

      if (e.target.id === 'sidebar-overlay') {
        closeMobileSidebar();
        return;
      }

      // Theme toggle
      if (e.target.id === 'theme-toggle') {
        toggleTheme();
        return;
      }

      // Logout
      if (e.target.closest('#logout-btn')) {
        Auth.logout();
        stopTimers();
        currentView = null;
        renderApp();
        return;
      }

      // Modal close
      if (e.target.id === 'modal-close-btn' || e.target.classList.contains('modal-overlay')) {
        UI.closeModal();
        return;
      }
    });

    // Keyboard escape for modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') UI.closeModal();
    });
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  /* ========== VIEW-SPECIFIC EVENTS ========== */
  function bindViewEvents(viewId) {
    const content = document.getElementById('page-content');
    if (!content) return;

    switch (viewId) {
      case 'menu': bindMenuEvents(content); break;
      case 'cart-view': bindCartEvents(content); break;
      case 'track': bindTrackEvents(content); break;
      case 'history': bindHistoryEvents(content); break;
      case 'assistant': bindAssistantEvents(content); break;
      case 'favorites': bindMenuEvents(content); break;
      case 'k-current': bindKitchenCurrentEvents(content); break;
      case 'k-scheduling': bindSchedulingEvents(content); break;
      case 'a-dashboard': bindAdminDashboardEvents(content); break;
      case 'a-create-order': bindAdminCreateOrderEvents(content); break;
      case 'a-menu-manage': bindAdminMenuEvents(content); break;
      case 'a-orders': bindAdminOrdersEvents(content); break;
      case 'a-settings': bindAdminSettingsEvents(content); break;
    }
  }

  /* ----- Menu Events ----- */
  function bindMenuEvents(container) {
    // Category chips
    container.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (chip) {
        const cat = chip.dataset.category;
        const filters = Storage.sessionLoad('sc_filters', { category: 'all', search: '', diet: 'all', sort: 'popular' });
        filters.category = cat;
        Storage.sessionSave('sc_filters', filters);
        refreshView();
        return;
      }

      // Add to cart
      const addBtn = e.target.closest('[data-add-id]');
      if (addBtn) {
        const result = Cart.addItem(addBtn.dataset.addId);
        UI.showToast(result.message, result.success ? 'success' : 'error');
        updateSidebarCartBadge();
        return;
      }

      // Favorite toggle
      const favBtn = e.target.closest('.fav-btn');
      if (favBtn) {
        toggleFavorite(favBtn.dataset.favId);
        refreshView();
        return;
      }
    });

    // Search (debounced)
    const searchInput = container.querySelector('#menu-search');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          const filters = Storage.sessionLoad('sc_filters', { category: 'all', search: '', diet: 'all', sort: 'popular' });
          filters.search = searchInput.value;
          Storage.sessionSave('sc_filters', filters);
          refreshView();
        }, 200);
      });
    }

    // Diet filter
    const dietFilter = container.querySelector('#menu-diet-filter');
    if (dietFilter) {
      dietFilter.addEventListener('change', () => {
        const filters = Storage.sessionLoad('sc_filters', { category: 'all', search: '', diet: 'all', sort: 'popular' });
        filters.diet = dietFilter.value;
        Storage.sessionSave('sc_filters', filters);
        refreshView();
      });
    }

    // Sort
    const sortSelect = container.querySelector('#menu-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        const filters = Storage.sessionLoad('sc_filters', { category: 'all', search: '', diet: 'all', sort: 'popular' });
        filters.sort = sortSelect.value;
        Storage.sessionSave('sc_filters', filters);
        refreshView();
      });
    }
  }

  /* ----- Cart Events ----- */
  function bindCartEvents(container) {
    const checkoutBtn = container.querySelector('#checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (Cart.isEmpty()) {
          UI.showToast('Cart is empty', 'warning');
          return;
        }
        const result = Orders.placeOrder();
        if (result.success) {
          UI.showToast(result.message, 'success');
          navigate('track');
        } else {
          UI.showToast(result.message, 'error');
        }
      });
    }
  }

  /* ----- Track Events ----- */
  function bindTrackEvents(container) {
    // Cancel order
    const cancelBtn = container.querySelector('#cancel-order-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        const orderId = cancelBtn.dataset.orderId;
        UI.showModal('Cancel Order', '<p>Are you sure you want to cancel this order?</p>',
          `<button class="btn btn-outline" onclick="UI.closeModal()">No, Keep It</button>
           <button class="btn btn-danger" id="confirm-cancel-btn" data-oid="${orderId}">Yes, Cancel</button>`
        );
        setTimeout(() => {
          const confirmBtn = document.getElementById('confirm-cancel-btn');
          if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
              const result = Orders.cancelOrder(confirmBtn.dataset.oid);
              UI.closeModal();
              UI.showToast(result.message, result.success ? 'info' : 'error');
              refreshView();
            });
          }
        }, 50);
      });
    }

    // Collect order
    const collectBtn = container.querySelector('#collect-order-btn');
    if (collectBtn) {
      collectBtn.addEventListener('click', () => {
        const orderId = collectBtn.dataset.orderId;
        Orders.updateStatus(orderId, 'collected');
        UI.showToast('Order collected! Enjoy your meal! 🎉', 'success');
        showRatingModal(orderId);
        refreshView();
      });
    }
  }

  /* ----- History Events ----- */
  function bindHistoryEvents(container) {
    container.addEventListener('click', (e) => {
      const rateBtn = e.target.closest('[data-rate-id]');
      if (rateBtn) {
        showRatingModal(rateBtn.dataset.rateId);
      }
    });
  }

  /* ----- Rating Modal ----- */
  function showRatingModal(orderId) {
    UI.showModal('Rate Your Order ⭐', `
      <div class="text-center">
        <p class="mb-16">How was your food?</p>
        <div class="rating-stars" id="rating-stars">
          ${[1,2,3,4,5].map(n => `<span class="star" data-star="${n}">☆</span>`).join('')}
        </div>
        <p class="mt-24 mb-8">How was the wait?</p>
        <div class="wait-rating" id="wait-rating">
          <button data-wait="good">😊</button>
          <button data-wait="okay">😐</button>
          <button data-wait="bad">😞</button>
        </div>
        <div class="form-group mt-16">
          <textarea id="rating-comment" placeholder="Any comments? (optional)" rows="2" style="width:100%"></textarea>
        </div>
      </div>
    `, `<button class="btn btn-primary" id="submit-rating-btn">Submit Rating</button>`);

    let selectedRating = 0;
    let selectedWait = '';

    setTimeout(() => {
      const stars = document.getElementById('rating-stars');
      const waitBtns = document.getElementById('wait-rating');
      const submitBtn = document.getElementById('submit-rating-btn');

      if (stars) {
        stars.addEventListener('click', (e) => {
          const star = e.target.closest('.star');
          if (!star) return;
          selectedRating = parseInt(star.dataset.star);
          stars.querySelectorAll('.star').forEach((s, i) => {
            s.textContent = i < selectedRating ? '★' : '☆';
            s.classList.toggle('filled', i < selectedRating);
          });
        });
      }

      if (waitBtns) {
        waitBtns.addEventListener('click', (e) => {
          const btn = e.target.closest('button');
          if (!btn) return;
          selectedWait = btn.dataset.wait;
          waitBtns.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      }

      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          if (selectedRating === 0) {
            UI.showToast('Please select a rating', 'warning');
            return;
          }
          const comment = document.getElementById('rating-comment').value;
          Orders.rateOrder(orderId, selectedRating, selectedWait, comment);
          UI.closeModal();
          UI.showToast('Thanks for your feedback! ⭐', 'success');
          refreshView();
        });
      }
    }, 100);
  }

  /* ----- Assistant / Wizard Events ----- */
  function bindAssistantEvents(container) {
    wizardState = { step: 0, answers: {} };
    renderWizardStep();

    const prevBtn = container.querySelector('#wizard-prev');
    const nextBtn = container.querySelector('#wizard-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (wizardState.step > 0) {
          wizardState.step--;
          renderWizardStep();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (wizardState.step < 5) {
          wizardState.step++;
          renderWizardStep();
        } else {
          showRecommendations();
        }
      });
    }
  }

  const wizardSteps = [
    {
      title: '🍽️ What meal are you looking for?',
      key: 'mealType',
      options: [
        { value: 'breakfast', icon: '🍳', label: 'Breakfast' },
        { value: 'lunch', icon: '🍛', label: 'Lunch' },
        { value: 'snacks', icon: '🍔', label: 'Snacks' },
        { value: 'dinner', icon: '🌙', label: 'Dinner' },
        { value: 'drinks', icon: '☕', label: 'Drinks' },
        { value: 'any', icon: '🍽️', label: 'Anything' }
      ]
    },
    {
      title: '🍖 How hungry are you?',
      key: 'hunger',
      options: [
        { value: 'light', icon: '🌱', label: 'Light Bite' },
        { value: 'medium', icon: '🍽️', label: 'Regular' },
        { value: 'heavy', icon: '🥩', label: 'Very Hungry' }
      ]
    },
    {
      title: '💰 What\'s your budget?',
      key: 'budget',
      options: [
        { value: 30, icon: '💵', label: '< ₹30' },
        { value: 60, icon: '💵', label: '< ₹60' },
        { value: 100, icon: '💵', label: '< ₹100' },
        { value: 200, icon: '💰', label: '< ₹200' },
        { value: 999, icon: '💎', label: 'No Limit' }
      ]
    },
    {
      title: '⏰ How much time do you have?',
      key: 'availableTime',
      options: [
        { value: 3, icon: '⚡', label: '< 3 min' },
        { value: 5, icon: '🕐', label: '< 5 min' },
        { value: 10, icon: '🕐', label: '< 10 min' },
        { value: 99, icon: '😌', label: 'No Rush' }
      ]
    },
    {
      title: '🌶️ Spice preference?',
      key: 'spice',
      options: [
        { value: 'none', icon: '❄️', label: 'No Spice' },
        { value: 'mild', icon: '🌶️', label: 'Mild' },
        { value: 'medium', icon: '🔥', label: 'Medium' },
        { value: 'spicy', icon: '💥', label: 'Spicy' }
      ]
    },
    {
      title: '🥗 Diet preference?',
      key: 'diet',
      options: [
        { value: 'veg', icon: '🟢', label: 'Veg Only' },
        { value: 'non-veg', icon: '🔴', label: 'Non-Veg OK' },
        { value: 'any', icon: '🍽️', label: 'Any' }
      ]
    }
  ];

  function renderWizardStep() {
    const step = wizardSteps[wizardState.step];
    const content = document.getElementById('wizard-content');
    const prevBtn = document.getElementById('wizard-prev');
    const nextBtn = document.getElementById('wizard-next');
    const dots = document.querySelectorAll('.wizard-dot');

    if (!content) return;

    content.innerHTML = `
      <h3 class="mb-24">${step.title}</h3>
      <div class="wizard-options">
        ${step.options.map(opt => `
          <div class="wizard-option ${wizardState.answers[step.key] === opt.value ? 'selected' : ''}" data-wizard-value="${opt.value}">
            <div class="wo-icon">${opt.icon}</div>
            <div class="wo-label">${opt.label}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Bind option clicks
    content.querySelectorAll('.wizard-option').forEach(el => {
      el.addEventListener('click', () => {
        let val = el.dataset.wizardValue;
        // Convert numbers
        if (!isNaN(val)) val = parseInt(val);
        wizardState.answers[step.key] = val;
        content.querySelectorAll('.wizard-option').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
      });
    });

    // Update dots
    dots.forEach((d, i) => {
      d.classList.remove('active', 'done');
      if (i < wizardState.step) d.classList.add('done');
      if (i === wizardState.step) d.classList.add('active');
    });

    if (prevBtn) prevBtn.disabled = wizardState.step === 0;
    if (nextBtn) nextBtn.textContent = wizardState.step === 5 ? 'Get Recommendations ✨' : 'Next →';
  }

  function showRecommendations() {
    const results = Recommend.getRecommendations(wizardState.answers);
    const combos = Recommend.findBudgetCombos(wizardState.answers.budget || 100, wizardState.answers.diet || 'any');
    const container = document.getElementById('reco-results');
    if (!container) return;

    let html = '<h3 class="mb-24">✨ Your Recommendations</h3>';

    if (results.bestMatch) {
      const best = results.bestMatch;
      html += `
        <div class="reco-card best-match">
          <div class="reco-header">
            <div>
              <span style="font-size:2rem">${best.food.emoji}</span>
              <h3 style="display:inline;margin-left:8px">${Storage.escapeHTML(best.food.name)}</h3>
              <span class="menu-card-diet ${best.food.diet === 'veg' ? 'veg' : 'non-veg'}" style="margin-left:8px">${best.food.diet === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}</span>
            </div>
            <div class="reco-score">${best.score}<span>/100</span></div>
          </div>
          <p class="text-muted">₹${best.food.price} · ${best.food.prepTime} min · ${best.food.calories} cal · ${best.food.spice} spice</p>
          <ul class="reco-reasons">
            ${best.reasons.map(r => `<li>${r}</li>`).join('')}
            ${(best.failReasons || []).map(r => `<li class="fail">${r}</li>`).join('')}
          </ul>
          <button class="btn btn-orange btn-sm mt-16" onclick="Cart.addItem('${best.food.id}');UI.showToast('Added to cart!','success')">🛒 Add to Cart</button>
        </div>
      `;
    }

    if (results.alternatives.length > 0) {
      html += '<h4 class="mt-24 mb-16">Other Great Options</h4>';
      results.alternatives.forEach(alt => {
        html += `
          <div class="reco-card">
            <div class="reco-header">
              <div>
                <span style="font-size:1.5rem">${alt.food.emoji}</span>
                <strong style="margin-left:8px">${Storage.escapeHTML(alt.food.name)}</strong>
                <span class="text-muted text-sm" style="margin-left:8px">₹${alt.food.price}</span>
              </div>
              <div class="reco-score">${alt.score}<span>/100</span></div>
            </div>
            <ul class="reco-reasons">
              ${alt.reasons.slice(0, 3).map(r => `<li>${r}</li>`).join('')}
            </ul>
            <button class="btn btn-outline btn-sm mt-8" onclick="Cart.addItem('${alt.food.id}');UI.showToast('Added to cart!','success')">+ Add</button>
          </div>
        `;
      });
    }

    if (combos.length > 0) {
      html += '<h4 class="mt-24 mb-16">💡 Budget Combos</h4>';
      combos.forEach(combo => {
        html += `
          <div class="combo-card">
            <div class="combo-items">
              ${combo.items.map(f => `<span>${f.emoji} ${Storage.escapeHTML(f.name)}</span>`).join('')}
            </div>
            <div class="combo-total">₹${combo.total}</div>
          </div>
        `;
      });
    }

    container.innerHTML = html;
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
  }

  /* ----- Kitchen Current Events ----- */
  function bindKitchenCurrentEvents(container) {
    container.addEventListener('click', (e) => {
      const startBtn = e.target.closest('[data-start-next]');
      if (startBtn) {
        const counterId = parseInt(startBtn.dataset.startNext);
        const order = Orders.startNextForCounter(counterId);
        if (order) {
          UI.showToast(`Started order ${order.token} on Counter ${counterId}`, 'success');
        } else {
          UI.showToast(`No waiting orders for Counter ${counterId}`, 'warning');
        }
        refreshView();
        return;
      }

      const readyBtn = e.target.closest('[data-mark-ready]');
      if (readyBtn) {
        const counterId = parseInt(readyBtn.dataset.markReady);
        const orderId = Orders.markReadyForCounter(counterId);
        if (orderId) {
          UI.showToast(`Order marked ready on Counter ${counterId}! ✅`, 'success');
        }
        refreshView();
      }
    });
  }

  /* ----- Scheduling Events ----- */
  function bindSchedulingEvents(container) {
    container.addEventListener('click', (e) => {
      const schedBtn = e.target.closest('[data-sched-mode]');
      if (schedBtn) {
        const mode = schedBtn.dataset.schedMode;
        const settings = Storage.load('sc_settings', SEED_SETTINGS);
        settings.schedulingMode = mode;
        Storage.save('sc_settings', settings);
        refreshView();
      }
    });
  }

  /* ----- Admin Dashboard Events ----- */
  function bindAdminDashboardEvents(container) {
    container.addEventListener('click', (e) => {
      const payBtn = e.target.closest('[data-pay-id]');
      if (payBtn) {
        Orders.markPaid(payBtn.dataset.payId);
        UI.showToast('Payment recorded ✅', 'success');
        refreshView();
      }
    });
  }

  /* ----- Admin Create Order Events ----- */
  function bindAdminCreateOrderEvents(container) {
    adminOrderItems = [];

    const searchInput = container.querySelector('#admin-menu-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const menuItems = container.querySelectorAll('#admin-menu-list > div');
        menuItems.forEach(el => {
          const text = el.textContent.toLowerCase();
          el.style.display = text.includes(query) ? '' : 'none';
        });
      });
    }

    container.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-admin-add]');
      if (addBtn) {
        const foodId = addBtn.dataset.adminAdd;
        const existing = adminOrderItems.find(i => i.foodId === foodId);
        if (existing) {
          existing.qty++;
        } else {
          const menu = Storage.load('sc_menu', []);
          const food = menu.find(f => f.id === foodId);
          if (food) {
            adminOrderItems.push({ foodId, name: food.name, qty: 1, price: food.price, emoji: food.emoji });
          }
        }
        renderAdminOrderSummary(container);
      }
    });

    const placeBtn = container.querySelector('#admin-place-order');
    if (placeBtn) {
      placeBtn.addEventListener('click', () => {
        if (adminOrderItems.length === 0) {
          UI.showToast('Add items first', 'warning');
          return;
        }
        const name = container.querySelector('#admin-customer-name').value || 'Walk-in Customer';
        const order = Orders.createAdminOrder(adminOrderItems, name);
        UI.showToast(`Order ${order.token} created! ₹${order.total}`, 'success');
        adminOrderItems = [];
        refreshView();
      });
    }
  }

  function renderAdminOrderSummary(container) {
    const el = container.querySelector('#admin-order-items');
    if (!el) return;

    if (adminOrderItems.length === 0) {
      el.innerHTML = '<p class="text-muted text-center">No items added yet</p>';
      return;
    }

    const total = adminOrderItems.reduce((s, i) => s + i.price * i.qty, 0);
    el.innerHTML = adminOrderItems.map(i => `
      <div class="flex items-center justify-between" style="padding:8px 0;border-bottom:1px solid var(--border)">
        <span>${i.emoji} ${Storage.escapeHTML(i.name)} × ${i.qty}</span>
        <strong>₹${i.price * i.qty}</strong>
      </div>
    `).join('') + `
      <div class="flex justify-between mt-8" style="font-weight:700;font-size:1.05rem">
        <span>Total</span><span>₹${total}</span>
      </div>
    `;
  }

  /* ----- Admin Menu Events ----- */
  function bindAdminMenuEvents(container) {
    container.addEventListener('click', (e) => {
      // Toggle availability
      const toggleInput = e.target.closest('[data-toggle-food]');
      if (toggleInput && toggleInput.tagName === 'INPUT') {
        const foodId = toggleInput.dataset.toggleFood;
        const menu = Storage.load('sc_menu', []);
        const food = menu.find(f => f.id === foodId);
        if (food) {
          food.available = toggleInput.checked;
          Storage.save('sc_menu', menu);
          UI.showToast(`${food.name} ${food.available ? 'enabled' : 'disabled'}`, 'info');
        }
        return;
      }

      // Edit food
      const editBtn = e.target.closest('[data-edit-food]');
      if (editBtn) {
        showFoodModal(editBtn.dataset.editFood);
        return;
      }

      // Delete food
      const deleteBtn = e.target.closest('[data-delete-food]');
      if (deleteBtn) {
        const foodId = deleteBtn.dataset.deleteFood;
        UI.showModal('Delete Item', '<p>Are you sure you want to delete this item?</p>',
          `<button class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
           <button class="btn btn-danger" id="confirm-delete-food" data-fid="${foodId}">Delete</button>`
        );
        setTimeout(() => {
          const btn = document.getElementById('confirm-delete-food');
          if (btn) {
            btn.addEventListener('click', () => {
              let menu = Storage.load('sc_menu', []);
              menu = menu.filter(f => f.id !== btn.dataset.fid);
              Storage.save('sc_menu', menu);
              UI.closeModal();
              UI.showToast('Item deleted', 'info');
              refreshView();
            });
          }
        }, 50);
        return;
      }

      // Add food
      if (e.target.id === 'add-food-btn') {
        showFoodModal(null);
        return;
      }
    });
  }

  function showFoodModal(foodId) {
    const menu = Storage.load('sc_menu', []);
    const food = foodId ? menu.find(f => f.id === foodId) : null;
    const title = food ? 'Edit Item' : 'Add New Item';

    UI.showModal(title, `
      <div class="admin-form-grid">
        <div class="form-group"><label>Name</label><input type="text" id="food-name" value="${food ? Storage.escapeHTML(food.name) : ''}"></div>
        <div class="form-group"><label>Price (₹)</label><input type="number" id="food-price" value="${food ? food.price : ''}"></div>
        <div class="form-group"><label>Category</label>
          <select id="food-category">
            ${['breakfast','lunch','snacks','dinner','drinks','desserts'].map(c =>
              `<option value="${c}" ${food && food.category === c ? 'selected' : ''}>${c}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group"><label>Prep Time (min)</label><input type="number" id="food-prep" value="${food ? food.prepTime : ''}"></div>
        <div class="form-group"><label>Calories</label><input type="number" id="food-cal" value="${food ? food.calories : ''}"></div>
        <div class="form-group"><label>Stock</label><input type="number" id="food-stock" value="${food ? food.stock : 20}"></div>
        <div class="form-group"><label>Spice</label>
          <select id="food-spice">
            ${['none','mild','medium','spicy'].map(s =>
              `<option value="${s}" ${food && food.spice === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group"><label>Diet</label>
          <select id="food-diet">
            <option value="veg" ${food && food.diet === 'veg' ? 'selected' : ''}>Veg</option>
            <option value="non-veg" ${food && food.diet === 'non-veg' ? 'selected' : ''}>Non-Veg</option>
          </select>
        </div>
        <div class="form-group"><label>Hunger Level</label>
          <select id="food-hunger">
            ${['light','medium','heavy'].map(h =>
              `<option value="${h}" ${food && food.hungerLevel === h ? 'selected' : ''}>${h}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group"><label>Emoji</label><input type="text" id="food-emoji" value="${food ? food.emoji : '🍽️'}"></div>
      </div>
    `, `<button class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-primary" id="save-food-btn">${food ? 'Save Changes' : 'Add Item'}</button>`);

    setTimeout(() => {
      const saveBtn = document.getElementById('save-food-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const name = document.getElementById('food-name').value.trim();
          const price = parseInt(document.getElementById('food-price').value);
          if (!name || !price) {
            UI.showToast('Name and price are required', 'error');
            return;
          }

          const updates = {
            name,
            price,
            category: document.getElementById('food-category').value,
            prepTime: parseInt(document.getElementById('food-prep').value) || 5,
            calories: parseInt(document.getElementById('food-cal').value) || 0,
            stock: parseInt(document.getElementById('food-stock').value) || 20,
            spice: document.getElementById('food-spice').value,
            diet: document.getElementById('food-diet').value,
            hungerLevel: document.getElementById('food-hunger').value,
            emoji: document.getElementById('food-emoji').value || '🍽️'
          };

          const menuData = Storage.load('sc_menu', []);

          if (food) {
            const idx = menuData.findIndex(f => f.id === food.id);
            if (idx >= 0) menuData[idx] = { ...menuData[idx], ...updates };
          } else {
            menuData.push({
              id: 'F' + Date.now().toString(36).toUpperCase(),
              ...updates,
              popularity: 50,
              rating: 4.0,
              ratingCount: 0,
              available: true,
              image: '',
              pairsWith: [],
              isCombo: false
            });
          }

          Storage.save('sc_menu', menuData);
          UI.closeModal();
          UI.showToast(food ? 'Item updated' : 'Item added', 'success');
          refreshView();
        });
      }
    }, 50);
  }

  /* ----- Admin Orders Events ----- */
  function bindAdminOrdersEvents(container) {
    const exportBtn = container.querySelector('#export-csv-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        Analytics.exportCSV();
        UI.showToast('CSV exported successfully', 'success');
      });
    }
  }

  /* ----- Admin Settings Events ----- */
  function bindAdminSettingsEvents(container) {
    const saveBtn = container.querySelector('#save-settings-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const settings = Storage.load('sc_settings', SEED_SETTINGS);
        settings.counters = parseInt(document.getElementById('set-counters').value) || 3;
        settings.agingThreshold = parseInt(document.getElementById('set-aging').value) || 15;
        settings.promoBanner = document.getElementById('set-promo').value;
        Storage.save('sc_settings', settings);

        // Rebuild counters if count changed
        const counters = Storage.load('sc_counters', []);
        while (counters.length < settings.counters) {
          counters.push({ id: counters.length + 1, status: 'idle', currentOrder: null, startedAt: null });
        }
        Storage.save('sc_counters', counters);

        UI.showToast('Settings saved', 'success');
        refreshView();
      });
    }

    const resetBtn = container.querySelector('#reset-demo-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        UI.showModal('Reset Demo Data', '<p>This will reset ALL data to demo defaults. Are you sure?</p>',
          `<button class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
           <button class="btn btn-danger" id="confirm-reset-btn">Reset Everything</button>`
        );
        setTimeout(() => {
          const btn = document.getElementById('confirm-reset-btn');
          if (btn) {
            btn.addEventListener('click', () => {
              Storage.resetAll();
              orderQueue.load();
              UI.closeModal();
              UI.showToast('All data has been reset', 'info');
              refreshView();
            });
          }
        }, 50);
      });
    }
  }

  /* ========== FAVORITES ========== */
  function toggleFavorite(foodId) {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const profiles = Storage.load('sc_profiles', {});
    const profile = profiles[user.id] || { ...DEFAULT_PROFILE };

    if (!profile.favorites) profile.favorites = [];

    const idx = profile.favorites.indexOf(foodId);
    if (idx >= 0) {
      profile.favorites.splice(idx, 1);
      UI.showToast('Removed from favorites', 'info');
    } else {
      profile.favorites.push(foodId);
      UI.showToast('Added to favorites ❤️', 'success');
    }

    profiles[user.id] = profile;
    Storage.save('sc_profiles', profiles);
  }

  /* ========== SIDEBAR CART BADGE ========== */
  function updateSidebarCartBadge() {
    const badge = document.getElementById('sidebar-cart-badge');
    if (!badge) return;
    const count = Cart.getTotalItems();
    badge.textContent = count;
    badge.style.display = count > 0 ? '' : 'none';
    UI.updateCartBadge();
  }

  /* ========== TIMERS ========== */
  function startTimers() {
    stopTimers();

    // Kitchen counter timers (1s)
    timerInterval = setInterval(() => {
      updateCounterTimers();
    }, 1000);

    // Track order polling (2s)
    trackInterval = setInterval(() => {
      if (currentView === 'track') {
        // Soft-check for status changes
        const activeOrder = Orders.getMyActiveOrder();
        const trackEl = document.getElementById('view-track');
        if (trackEl && activeOrder) {
          // Check if people-ahead notification
          const ahead = orderQueue.ordersAhead(activeOrder.id);
          if (ahead >= 0 && ahead <= 2 && activeOrder.status === 'waiting') {
            // Don't re-render, just show toast once
          }
        }
      }
    }, 2000);
  }

  function stopTimers() {
    if (timerInterval) clearInterval(timerInterval);
    if (trackInterval) clearInterval(trackInterval);
    timerInterval = null;
    trackInterval = null;
  }

  function updateCounterTimers() {
    const counters = Storage.load('sc_counters', []);
    const orders = Orders.getAll();

    counters.forEach(counter => {
      if (counter.status !== 'busy' || !counter.currentOrder || !counter.startedAt) return;

      const timerEl = document.querySelector(`[data-counter="${counter.id}"]`);
      const progressEl = document.querySelector(`[data-counter-progress="${counter.id}"]`);
      if (!timerEl) return;

      const order = orders.find(o => o.id === counter.currentOrder);
      if (!order) return;

      const elapsed = Math.floor((Date.now() - new Date(counter.startedAt).getTime()) / 1000);
      const totalSec = order.prepMinutes * 60;
      const remaining = Math.max(0, totalSec - elapsed);
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;

      timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      if (progressEl) {
        progressEl.style.width = `${Math.min(100, (elapsed / totalSec) * 100)}%`;
      }

      // Timer expired visual
      if (remaining <= 0) {
        timerEl.style.color = 'var(--red)';
        timerEl.textContent = 'DONE';
      }
    });
  }

  /* ========== CROSS-TAB SYNC ========== */
  function setupCrossTabSync() {
    Storage.onStorageChange((key, newValue) => {
      if (!Auth.isLoggedIn()) return;

      // Refresh view on relevant changes
      const relevantKeys = ['sc_orders', 'sc_queue', 'sc_menu', 'sc_counters'];
      if (relevantKeys.includes(key)) {
        // Reload queue from storage
        if (key === 'sc_queue') {
          orderQueue.fromArray(newValue || []);
        }
        refreshView();

        // Toast for status changes
        if (key === 'sc_orders') {
          const user = Auth.getCurrentUser();
          if (user && user.role === 'student') {
            const myOrder = (newValue || []).find(o =>
              o.userId === user.id && o.status === 'ready'
            );
            if (myOrder) {
              UI.showToast(`🔔 Your order ${myOrder.token} is READY! Collect from Counter ${myOrder.counter}`, 'success', 6000);
            }
          }
        }
      }
    });
  }

  /* ========== INIT ========== */
  function init() {
    // Detect storage issues
    if (!Storage.hasLocal) {
      document.getElementById('app').innerHTML = `
        <div style="text-align:center;padding:60px;font-family:var(--font)">
          <h2>⚠️ Storage Unavailable</h2>
          <p>localStorage is not available. Please disable private/incognito mode or enable cookies.</p>
        </div>`;
      return;
    }

    // Seed data
    Storage.initSeedData();

    // Load queue
    orderQueue.load();

    // Apply saved theme
    const theme = Storage.getCookie('theme') || 'light';
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Record last visit
    Storage.setCookie('last_visit', new Date().toISOString(), 365);

    // Render
    renderApp();

    // Hash routing
    window.addEventListener('hashchange', handleHashChange);

    // Cross-tab sync
    setupCrossTabSync();
  }

  return { init, navigate, refreshView, renderApp };
})();

// Boot
document.addEventListener('DOMContentLoaded', App.init);
