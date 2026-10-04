/* ============================================
   SMART CANTEEN – Seed Data
   ============================================ */

const SEED_USERS = [
  { id: 'U001', username: 'student', password: 'MTIzNA==', name: 'Ananya Sharma', role: 'student', avatar: 'AS', favorites: [], itemCounts: {}, categoryCounts: {} },
  { id: 'U002', username: 'kitchen', password: 'MTIzNA==', name: 'Chef Rajan', role: 'kitchen', avatar: 'CR', favorites: [], itemCounts: {}, categoryCounts: {} },
  { id: 'U003', username: 'admin', password: 'MTIzNA==', name: 'Administration', role: 'admin', avatar: 'AD', favorites: [], itemCounts: {}, categoryCounts: {} },
  { id: 'U004', username: 'priya', password: 'MTIzNA==', name: 'Priya Patel', role: 'student', avatar: 'PP', favorites: [], itemCounts: {}, categoryCounts: {} },
  { id: 'U005', username: 'rahul', password: 'MTIzNA==', name: 'Rahul Kumar', role: 'student', avatar: 'RK', favorites: [], itemCounts: {}, categoryCounts: {} }
];

const FOOD_EMOJIS = {
  'breakfast': '🍳', 'lunch': '🍛', 'snacks': '🍔', 'dinner': '🍽️',
  'drinks': '☕', 'desserts': '🍰', 'soup': '🥣', 'western': '🍕'
};

const SEED_MENU = [
  // --- Breakfast ---
  { id: 'F01', name: 'Masala Dosa', price: 50, category: 'breakfast', prepTime: 6, calories: 250, spice: 'medium', diet: 'veg', hungerLevel: 'medium', popularity: 92, rating: 4.7, ratingCount: 45, available: true, stock: 30, image: '', emoji: '🫓', pairsWith: ['F17','F20'], isCombo: false },
  { id: 'F02', name: 'Idli Sambar', price: 35, category: 'breakfast', prepTime: 4, calories: 180, spice: 'mild', diet: 'veg', hungerLevel: 'light', popularity: 88, rating: 4.5, ratingCount: 52, available: true, stock: 40, image: '', emoji: '🍚', pairsWith: ['F17'], isCombo: false },
  { id: 'F03', name: 'Poha', price: 30, category: 'breakfast', prepTime: 5, calories: 200, spice: 'mild', diet: 'veg', hungerLevel: 'light', popularity: 75, rating: 4.3, ratingCount: 30, available: true, stock: 25, image: '', emoji: '🥣', pairsWith: ['F17','F18'], isCombo: false },
  { id: 'F04', name: 'Aloo Paratha', price: 45, category: 'breakfast', prepTime: 7, calories: 320, spice: 'medium', diet: 'veg', hungerLevel: 'medium', popularity: 85, rating: 4.6, ratingCount: 38, available: true, stock: 20, image: '', emoji: '🫓', pairsWith: ['F19'], isCombo: false },
  { id: 'F05', name: 'Egg Bhurji', price: 40, category: 'breakfast', prepTime: 5, calories: 280, spice: 'medium', diet: 'non-veg', hungerLevel: 'medium', popularity: 78, rating: 4.4, ratingCount: 28, available: true, stock: 20, image: '', emoji: '🥚', pairsWith: ['F04'], isCombo: false },

  // --- Lunch ---
  { id: 'F06', name: 'Veg Thali', price: 80, category: 'lunch', prepTime: 10, calories: 550, spice: 'medium', diet: 'veg', hungerLevel: 'heavy', popularity: 95, rating: 4.8, ratingCount: 60, available: true, stock: 25, image: '', emoji: '🍛', pairsWith: ['F19'], isCombo: false },
  { id: 'F07', name: 'Chicken Biryani', price: 120, category: 'lunch', prepTime: 12, calories: 650, spice: 'spicy', diet: 'non-veg', hungerLevel: 'heavy', popularity: 97, rating: 4.9, ratingCount: 75, available: true, stock: 20, image: '', emoji: '🍗', pairsWith: ['F19','F21'], isCombo: false },
  { id: 'F08', name: 'Rajma Chawal', price: 65, category: 'lunch', prepTime: 8, calories: 480, spice: 'medium', diet: 'veg', hungerLevel: 'heavy', popularity: 82, rating: 4.5, ratingCount: 35, available: true, stock: 30, image: '', emoji: '🫘', pairsWith: ['F19'], isCombo: false },
  { id: 'F09', name: 'Paneer Butter Masala', price: 90, category: 'lunch', prepTime: 10, calories: 420, spice: 'medium', diet: 'veg', hungerLevel: 'medium', popularity: 90, rating: 4.7, ratingCount: 48, available: true, stock: 15, image: '', emoji: '🧀', pairsWith: ['F08'], isCombo: false },
  { id: 'F10', name: 'Dal Fry Rice', price: 55, category: 'lunch', prepTime: 7, calories: 380, spice: 'mild', diet: 'veg', hungerLevel: 'medium', popularity: 70, rating: 4.2, ratingCount: 22, available: true, stock: 30, image: '', emoji: '🍲', pairsWith: ['F19'], isCombo: false },

  // --- Snacks ---
  { id: 'F11', name: 'Veg Burger', price: 60, category: 'snacks', prepTime: 5, calories: 420, spice: 'medium', diet: 'veg', hungerLevel: 'medium', popularity: 87, rating: 4.6, ratingCount: 42, available: true, stock: 25, image: '', emoji: '🍔', pairsWith: ['F15','F18'], isCombo: false },
  { id: 'F12', name: 'Samosa', price: 15, category: 'snacks', prepTime: 3, calories: 180, spice: 'spicy', diet: 'veg', hungerLevel: 'light', popularity: 93, rating: 4.4, ratingCount: 80, available: true, stock: 50, image: '', emoji: '🥟', pairsWith: ['F17'], isCombo: false },
  { id: 'F13', name: 'French Fries', price: 40, category: 'snacks', prepTime: 4, calories: 310, spice: 'none', diet: 'veg', hungerLevel: 'light', popularity: 80, rating: 4.3, ratingCount: 35, available: true, stock: 30, image: '', emoji: '🍟', pairsWith: ['F11','F18'], isCombo: false },
  { id: 'F14', name: 'Chicken Sandwich', price: 70, category: 'snacks', prepTime: 6, calories: 380, spice: 'mild', diet: 'non-veg', hungerLevel: 'medium', popularity: 76, rating: 4.5, ratingCount: 25, available: true, stock: 20, image: '', emoji: '🥪', pairsWith: ['F13','F18'], isCombo: false },
  { id: 'F15', name: 'Pav Bhaji', price: 50, category: 'snacks', prepTime: 6, calories: 350, spice: 'medium', diet: 'veg', hungerLevel: 'medium', popularity: 84, rating: 4.5, ratingCount: 40, available: true, stock: 20, image: '', emoji: '🫓', pairsWith: ['F18'], isCombo: false },

  // --- Drinks ---
  { id: 'F17', name: 'Masala Chai', price: 15, category: 'drinks', prepTime: 2, calories: 90, spice: 'mild', diet: 'veg', hungerLevel: 'light', popularity: 98, rating: 4.8, ratingCount: 100, available: true, stock: 50, image: '', emoji: '☕', pairsWith: ['F12'], isCombo: false },
  { id: 'F18', name: 'Cold Coffee', price: 40, category: 'drinks', prepTime: 3, calories: 180, spice: 'none', diet: 'veg', hungerLevel: 'light', popularity: 85, rating: 4.6, ratingCount: 45, available: true, stock: 30, image: '', emoji: '🧋', pairsWith: ['F13'], isCombo: false },
  { id: 'F19', name: 'Lassi', price: 30, category: 'drinks', prepTime: 2, calories: 150, spice: 'none', diet: 'veg', hungerLevel: 'light', popularity: 80, rating: 4.4, ratingCount: 35, available: true, stock: 25, image: '', emoji: '🥛', pairsWith: ['F07'], isCombo: false },
  { id: 'F20', name: 'Fresh Lime Soda', price: 25, category: 'drinks', prepTime: 2, calories: 60, spice: 'none', diet: 'veg', hungerLevel: 'light', popularity: 78, rating: 4.3, ratingCount: 30, available: true, stock: 30, image: '', emoji: '🍋', pairsWith: [], isCombo: false },
  { id: 'F21', name: 'Mango Shake', price: 45, category: 'drinks', prepTime: 3, calories: 220, spice: 'none', diet: 'veg', hungerLevel: 'light', popularity: 83, rating: 4.5, ratingCount: 28, available: true, stock: 20, image: '', emoji: '🥭', pairsWith: [], isCombo: false },

  // --- Dinner ---
  { id: 'F22', name: 'Butter Naan + Curry', price: 85, category: 'dinner', prepTime: 10, calories: 500, spice: 'medium', diet: 'veg', hungerLevel: 'heavy', popularity: 88, rating: 4.6, ratingCount: 40, available: true, stock: 20, image: '', emoji: '🫓', pairsWith: ['F19'], isCombo: false },
  { id: 'F23', name: 'Chicken Curry Rice', price: 100, category: 'dinner', prepTime: 12, calories: 600, spice: 'spicy', diet: 'non-veg', hungerLevel: 'heavy', popularity: 86, rating: 4.7, ratingCount: 35, available: true, stock: 15, image: '', emoji: '🍛', pairsWith: ['F19'], isCombo: false },
  { id: 'F24', name: 'Veg Fried Rice', price: 55, category: 'dinner', prepTime: 6, calories: 350, spice: 'mild', diet: 'veg', hungerLevel: 'medium', popularity: 74, rating: 4.2, ratingCount: 20, available: true, stock: 25, image: '', emoji: '🍚', pairsWith: ['F21'], isCombo: false },
  { id: 'F25', name: 'Egg Fried Rice', price: 60, category: 'dinner', prepTime: 6, calories: 380, spice: 'mild', diet: 'non-veg', hungerLevel: 'medium', popularity: 77, rating: 4.3, ratingCount: 25, available: true, stock: 20, image: '', emoji: '🥚', pairsWith: ['F21'], isCombo: false },

  // --- Desserts ---
  { id: 'F26', name: 'Gulab Jamun', price: 25, category: 'desserts', prepTime: 2, calories: 180, spice: 'none', diet: 'veg', hungerLevel: 'light', popularity: 90, rating: 4.7, ratingCount: 50, available: true, stock: 30, image: '', emoji: '🍩', pairsWith: [], isCombo: false },
  { id: 'F27', name: 'Rasgulla', price: 25, category: 'desserts', prepTime: 2, calories: 160, spice: 'none', diet: 'veg', hungerLevel: 'light', popularity: 82, rating: 4.5, ratingCount: 32, available: true, stock: 25, image: '', emoji: '⚪', pairsWith: [], isCombo: false },
  { id: 'F28', name: 'Ice Cream Cup', price: 30, category: 'desserts', prepTime: 1, calories: 200, spice: 'none', diet: 'veg', hungerLevel: 'light', popularity: 88, rating: 4.6, ratingCount: 55, available: true, stock: 40, image: '', emoji: '🍨', pairsWith: [], isCombo: false },

  // --- Combos ---
  { id: 'F30', name: 'Breakfast Combo', price: 70, category: 'breakfast', prepTime: 8, calories: 450, spice: 'medium', diet: 'veg', hungerLevel: 'medium', popularity: 79, rating: 4.4, ratingCount: 18, available: true, stock: 15, image: '', emoji: '🥞', pairsWith: [], isCombo: true, comboItems: ['Dosa + Chai + Sambar'] },
  { id: 'F31', name: 'Lunch Combo', price: 99, category: 'lunch', prepTime: 12, calories: 700, spice: 'medium', diet: 'veg', hungerLevel: 'heavy', popularity: 84, rating: 4.6, ratingCount: 22, available: true, stock: 12, image: '', emoji: '🍱', pairsWith: [], isCombo: true, comboItems: ['Thali + Lassi + Gulab Jamun'] },
  { id: 'F32', name: 'Snack Combo', price: 55, category: 'snacks', prepTime: 6, calories: 500, spice: 'medium', diet: 'veg', hungerLevel: 'medium', popularity: 76, rating: 4.3, ratingCount: 15, available: true, stock: 20, image: '', emoji: '🧺', pairsWith: [], isCombo: true, comboItems: ['Burger + Fries + Cold Coffee'] }
];

const SEED_SETTINGS = {
  counters: 3,
  promoBanner: "Today's Special: Get 20% off on all combos! Order now and beat the queue 🎉",
  agingThreshold: 15,
  schedulingMode: 'fifo',
  canteenName: 'SMART CANTEEN'
};

const DEFAULT_PROFILE = {
  favorites: [],
  itemCounts: {},
  categoryCounts: {},
  totalOrders: 0,
  totalSpent: 0
};
