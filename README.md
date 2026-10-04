# SmartCanteen Management System

SmartCanteen is a fully client-side canteen management system built with HTML5, CSS3, and ES6+ JavaScript. It features a digital menu, order queuing, kitchen dashboard, and an intelligent recommendation engine.

## Features

- **Role-based Dashboards:** Dedicated views for Students, Kitchen Staff, and Administration.
- **Smart Queue Management:** Core DSA implementation of a Linked-List Queue for order processing.
- **Scheduling Strategies:** Toggle between standard FIFO (First-In-First-Out) and Smart SJF (Shortest Job First) with starvation guards.
- **Recommendation Engine:** Rule-based AI-style assistant that suggests meals based on budget, time, diet, hunger, and order history.
- **Live Tracking:** Real-time progress bars and "people ahead" estimates for students.
- **Public Display:** A separate `display.html` screen that stays in sync across tabs to show "NOW SERVING" tokens.
- **Analytics & Insights:** Peak hour detection, popular dishes, revenue tracking, and automated actionable insights.
- **Persistent Storage:** Uses `localStorage` as a client-side database, `sessionStorage` for carts, and `cookies` for session management.

## Demo Logins

The application is pre-seeded with data. Use the following credentials to test different roles:

| Role | Username | Password |
| :--- | :--- | :--- |
| Student | `student` | `1234` |
| Kitchen | `kitchen` | `1234` |
| Admin | `admin` | `1234` |

## How to Run

Because this is a pure client-side application with no build steps or bundlers, you can run it directly:

1. Open `index.html` in any modern web browser (Chrome, Edge, Firefox).
2. For the public display screen, open `display.html` in a separate tab or window.
3. *Note: Running locally via `file://` protocol works, but using a simple local web server (like VS Code Live Server or `npx serve`) is recommended to ensure all `localStorage` events fire correctly across tabs.*

## Core Data Structures & Algorithms

### 1. Linked-List Queue
The core of the kitchen order processing is implemented from scratch as a Linked-List `Queue` class (`js/queue.js`).
- **O(1)** `enqueue()` and `dequeue()` operations.
- Avoids the O(n) penalty of using standard JavaScript array `shift()`.
- Automatically persists to localStorage on every mutation.

### 2. Smart Scheduling (SJF with Aging)
While FIFO is the default, the Kitchen can toggle "Smart Scheduling".
- Sorts a copy of the queue by `prepMinutes` ascending.
- **Starvation Guard (Aging):** Any order waiting longer than the threshold (default 15 minutes) is pushed to the front, regardless of its prep time.

### 3. Rule-Based Scoring Engine
The Smart Assistant (`js/recommend.js`) scores menu items from 0-100 based on multiple weighted factors:
- Budget (25 pts), Time (20 pts), Diet (Hard filter), Spice (10 pts), Hunger (10 pts), Popularity (10 pts), and Historical frequency (10 pts).

## Storage Architecture

This project simulates a full-stack environment entirely on the client:

- **localStorage:** Acts as the primary database (`sc_users`, `sc_menu`, `sc_orders`, `sc_queue`, etc.).
- **sessionStorage:** Handles transient state like the active shopping cart and active search filters.
- **Cookies:** Manages simulated session tokens and UI theme preferences.
- **Cross-Tab Sync:** Utilizes the `window.addEventListener('storage')` API to keep the Student tab, Kitchen tab, and Display screen synchronized in real-time without WebSockets.

## Limitations & Future Scope

This is a demonstration project built for a viva/presentation context.
- **Security:** Passwords are base64 encoded and session cookies are client-side. In a production environment, this requires a secure backend (Node.js/Python) and proper JWT authentication.
- **Storage Limits:** `localStorage` is typically limited to ~5MB.
- **Syncing:** Cross-tab sync relies on local browser storage events and does not sync across different physical devices.
- **Future Scope:** Integrating a real database (PostgreSQL/MongoDB), WebSocket server for multi-device real-time updates, SMS/Push notifications for ready orders, and replacing the rule-based recommender with a collaborative filtering ML model.
