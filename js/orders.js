/* ============================================
   SMART CANTEEN – Orders Module
   ============================================ */

const Orders = (() => {
  'use strict';

  /** Generate next token, resets daily */
  function nextToken(prefix = 'C') {
    const tc = Storage.load('sc_tokenCounter', { date: '', counter: 0 });
    const today = new Date().toISOString().slice(0, 10);

    if (tc.date !== today) {
      tc.date = today;
      tc.counter = 0;
    }

    tc.counter++;
    Storage.save('sc_tokenCounter', tc);
    return `${prefix}-${String(tc.counter).padStart(3, '0')}`;
  }

  /** Assign to counter with shortest queue */
  function assignCounter() {
    const counters = Storage.load('sc_counters', []);
    const orders = Storage.load('sc_orders', []);
    const settings = Storage.load('sc_settings', SEED_SETTINGS);

    let bestCounter = 1;
    let minLoad = Infinity;

    for (let i = 1; i <= settings.counters; i++) {
      const counterOrders = orders.filter(o =>
        o.counter === i && (o.status === 'waiting' || o.status === 'preparing')
      );
      const load = counterOrders.reduce((sum, o) => sum + (o.prepMinutes || 0), 0);
      if (load < minLoad) {
        minLoad = load;
        bestCounter = i;
      }
    }

    return bestCounter;
  }

  /** Place a new order from the cart */
  function placeOrder(isPreorder = false, preorderTime = null) {
    const user = Auth.getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const cartItems = Cart.getItems();
    if (cartItems.length === 0) return { success: false, message: 'Cart is empty' };

    // Validate stock
    const menu = Storage.load('sc_menu', []);
    for (const item of cartItems) {
      const food = menu.find(f => f.id === item.foodId);
      if (!food) return { success: false, message: `${item.name} no longer exists` };
      if (!food.available) return { success: false, message: `${item.name} is unavailable` };
      if (food.stock < item.qty) return { success: false, message: `${item.name}: only ${food.stock} left` };
    }

    // Decrement stock
    for (const item of cartItems) {
      const food = menu.find(f => f.id === item.foodId);
      food.stock -= item.qty;
    }
    Storage.save('sc_menu', menu);

    // Generate token
    const prefix = isPreorder ? 'P' : 'C';
    const token = nextToken(prefix);
    const counter = assignCounter();

    // Calculate total prep time (max of items)
    const prepMinutes = Math.max(...cartItems.map(i => i.prepTime));
    const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

    const order = {
      id: 'ORD' + Date.now().toString(36).toUpperCase(),
      token,
      userId: user.id,
      userName: user.name,
      counter,
      items: cartItems.map(i => ({
        foodId: i.foodId,
        name: i.name,
        qty: i.qty,
        price: i.price,
        emoji: i.emoji
      })),
      total,
      paid: false,
      status: 'waiting',
      prepMinutes,
      createdAt: new Date().toISOString(),
      startedAt: null,
      readyAt: null,
      collectedAt: null,
      preorderFor: isPreorder ? preorderTime : null,
      rated: false
    };

    // Save order
    const orders = Storage.load('sc_orders', []);
    orders.push(order);
    Storage.save('sc_orders', orders);

    // Enqueue (for live queue)
    if (!isPreorder) {
      orderQueue.enqueue({
        id: order.id,
        token: order.token,
        userName: order.userName,
        counter: order.counter,
        prepMinutes: order.prepMinutes,
        items: order.items,
        total: order.total,
        createdAt: order.createdAt
      });
    }

    // Update profile
    const profiles = Storage.load('sc_profiles', {});
    const profile = profiles[user.id] || { ...DEFAULT_PROFILE };
    profile.totalOrders = (profile.totalOrders || 0) + 1;
    profile.totalSpent = (profile.totalSpent || 0) + total;
    cartItems.forEach(item => {
      profile.itemCounts[item.foodId] = (profile.itemCounts[item.foodId] || 0) + item.qty;
      profile.categoryCounts[item.category] = (profile.categoryCounts[item.category] || 0) + item.qty;
    });
    profiles[user.id] = profile;
    Storage.save('sc_profiles', profiles);

    // Clear cart
    Cart.clear();

    return { success: true, order, message: `Order placed! Token: ${token}` };
  }

  /** Get all orders */
  function getAll() {
    return Storage.load('sc_orders', []);
  }

  /** Get orders for current user */
  function getMyOrders() {
    const user = Auth.getCurrentUser();
    if (!user) return [];
    return getAll().filter(o => o.userId === user.id).sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  /** Get active (non-completed) order for current user */
  function getMyActiveOrder() {
    const user = Auth.getCurrentUser();
    if (!user) return null;
    const orders = getAll();
    return orders.find(o =>
      o.userId === user.id &&
      (o.status === 'waiting' || o.status === 'preparing' || o.status === 'ready')
    ) || null;
  }

  /** Update order status */
  function updateStatus(orderId, newStatus) {
    const orders = getAll();
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    order.status = newStatus;

    if (newStatus === 'preparing') {
      order.startedAt = new Date().toISOString();
    } else if (newStatus === 'ready') {
      order.readyAt = new Date().toISOString();
    } else if (newStatus === 'collected') {
      order.collectedAt = new Date().toISOString();
    } else if (newStatus === 'cancelled') {
      // Restore stock
      const menu = Storage.load('sc_menu', []);
      order.items.forEach(item => {
        const food = menu.find(f => f.id === item.foodId);
        if (food) food.stock += item.qty;
      });
      Storage.save('sc_menu', menu);

      // Remove from queue
      orderQueue.removeById(orderId);
    }

    Storage.save('sc_orders', orders);
    return true;
  }

  /** Mark as paid */
  function markPaid(orderId) {
    const orders = getAll();
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;
    order.paid = true;
    Storage.save('sc_orders', orders);
    return true;
  }

  /** Cancel an order (only if waiting) */
  function cancelOrder(orderId) {
    const orders = getAll();
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };
    if (order.status !== 'waiting') {
      return { success: false, message: 'Can only cancel waiting orders' };
    }
    updateStatus(orderId, 'cancelled');
    return { success: true, message: 'Order cancelled' };
  }

  /** Rate an order */
  function rateOrder(orderId, rating, waitRating = '', comment = '') {
    const orders = getAll();
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;
    order.rated = true;
    Storage.save('sc_orders', orders);

    // Save rating
    const ratings = Storage.load('sc_ratings', []);
    ratings.push({ orderId, rating, waitRating, comment, createdAt: new Date().toISOString() });
    Storage.save('sc_ratings', ratings);

    // Update food item ratings
    const menu = Storage.load('sc_menu', []);
    order.items.forEach(item => {
      const food = menu.find(f => f.id === item.foodId);
      if (food) {
        const total = food.rating * food.ratingCount + rating;
        food.ratingCount++;
        food.rating = Math.round((total / food.ratingCount) * 10) / 10;
      }
    });
    Storage.save('sc_menu', menu);

    return true;
  }

  /** Kitchen: Start next order for a counter */
  function startNextForCounter(counterId) {
    const settings = Storage.load('sc_settings', SEED_SETTINGS);

    // Find next waiting order for this counter
    const queueArr = orderQueue.toArray();
    const nextOrder = queueArr.find(o => o.counter === counterId);

    if (!nextOrder) return null;

    // Dequeue (remove from queue)
    orderQueue.removeById(nextOrder.id);

    // Update order status
    updateStatus(nextOrder.id, 'preparing');

    // Update counter state
    const counters = Storage.load('sc_counters', []);
    const counter = counters.find(c => c.id === counterId);
    if (counter) {
      counter.status = 'busy';
      counter.currentOrder = nextOrder.id;
      counter.startedAt = new Date().toISOString();
    }
    Storage.save('sc_counters', counters);

    return nextOrder;
  }

  /** Kitchen: Mark current order as ready */
  function markReadyForCounter(counterId) {
    const counters = Storage.load('sc_counters', []);
    const counter = counters.find(c => c.id === counterId);
    if (!counter || !counter.currentOrder) return null;

    const orderId = counter.currentOrder;
    updateStatus(orderId, 'ready');

    counter.status = 'idle';
    counter.currentOrder = null;
    counter.startedAt = null;
    Storage.save('sc_counters', counters);

    return orderId;
  }

  /** Get orders by status */
  function getByStatus(status) {
    return getAll().filter(o => o.status === status);
  }

  /** Get today's orders */
  function getTodayOrders() {
    const today = new Date().toISOString().slice(0, 10);
    return getAll().filter(o => o.createdAt && o.createdAt.slice(0, 10) === today);
  }

  /** Get ready orders (for public display) */
  function getReadyOrders() {
    return getByStatus('ready');
  }

  /** Admin: create an order directly */
  function createAdminOrder(items, customerName) {
    const token = nextToken('C');
    const counter = assignCounter();
    const menu = Storage.load('sc_menu', []);

    const orderItems = items.map(i => {
      const food = menu.find(f => f.id === i.foodId);
      return {
        foodId: i.foodId,
        name: food ? food.name : 'Unknown',
        qty: i.qty,
        price: food ? food.price : 0,
        emoji: food ? food.emoji : '🍽️'
      };
    });

    const prepMinutes = Math.max(...orderItems.map(i => {
      const food = menu.find(f => f.id === i.foodId);
      return food ? food.prepTime : 5;
    }));

    const total = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Decrement stock
    items.forEach(i => {
      const food = menu.find(f => f.id === i.foodId);
      if (food) food.stock -= i.qty;
    });
    Storage.save('sc_menu', menu);

    const order = {
      id: 'ORD' + Date.now().toString(36).toUpperCase(),
      token,
      userId: 'ADMIN',
      userName: customerName || 'Walk-in Customer',
      counter,
      items: orderItems,
      total,
      paid: false,
      status: 'waiting',
      prepMinutes,
      createdAt: new Date().toISOString(),
      startedAt: null,
      readyAt: null,
      collectedAt: null,
      preorderFor: null,
      rated: false
    };

    const orders = getAll();
    orders.push(order);
    Storage.save('sc_orders', orders);

    orderQueue.enqueue({
      id: order.id,
      token: order.token,
      userName: order.userName,
      counter: order.counter,
      prepMinutes: order.prepMinutes,
      items: order.items,
      total: order.total,
      createdAt: order.createdAt
    });

    return order;
  }

  return {
    placeOrder, getAll, getMyOrders, getMyActiveOrder,
    updateStatus, markPaid, cancelOrder, rateOrder,
    startNextForCounter, markReadyForCounter,
    getByStatus, getTodayOrders, getReadyOrders,
    createAdminOrder, assignCounter
  };
})();
