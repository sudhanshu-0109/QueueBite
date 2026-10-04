/* ============================================
   SMART CANTEEN – Analytics Module
   ============================================ */

const Analytics = (() => {
  'use strict';

  /** Dashboard stats */
  function getDashboardStats() {
    const today = Orders.getTodayOrders();
    const all = Orders.getAll();

    const stats = {
      totalToday: today.length,
      completed: today.filter(o => o.status === 'collected').length,
      waiting: today.filter(o => o.status === 'waiting').length,
      preparing: today.filter(o => o.status === 'preparing').length,
      ready: today.filter(o => o.status === 'ready').length,
      cancelled: today.filter(o => o.status === 'cancelled').length,
      revenue: today.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
      avgWait: 0,
      avgPrep: 0
    };

    // Average wait time (from order placed to ready)
    const completedOrders = today.filter(o => o.readyAt && o.createdAt);
    if (completedOrders.length > 0) {
      const totalWait = completedOrders.reduce((s, o) => {
        return s + (new Date(o.readyAt) - new Date(o.createdAt)) / 60000;
      }, 0);
      stats.avgWait = Math.round((totalWait / completedOrders.length) * 10) / 10;
    }

    // Average prep time
    const prepOrders = today.filter(o => o.readyAt && o.startedAt);
    if (prepOrders.length > 0) {
      const totalPrep = prepOrders.reduce((s, o) => {
        return s + (new Date(o.readyAt) - new Date(o.startedAt)) / 60000;
      }, 0);
      stats.avgPrep = Math.round((totalPrep / prepOrders.length) * 10) / 10;
    }

    return stats;
  }

  /** Popular dishes */
  function getPopularDishes(limit = 5) {
    const menu = Storage.load('sc_menu', []);
    const today = Orders.getTodayOrders();

    // Count orders per item today
    const itemCounts = {};
    today.forEach(o => {
      o.items.forEach(i => {
        itemCounts[i.foodId] = (itemCounts[i.foodId] || 0) + i.qty;
      });
    });

    return menu
      .map(f => ({ ...f, todayOrders: itemCounts[f.id] || 0 }))
      .sort((a, b) => b.todayOrders - a.todayOrders || b.popularity - a.popularity)
      .slice(0, limit);
  }

  /** Highest rated items */
  function getHighestRated(limit = 5) {
    const menu = Storage.load('sc_menu', []);
    return menu
      .filter(f => f.ratingCount > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /** Fastest items */
  function getFastestItems(limit = 5) {
    const menu = Storage.load('sc_menu', []);
    return menu
      .filter(f => f.available)
      .sort((a, b) => a.prepTime - b.prepTime)
      .slice(0, limit);
  }

  /** Peak hour bar chart data */
  function getPeakHourData() {
    const { hourCounts, peakHour } = Scheduler.getPeakHours();
    // Only return hours 7-22 (canteen hours)
    const bars = [];
    for (let h = 7; h <= 22; h++) {
      bars.push({
        hour: h,
        label: `${h}:00`,
        count: hourCounts[h],
        isPeak: h === peakHour && hourCounts[h] > 0
      });
    }
    return bars;
  }

  /** Export orders as CSV */
  function exportCSV() {
    const orders = Orders.getAll();
    const headers = ['Token', 'Customer', 'Items', 'Total (₹)', 'Status', 'Counter', 'Created', 'Prep Time (min)'];
    const rows = orders.map(o => [
      o.token,
      o.userName,
      o.items.map(i => `${i.name}×${i.qty}`).join('; '),
      o.total,
      o.status,
      o.counter,
      new Date(o.createdAt).toLocaleString(),
      o.prepMinutes
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartcanteen_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /** Counter performance */
  function getCounterPerformance() {
    const settings = Storage.load('sc_settings', SEED_SETTINGS);
    const orders = Orders.getTodayOrders();
    const counters = [];

    for (let i = 1; i <= settings.counters; i++) {
      const cOrders = orders.filter(o => o.counter === i);
      counters.push({
        id: i,
        totalOrders: cOrders.length,
        completed: cOrders.filter(o => o.status === 'collected').length,
        revenue: cOrders.reduce((s, o) => s + o.total, 0)
      });
    }

    return counters;
  }

  return {
    getDashboardStats, getPopularDishes, getHighestRated,
    getFastestItems, getPeakHourData, exportCSV, getCounterPerformance
  };
})();
