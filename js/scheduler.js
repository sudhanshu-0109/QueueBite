/* ============================================
   SMART CANTEEN – Scheduler & Wait-Time
   FIFO default + Smart (Shortest Prep Time First)
   ============================================ */

const Scheduler = (() => {
  'use strict';

  /**
   * Average wait time for a given serving order
   * @param {Array} orders – in serving sequence
   * @returns {number} average wait in minutes
   */
  function avgWait(orders) {
    if (!orders.length) return 0;
    let elapsed = 0;
    let totalWait = 0;
    for (const o of orders) {
      totalWait += elapsed;
      elapsed += (o.prepMinutes || 0);
    }
    return orders.length ? Math.round((totalWait / orders.length) * 10) / 10 : 0;
  }

  /**
   * Get FIFO ordered queue
   */
  function getFIFOOrder() {
    return orderQueue.toArray();
  }

  /**
   * Get Smart (SJF) ordered queue with aging
   */
  function getSmartOrder() {
    const settings = Storage.load('sc_settings', SEED_SETTINGS);
    const threshold = settings.agingThreshold || 15;
    const queue = orderQueue.toArray().slice(); // copy
    const now = Date.now();

    // Mark aged orders
    queue.forEach(o => {
      const waitMs = now - new Date(o.createdAt).getTime();
      o._waitMinutes = waitMs / 60000;
      o._aged = o._waitMinutes >= threshold;
    });

    // Sort: aged first (by wait time desc), then by prepMinutes asc
    queue.sort((a, b) => {
      if (a._aged && !b._aged) return -1;
      if (!a._aged && b._aged) return 1;
      if (a._aged && b._aged) return b._waitMinutes - a._waitMinutes;
      return (a.prepMinutes || 0) - (b.prepMinutes || 0);
    });

    return queue;
  }

  /**
   * Get comparison data
   */
  function getComparison() {
    const fifo = getFIFOOrder();
    const smart = getSmartOrder();
    return {
      fifoAvg: avgWait(fifo),
      smartAvg: avgWait(smart),
      fifoOrder: fifo,
      smartOrder: smart,
      savings: Math.max(0, avgWait(fifo) - avgWait(smart))
    };
  }

  /**
   * Estimate wait time for a specific order
   * Considers active counters
   */
  function estimateWait(orderId) {
    const settings = Storage.load('sc_settings', SEED_SETTINGS);
    const counters = Storage.load('sc_counters', []);
    const numCounters = settings.counters || 1;

    // Total prep ahead in queue
    const prepAhead = orderQueue.prepTimeAhead(orderId);
    if (prepAhead < 0) return 0;

    // Average across counters
    let estimate = Math.ceil(prepAhead / numCounters);

    // Add remaining time of current orders
    const busyCounters = counters.filter(c => c.status === 'busy');
    if (busyCounters.length > 0) {
      const orders = Storage.load('sc_orders', []);
      let minRemaining = Infinity;
      busyCounters.forEach(c => {
        const order = orders.find(o => o.id === c.currentOrder);
        if (order && c.startedAt) {
          const elapsed = (Date.now() - new Date(c.startedAt).getTime()) / 60000;
          const remaining = Math.max(0, order.prepMinutes - elapsed);
          minRemaining = Math.min(minRemaining, remaining);
        }
      });
      if (minRemaining < Infinity) {
        estimate += Math.ceil(minRemaining);
      }
    }

    return Math.max(1, estimate);
  }

  /**
   * Detect peak hours from today's orders
   */
  function getPeakHours() {
    const orders = Orders.getTodayOrders();
    const hourCounts = new Array(24).fill(0);

    orders.forEach(o => {
      const hour = new Date(o.createdAt).getHours();
      hourCounts[hour]++;
    });

    const maxCount = Math.max(...hourCounts);
    const peakHour = hourCounts.indexOf(maxCount);

    return { hourCounts, peakHour, maxCount };
  }

  /**
   * Generate smart insights
   */
  function getInsights() {
    const insights = [];
    const todayOrders = Orders.getTodayOrders();
    const waitingOrders = Orders.getByStatus('waiting');
    const settings = Storage.load('sc_settings', SEED_SETTINGS);

    // Busy queue insight
    if (waitingOrders.length > 5) {
      insights.push({
        icon: '⚡',
        text: `${waitingOrders.length} orders waiting. Consider opening another counter.`,
        type: 'warning'
      });
    }

    // Average wait insight
    if (waitingOrders.length > 0) {
      const avgPrepQueue = waitingOrders.reduce((s, o) => s + (o.prepMinutes || 0), 0) / waitingOrders.length;
      if (avgPrepQueue > 10) {
        insights.push({
          icon: '⏰',
          text: `Average prep time in queue is ${avgPrepQueue.toFixed(1)} min. Smart scheduling could reduce waits.`,
          type: 'info'
        });
      }
    }

    // Popular item today
    if (todayOrders.length > 0) {
      const itemCounts = {};
      todayOrders.forEach(o => {
        o.items.forEach(i => {
          itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty;
        });
      });
      const sorted = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        insights.push({
          icon: '🔥',
          text: `${sorted[0][0]} is today's hottest item with ${sorted[0][1]} orders!`,
          type: 'success'
        });
      }
    }

    // Revenue insight
    const revenue = todayOrders.reduce((s, o) => s + o.total, 0);
    if (revenue > 0) {
      insights.push({
        icon: '💰',
        text: `Today's revenue: ₹${revenue}. ${todayOrders.length} orders served so far.`,
        type: 'info'
      });
    }

    // Low stock warning
    const menu = Storage.load('sc_menu', []);
    const lowStock = menu.filter(f => f.available && f.stock <= 3 && f.stock > 0);
    if (lowStock.length > 0) {
      insights.push({
        icon: '📦',
        text: `Low stock alert: ${lowStock.map(f => f.name).join(', ')}. Restock soon!`,
        type: 'warning'
      });
    }

    return insights;
  }

  return {
    avgWait, getFIFOOrder, getSmartOrder, getComparison,
    estimateWait, getPeakHours, getInsights
  };
})();
