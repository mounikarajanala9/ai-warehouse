// Main Application Controller & Single Page Router
const App = {
  currentView: "dashboard",
  currentRole: "Warehouse Manager",
  currentParams: null,

  async init() {
    console.log("Initializing Smart Warehouse Intelligence Platform...");
    
    // Check URL hash for routing
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      if (hash.startsWith("order/")) {
        const orderId = parseInt(hash.split("/")[1]);
        this.currentView = "order_detail";
        this.currentParams = orderId;
      } else {
        this.currentView = hash;
      }
    }

    // Listen for hash changes
    window.addEventListener("hashchange", () => {
      const newHash = window.location.hash.replace("#", "");
      if (newHash.startsWith("order/")) {
        const orderId = parseInt(newHash.split("/")[1]);
        this.currentView = "order_detail";
        this.currentParams = orderId;
      } else if (newHash) {
        this.currentView = newHash;
        this.currentParams = null;
      }
      this.render();
    });

    await this.render();
  },

  setRole(newRole) {
    this.currentRole = newRole;
    Toast.show(`Switched active role perspective to: ${newRole}`, "info");

    // Auto navigate if role has specific terminal focus
    if (newRole === "Picker") {
      this.navigate("picking");
    } else if (newRole === "Packing Staff") {
      this.navigate("packing");
    } else if (this.currentView === "picking" || this.currentView === "packing") {
      this.navigate("dashboard");
    } else {
      this.render();
    }
  },

  navigate(viewName, params = null) {
    this.currentView = viewName;
    this.currentParams = params;

    if (viewName === "order_detail" && params) {
      window.location.hash = `order/${params}`;
    } else {
      window.location.hash = viewName;
    }

    // Close mobile sidebar if open
    const sidebar = document.getElementById("app-sidebar");
    if (sidebar) {
      sidebar.classList.add("-translate-x-full");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    this.render();
  },

  openOrderDetails(orderId) {
    this.navigate("order_detail", orderId);
  },

  async render() {
    const navbarContainer = document.getElementById("navbar-container");
    const sidebarContainer = document.getElementById("sidebar-container");
    const mainContent = document.getElementById("main-content");

    if (!navbarContainer || !sidebarContainer || !mainContent) return;

    // 1. Render Navbar
    try {
      const notifData = await API.getNotifications().catch(() => ({ unread_count: 0 }));
      navbarContainer.innerHTML = Navbar.render(this.currentRole, notifData.unread_count || 0);
      Navbar.bindEvents();
    } catch (e) {
      navbarContainer.innerHTML = Navbar.render(this.currentRole, 0);
    }

    // 2. Render Sidebar
    sidebarContainer.innerHTML = Sidebar.render(this.currentView, this.currentRole);

    // Bind mobile sidebar toggle
    const toggleBtn = document.getElementById("btn-sidebar-toggle");
    const sidebarEl = document.getElementById("app-sidebar");
    if (toggleBtn && sidebarEl) {
      toggleBtn.addEventListener("click", () => {
        sidebarEl.classList.toggle("-translate-x-full");
      });
    }

    // 3. Render Active View
    if (this.currentView === "landing") {
      await LandingView.render(mainContent);
    } else if (this.currentView === "dashboard") {
      await DashboardView.render(mainContent);
    } else if (this.currentView === "demo_scenario") {
      await DemoScenarioView.render(mainContent);
    } else if (this.currentView === "inventory") {
      await InventoryView.render(mainContent);
    } else if (this.currentView === "orders") {
      await OrdersView.render(mainContent);
    } else if (this.currentView === "order_detail") {
      await OrderDetailView.render(mainContent, this.currentParams);
    } else if (this.currentView === "picking") {
      await PickingView.render(mainContent);
    } else if (this.currentView === "packing") {
      await PackingView.render(mainContent);
    } else if (this.currentView === "exceptions") {
      await ExceptionsView.render(mainContent);
    } else if (this.currentView === "dispatches") {
      await DispatchesView.render(mainContent);
    } else if (this.currentView === "analytics") {
      await AnalyticsView.render(mainContent);
    } else if (this.currentView === "audit_logs") {
      await AuditLogsView.render(mainContent);
    } else {
      await DashboardView.render(mainContent);
    }
  }
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
