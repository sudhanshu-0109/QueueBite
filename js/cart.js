/* ============================================
   SMART CANTEEN – Cart Module
   ============================================ */

const Cart = (() => {
  'use strict';
  const KEY = 'sc_cart';

  function getItems() {
    return Storage.sessionLoad(KEY, []);
  }

  function saveItems(items) {
    Storage.sessionSave(KEY, items);
    UI.updateCartBadge();
  }

  function addItem(foodId) {
    const menu = Storage.load('sc_menu', []);
    const food = menu.find(f => f.id === foodId);
    if (!food) return { success: false, message: 'Item not found' };
    if (!food.available) return { success: false, message: 'Item is unavailable' };
    if (food.stock <= 0) return { success: false, message: 'Item is out of stock' };

    const items = getItems();
    const existing = items.find(i => i.foodId === foodId);

    if (existing) {
      if (existing.qty >= food.stock) {
        return { success: false, message: `Only ${food.stock} available` };
      }
      existing.qty++;
    } else {
      items.push({
        foodId: food.id,
        name: food.name,
        price: food.price,
        qty: 1,
        prepTime: food.prepTime,
        emoji: food.emoji || '🍽️',
        diet: food.diet,
        category: food.category,
        maxStock: food.stock
      });
    }

    saveItems(items);
    return { success: true, message: `${food.name} added to cart` };
  }

  function updateQty(foodId, qty) {
    const items = getItems();
    const item = items.find(i => i.foodId === foodId);
    if (!item) return;

    if (qty <= 0) {
      removeItem(foodId);
      return;
    }

    const menu = Storage.load('sc_menu', []);
    const food = menu.find(f => f.id === foodId);
    if (food && qty > food.stock) {
      qty = food.stock;
      UI.showToast(`Only ${food.stock} available`, 'warning');
    }

    item.qty = qty;
    saveItems(items);
  }

  function removeItem(foodId) {
    let items = getItems();
    items = items.filter(i => i.foodId !== foodId);
    saveItems(items);
  }

  function clear() {
    saveItems([]);
  }

  function getTotal() {
    return getItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function getTotalItems() {
    return getItems().reduce((sum, i) => sum + i.qty, 0);
  }

  function getEstimatedPrepTime() {
    const items = getItems();
    if (items.length === 0) return 0;
    return Math.max(...items.map(i => i.prepTime));
  }

  function isEmpty() {
    return getItems().length === 0;
  }

  return {
    getItems, addItem, updateQty, removeItem, clear,
    getTotal, getTotalItems, getEstimatedPrepTime, isEmpty
  };
})();
