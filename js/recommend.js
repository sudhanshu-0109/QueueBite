/* ============================================
   SMART CANTEEN – Recommendation Engine
   Rule-based, AI-style scoring
   ============================================ */

const Recommend = (() => {
  'use strict';

  /**
   * Score a menu item against user preferences
   * Returns 0-100
   */
  function scoreItem(food, prefs, userProfile) {
    let score = 0;
    const reasons = [];

    // --- Diet filter (hard filter) ---
    if (prefs.diet && prefs.diet !== 'any') {
      if (prefs.diet === 'veg' && food.diet !== 'veg') return { score: -1, reasons: ['Not vegetarian'] };
      if (prefs.diet === 'vegan' && food.diet !== 'veg') return { score: -1, reasons: ['Not vegan-friendly'] };
    }

    // --- Budget (25 points) ---
    if (prefs.budget && prefs.budget > 0) {
      if (food.price <= prefs.budget) {
        score += 25;
        reasons.push('✓ Fits your budget');
      } else if (food.price <= prefs.budget * 1.3) {
        const ratio = 1 - (food.price - prefs.budget) / (prefs.budget * 0.3);
        score += Math.round(25 * ratio);
        reasons.push('~ Slightly over budget');
      } else {
        reasons.push({ text: 'Over budget', fail: true });
      }
    } else {
      score += 25; // No budget constraint
    }

    // --- Time (20 points) ---
    if (prefs.availableTime && prefs.availableTime > 0) {
      if (food.prepTime <= prefs.availableTime) {
        score += 20;
        reasons.push(`✓ Ready in ~${food.prepTime} min`);
      } else {
        const overBy = food.prepTime - prefs.availableTime;
        if (overBy <= 3) {
          score += 10;
          reasons.push(`~ May take ${overBy} min extra`);
        } else {
          reasons.push({ text: 'Takes too long', fail: true });
        }
      }
    } else {
      score += 20;
    }

    // --- Spice (10 points) ---
    if (prefs.spice) {
      const levels = ['none', 'mild', 'medium', 'spicy'];
      const prefIdx = levels.indexOf(prefs.spice);
      const foodIdx = levels.indexOf(food.spice);
      if (prefIdx === foodIdx) {
        score += 10;
        reasons.push(`✓ Matches ${prefs.spice} preference`);
      } else if (Math.abs(prefIdx - foodIdx) === 1) {
        score += 5;
      }
    } else {
      score += 10;
    }

    // --- Hunger (10 points) ---
    if (prefs.hunger) {
      const hungerMap = { light: 'light', medium: 'medium', heavy: 'heavy' };
      if (food.hungerLevel === prefs.hunger) {
        score += 10;
        reasons.push('✓ Right portion size');
      } else {
        score += 3;
      }
    } else {
      score += 10;
    }

    // --- Popularity (10 points) ---
    score += Math.round(food.popularity / 10);
    if (food.popularity >= 85) {
      reasons.push('✓ Popular choice');
    }

    // --- History / Personalization (10 points) ---
    if (userProfile) {
      const itemCount = userProfile.itemCounts[food.id] || 0;
      const catCount = userProfile.categoryCounts[food.category] || 0;

      if (itemCount > 0) {
        score += Math.min(5, itemCount);
        reasons.push(`✓ You've ordered this ${itemCount}× before`);
      }
      if (catCount > 3) {
        score += Math.min(5, Math.floor(catCount / 2));
        reasons.push(`✓ You love ${food.category}`);
      }
    }

    // --- Meal type match ---
    if (prefs.mealType && prefs.mealType !== 'any') {
      if (food.category === prefs.mealType) {
        score += 5;
        reasons.push('✓ Matches your meal choice');
      } else {
        score -= 5;
      }
    }

    // Cap at 100
    score = Math.min(100, Math.max(0, score));

    return {
      score,
      reasons: reasons.filter(r => typeof r === 'string'),
      failReasons: reasons.filter(r => typeof r === 'object').map(r => r.text)
    };
  }

  /**
   * Get recommendations based on preferences
   */
  function getRecommendations(prefs) {
    const menu = Storage.load('sc_menu', []);
    const user = Auth.getCurrentUser();
    const profiles = Storage.load('sc_profiles', {});
    const profile = user ? profiles[user.id] : null;

    const available = menu.filter(f => f.available && f.stock > 0);

    const scored = available.map(food => {
      const result = scoreItem(food, prefs, profile);
      return { food, ...result };
    }).filter(r => r.score >= 0);  // Remove hard-filtered items

    scored.sort((a, b) => b.score - a.score);

    return {
      bestMatch: scored[0] || null,
      alternatives: scored.slice(1, 4),
      all: scored
    };
  }

  /**
   * Find budget combos (1-2 items that fit budget)
   */
  function findBudgetCombos(budget, diet = 'any') {
    const menu = Storage.load('sc_menu', []);
    const available = menu.filter(f => f.available && f.stock > 0);
    const filtered = diet !== 'any' ? available.filter(f => f.diet === diet || diet === 'any') : available;

    const combos = [];

    // Single items
    filtered.forEach(f => {
      if (f.price <= budget) {
        combos.push({
          items: [f],
          total: f.price,
          score: f.popularity + (budget - f.price) / budget * 20
        });
      }
    });

    // Two-item combos
    for (let i = 0; i < filtered.length; i++) {
      for (let j = i + 1; j < filtered.length; j++) {
        const total = filtered[i].price + filtered[j].price;
        if (total <= budget) {
          combos.push({
            items: [filtered[i], filtered[j]],
            total,
            score: (filtered[i].popularity + filtered[j].popularity) / 2 + (budget - total) / budget * 10
          });
        }
      }
    }

    combos.sort((a, b) => b.score - a.score);
    return combos.slice(0, 3);
  }

  /**
   * Get upsell suggestions based on current cart
   */
  function getUpsellSuggestions() {
    const cart = Cart.getItems();
    if (cart.length === 0) return [];

    const menu = Storage.load('sc_menu', []);
    const cartIds = new Set(cart.map(i => i.foodId));
    const suggestions = new Set();

    cart.forEach(item => {
      const food = menu.find(f => f.id === item.foodId);
      if (food && food.pairsWith) {
        food.pairsWith.forEach(pId => {
          if (!cartIds.has(pId)) {
            const pair = menu.find(f => f.id === pId && f.available && f.stock > 0);
            if (pair) suggestions.add(pair);
          }
        });
      }
    });

    return [...suggestions].slice(0, 3);
  }

  return { getRecommendations, findBudgetCombos, getUpsellSuggestions, scoreItem };
})();
