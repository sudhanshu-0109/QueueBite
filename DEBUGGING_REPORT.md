ROOT CAUSE
-----------
The authentication flow was failing immediately after a successful credential check because of how cookies behave locally. The `Auth.login` method correctly generated a session ID, saved it to `localStorage` (`sc_currentSession`), and attempted to write a `canteen_session` cookie via `document.cookie`. However, modern browsers (like Chrome) completely ignore `document.cookie` modifications when a site is loaded via the `file://` protocol. 

Because of this, when `renderApp()` initialized the dashboard, it called `Auth.getCurrentUser()`, which strictly verified that the `canteen_session` cookie matched the session ID in `localStorage`. Since the cookie was silently dropped by the browser, this check failed, triggering an immediate silent `logout()` and keeping the user stuck on the login screen.

ENDPOINTS CHECKED
-----------------
The entire project was audited for `fetch`, `XMLHttpRequest`, and backend API calls. 
- **Status**: No external API endpoints or backend URLs were found in the codebase. 
- All data flows currently correctly utilize the `Storage` wrapper (`localStorage` / `sessionStorage`), which aligns precisely with the frontend-only requirement. Therefore, there are no broken endpoints to replace.

FILES CHANGED
-------------
1. `js/storage.js`
2. `js/ui.js`
3. `js/app.js`

FIXES MADE
----------
1. **Fixed Local Cookie Behavior (`js/storage.js`)**: 
   Updated `setCookie`, `getCookie`, and `deleteCookie` to dynamically detect if the application is running via the `file://` protocol (`window.location.protocol === 'file:'`). If it is, the cookie wrappers transparently fallback to `sessionStorage` (e.g., `sessionSave('cookie_' + name)`). This preserves the intended session-cookie behavior entirely on the client without breaking local execution.
2. **Added Demo Login UI (`js/ui.js`)**:
   Added a new "Demo Login" section right below the normal login form with three dedicated buttons corresponding to the three exact roles present in the project (`Student`, `Kitchen`, and `Admin`).
3. **Wired Demo Login Behaviors (`js/app.js`)**:
   In `bindLoginEvents()`, added event listeners to the new demo buttons. These buttons securely invoke the existing `Auth.login(role, '1234', role)` flow, utilizing the exact same authentication paths, session generation, and dashboard routing logic as a normal user.

DEMO LOGIN
----------
Student → Working
Kitchen → Working
Admin → Working

DASHBOARD TEST
--------------
Student → Working (Dashboard loads successfully, menu accessible)
Kitchen → Working (Live queue and counters initialize correctly)
Admin → Working (Analytics and seed data render successfully)
