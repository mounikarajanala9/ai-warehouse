// Header & Navbar Component
const Navbar = {
  render(currentRole = "Warehouse Manager", unreadCount = 0) {
    return `
      <header class="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
        <!-- Left: Logo and Live Status -->
        <div class="flex items-center gap-4">
          <button id="btn-sidebar-toggle" class="lg:hidden text-slate-400 hover:text-white p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <div class="flex items-center gap-3 cursor-pointer" onclick="App.navigate('landing')">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-base tracking-tight text-white">SMART WAREHOUSE</span>
                <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">INTELLIGENCE</span>
              </div>
              <p class="text-[11px] text-slate-400 hidden sm:block">Operations & Order Fulfillment Decision Engine</p>
            </div>
          </div>

          <!-- Warehouse Pulse Badge -->
          <div class="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span class="w-2 h-2 rounded-full bg-emerald-400 live-pulse"></span>
            <span>Warehouse Live: Zone A-D Online</span>
          </div>
        </div>

        <!-- Middle: Global Search Trigger -->
        <div class="hidden md:flex items-center flex-1 max-w-md mx-6">
          <button id="btn-global-search" class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 text-sm transition-colors shadow-inner">
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <span>Search orders, SKUs, locations...</span>
            </div>
            <kbd class="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">⌘K</kbd>
          </button>
        </div>

        <!-- Right: Role Switcher, Notifications, Actions -->
        <div class="flex items-center gap-3">
          <!-- Role Switcher -->
          <div class="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-xs">
            <span class="text-slate-500 px-2 font-medium hidden sm:inline">Role:</span>
            <select id="role-selector" class="bg-slate-800 text-slate-200 border-none rounded-lg px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer">
              <option value="Warehouse Manager" ${currentRole === "Warehouse Manager" ? "selected" : ""}>Warehouse Manager</option>
              <option value="Picker" ${currentRole === "Picker" ? "selected" : ""}>Picker (Alex Chen)</option>
              <option value="Packing Staff" ${currentRole === "Packing Staff" ? "selected" : ""}>Packing Staff (Sam Rivera)</option>
              <option value="Admin" ${currentRole === "Admin" ? "selected" : ""}>Admin / Architect</option>
            </select>
          </div>

          <!-- Demo Scenario Star Button -->
          <button id="btn-open-demo-scenario" class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all hover:scale-105 active:scale-95" onclick="App.navigate('demo_scenario')">
            <svg class="w-3.5 h-3.5 text-amber-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            <span>Live Demo Showdown</span>
          </button>

          <!-- New Order Quick Action -->
          <button id="btn-quick-new-order" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/25 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span class="hidden sm:inline">New Order</span>
          </button>

          <!-- Notifications Bell -->
          <div class="relative">
            <button id="btn-toggle-notifs" class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 relative">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              ${unreadCount > 0 ? `<span id="notif-badge" class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">${unreadCount}</span>` : ""}
            </button>

            <!-- Notifications Dropdown -->
            <div id="notif-dropdown" class="hidden absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 class="font-semibold text-sm text-white">System Alerts & Decision Feed</h4>
                <button id="btn-mark-all-read" class="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>
              </div>
              <div id="notif-list-container" class="mt-3 space-y-2 max-h-80 overflow-y-auto">
                <p class="text-xs text-slate-400 text-center py-4">Loading notifications...</p>
              </div>
            </div>
          </div>
        </div>
      </header>
    `;
  },

  bindEvents() {
    // Role selector change
    const roleSelector = document.getElementById("role-selector");
    if (roleSelector) {
      roleSelector.addEventListener("change", (e) => {
        App.setRole(e.target.value);
      });
    }

    // Global search trigger
    const btnSearch = document.getElementById("btn-global-search");
    if (btnSearch) {
      btnSearch.addEventListener("click", () => {
        Modals.openGlobalSearch();
      });
    }

    // Key shortcut Ctrl+K or Cmd+K
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        Modals.openGlobalSearch();
      }
    });

    // New Order button
    const btnNewOrder = document.getElementById("btn-quick-new-order");
    if (btnNewOrder) {
      btnNewOrder.addEventListener("click", () => {
        Modals.openCreateOrderModal();
      });
    }

    // Notifications toggle
    const btnNotifs = document.getElementById("btn-toggle-notifs");
    const notifDropdown = document.getElementById("notif-dropdown");
    if (btnNotifs && notifDropdown) {
      btnNotifs.addEventListener("click", (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle("hidden");
        if (!notifDropdown.classList.contains("hidden")) {
          this.loadNotifications();
        }
      });

      document.addEventListener("click", (e) => {
        if (!notifDropdown.contains(e.target) && e.target !== btnNotifs) {
          notifDropdown.classList.add("hidden");
        }
      });
    }

    const btnMarkRead = document.getElementById("btn-mark-all-read");
    if (btnMarkRead) {
      btnMarkRead.addEventListener("click", async () => {
        try {
          await API.markNotificationsRead();
          const badge = document.getElementById("notif-badge");
          if (badge) badge.remove();
          this.loadNotifications();
          Toast.show("All notifications marked as read.", "success");
        } catch (e) {
          Toast.show("Failed to mark notifications.", "error");
        }
      });
    }
  },

  async loadNotifications() {
    const container = document.getElementById("notif-list-container");
    if (!container) return;
    try {
      const data = await API.getNotifications();
      if (!data.notifications || data.notifications.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No active notifications</p>`;
        return;
      }
      container.innerHTML = data.notifications.map(n => `
        <div class="p-2.5 rounded-xl ${n.severity === 'critical' ? 'bg-rose-950/30 border border-rose-800/30' : n.severity === 'high' ? 'bg-amber-950/30 border border-amber-800/30' : 'bg-slate-800/40 border border-slate-800'} text-xs">
          <div class="font-semibold text-slate-200">${n.title}</div>
          <div class="text-slate-400 mt-0.5">${n.message}</div>
          <div class="text-[10px] text-slate-500 mt-1">${n.created_at || 'Just now'}</div>
        </div>
      `).join("");
    } catch (e) {
      container.innerHTML = `<p class="text-xs text-rose-400 text-center py-2">Error loading notifications</p>`;
    }
  }
};
