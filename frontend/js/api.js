// API Client for Smart Warehouse Platform
const API_BASE = "";

const API = {
  // Generic Fetch Helper
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        let errMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
          }
        } catch (e) {}
        throw new Error(errMessage);
      }
      return await response.json();
    } catch (err) {
      console.error(`API Request failed for ${endpoint}:`, err);
      throw err;
    }
  },

  // Dashboard
  getDashboard() {
    return this.request("/api/dashboard");
  },

  // Inventory
  getInventory(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/inventory${query ? '?' + query : ''}`);
  },
  getProductDetails(id) {
    return this.request(`/api/inventory/${id}`);
  },
  adjustInventory(data) {
    return this.request("/api/inventory/adjust", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Orders
  getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/orders${query ? '?' + query : ''}`);
  },
  getOrderDetails(id) {
    return this.request(`/api/orders/${id}`);
  },
  createOrder(data) {
    return this.request("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  allocateOrder(id) {
    return this.request(`/api/orders/${id}/allocate`, {
      method: "POST",
    });
  },

  // Picking
  getPickingTasks(status) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return this.request(`/api/picking/tasks${query}`);
  },
  getPickingTask(id) {
    return this.request(`/api/picking/tasks/${id}`);
  },
  createPickingTaskForOrder(orderId, pickerName) {
    return this.request(`/api/picking/create-for-order/${orderId}?picker_name=${encodeURIComponent(pickerName || 'Alex Chen')}`, {
      method: "POST",
    });
  },
  performPickingAction(data) {
    return this.request("/api/picking/action", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Packing
  getPackingTasks(status) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return this.request(`/api/packing/tasks${query}`);
  },
  performPackingAction(data) {
    return this.request("/api/packing/action", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Exceptions
  getExceptions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/exceptions${query ? '?' + query : ''}`);
  },
  performExceptionAction(data) {
    return this.request("/api/exceptions/action", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Dispatches
  getDispatches(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/dispatches${query ? '?' + query : ''}`);
  },
  confirmDispatch(data) {
    return this.request("/api/dispatches/confirm", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  markDelivered(orderId) {
    return this.request(`/api/dispatches/deliver/${orderId}`, {
      method: "POST",
    });
  },

  // Analytics
  getAnalytics() {
    return this.request("/api/analytics");
  },

  // Demo Scenario
  getDemoScenarioState() {
    return this.request("/api/demo/scenario-state");
  },
  resetDemoScenario() {
    return this.request("/api/demo/reset-scenario", {
      method: "POST",
    });
  },
  executeSmartAllocationDemoStep() {
    return this.request("/api/demo/execute-smart-allocation-step", {
      method: "POST",
    });
  },

  // Audit & Notifications
  getAuditLogs(limit = 50, entityType = null) {
    const query = entityType ? `?limit=${limit}&entity_type=${encodeURIComponent(entityType)}` : `?limit=${limit}`;
    return this.request(`/api/audit/logs${query}`);
  },
  getNotifications() {
    return this.request("/api/audit/notifications");
  },
  markNotificationsRead() {
    return this.request("/api/audit/notifications/mark-read", {
      method: "POST",
    });
  }
};
