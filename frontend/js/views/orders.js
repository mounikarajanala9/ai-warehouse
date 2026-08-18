// Order Management & Fulfillment Hub View
const OrdersView = {
  currentStatus: "All",
  currentPriority: "All",
  currentSearch: "",
  currentSort: "priority_desc",

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Order Fulfillment Hub</span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Multi-Factor Priority Scoring
              </span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">Autonomous stock allocation, priority-based SLA protection, and order tracking.</p>
          </div>
          <div class="flex items-center gap-2.5">
            <button onclick="Modals.openCreateOrderModal()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>+ Create Order</span>
            </button>
          </div>
        </div>

        <!-- Filters Toolbar -->
        <div class="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            <!-- Search -->
            <div class="relative flex-1 min-w-[200px] max-w-sm">
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" id="ord-search-input" placeholder="Search order #, customer, picker..." value="${this.currentSearch}" class="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-indigo-500 outline-none">
            </div>

            <!-- Priority Filter -->
            <select id="ord-pri-select" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none cursor-pointer">
              <option value="All" ${this.currentPriority === 'All' ? 'selected' : ''}>All Priorities</option>
              <option value="Critical" ${this.currentPriority === 'Critical' ? 'selected' : ''}>Critical (Urgent)</option>
              <option value="High" ${this.currentPriority === 'High' ? 'selected' : ''}>High Priority</option>
              <option value="Medium" ${this.currentPriority === 'Medium' ? 'selected' : ''}>Medium Priority</option>
              <option value="Low" ${this.currentPriority === 'Low' ? 'selected' : ''}>Low Priority</option>
            </select>

            <!-- Status Filter -->
            <select id="ord-stat-select" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none cursor-pointer">
              <option value="All" ${this.currentStatus === 'All' ? 'selected' : ''}>All Workflow Stages</option>
              <option value="Created" ${this.currentStatus === 'Created' ? 'selected' : ''}>Created (Awaiting Allocation)</option>
              <option value="Allocated" ${this.currentStatus === 'Allocated' ? 'selected' : ''}>Allocated</option>
              <option value="Partially Allocated" ${this.currentStatus === 'Partially Allocated' ? 'selected' : ''}>Partially Allocated / Backorder</option>
              <option value="Waiting for Stock" ${this.currentStatus === 'Waiting for Stock' ? 'selected' : ''}>Waiting for Stock</option>
              <option value="Picking" ${this.currentStatus === 'Picking' ? 'selected' : ''}>Picking in Progress</option>
              <option value="Picked" ${this.currentStatus === 'Picked' ? 'selected' : ''}>Picked</option>
              <option value="Packing" ${this.currentStatus === 'Packing' ? 'selected' : ''}>Packing / QC</option>
              <option value="Packed" ${this.currentStatus === 'Packed' ? 'selected' : ''}>Packed (Ready to Ship)</option>
              <option value="Dispatched" ${this.currentStatus === 'Dispatched' ? 'selected' : ''}>Dispatched / In Transit</option>
            </select>
          </div>

          <!-- Sort -->
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-slate-400">Sort by:</span>
            <select id="ord-sort-select" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none cursor-pointer">
              <option value="priority_desc" ${this.currentSort === 'priority_desc' ? 'selected' : ''}>Priority Score (Highest First)</option>
              <option value="deadline_asc" ${this.currentSort === 'deadline_asc' ? 'selected' : ''}>Delivery Deadline (Soonest First)</option>
              <option value="id_desc" ${this.currentSort === 'id_desc' ? 'selected' : ''}>Newest Orders First</option>
            </select>
          </div>
        </div>

        <!-- Orders Table -->
        <div class="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
                <tr>
                  <th class="py-3 px-4">Order ID / Customer</th>
                  <th class="py-3 px-3">Priority Score</th>
                  <th class="py-3 px-3">Reason / Trigger</th>
                  <th class="py-3 px-3">Items Requested</th>
                  <th class="py-3 px-3">Deadline</th>
                  <th class="py-3 px-3 text-center">Fulfillment Status</th>
                  <th class="py-3 px-4 text-right">Smart Action</th>
                </tr>
              </thead>
              <tbody id="orders-table-body" class="divide-y divide-slate-800/60">
                <tr><td colspan="7" class="py-8 text-center text-slate-400">Loading order records...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.loadData();
  },

  bindEvents() {
    const searchInput = document.getElementById("ord-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.currentSearch = e.target.value;
        this.loadData();
      });
    }

    const priSelect = document.getElementById("ord-pri-select");
    if (priSelect) {
      priSelect.addEventListener("change", (e) => {
        this.currentPriority = e.target.value;
        this.loadData();
      });
    }

    const statSelect = document.getElementById("ord-stat-select");
    if (statSelect) {
      statSelect.addEventListener("change", (e) => {
        this.currentStatus = e.target.value;
        this.loadData();
      });
    }

    const sortSelect = document.getElementById("ord-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.currentSort = e.target.value;
        this.loadData();
      });
    }
  },

  async loadData() {
    try {
      const data = await API.getOrders({
        status: this.currentStatus,
        priority: this.currentPriority,
        search: this.currentSearch,
        sort_by: this.currentSort
      });

      const tbody = document.getElementById("orders-table-body");
      if (!tbody) return;

      if (!data.orders || data.orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400">No matching orders found.</td></tr>`;
        return;
      }

      tbody.innerHTML = data.orders.map(o => {
        const isCritical = o.priority === "Critical";
        const isHigh = o.priority === "High";

        let actionButton = "";
        if (o.status === "Created" || o.status === "Waiting for Stock") {
          actionButton = `
            <button onclick="OrdersView.allocateOrder(${o.id})" class="px-3 py-1 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-[11px] font-semibold transition-all">
              Smart Allocate →
            </button>
          `;
        } else if (o.status === "Allocated" || o.status === "Partially Allocated") {
          actionButton = `
            <button onclick="OrdersView.startPicking(${o.id})" class="px-3 py-1 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[11px] font-semibold transition-all">
              Start Picking →
            </button>
          `;
        } else if (o.status === "Picked") {
          actionButton = `
            <button onclick="App.navigate('packing')" class="px-3 py-1 rounded-xl bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 text-[11px] font-semibold transition-all">
              To Packing QC →
            </button>
          `;
        } else if (o.status === "Packed") {
          actionButton = `
            <button onclick="App.navigate('dispatches')" class="px-3 py-1 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-semibold transition-all">
              Dispatch Carrier →
            </button>
          `;
        } else {
          actionButton = `
            <button onclick="App.openOrderDetails(${o.id})" class="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-all">
              Details
            </button>
          `;
        }

        return `
          <tr class="hover:bg-slate-900/60 transition-colors ${isCritical ? 'bg-rose-950/10' : ''}">
            <!-- Order # & Customer -->
            <td class="py-3 px-4">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-white cursor-pointer hover:text-indigo-400" onclick="App.openOrderDetails(${o.id})">${o.order_number}</span>
                ${o.is_express ? `<span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">EXPRESS</span>` : ''}
              </div>
              <div class="text-[11px] text-slate-300 font-medium">${o.customer_name}</div>
              <div class="text-[10px] text-slate-500">${o.customer_type} Tier • Carrier: ${o.carrier || 'FedEx'}</div>
            </td>

            <!-- Priority -->
            <td class="py-3 px-3">
              <span class="font-bold text-[10px] px-2 py-0.5 rounded-full ${
                isCritical ? 'badge-critical' : isHigh ? 'badge-warning' : 'badge-healthy'
              }">${o.priority} (${o.priority_score} pts)</span>
            </td>

            <!-- Priority Reason -->
            <td class="py-3 px-3 max-w-xs">
              <div class="text-[11px] text-slate-300 font-mono line-clamp-2" title="${o.priority_reason}">
                ${o.priority_reason || 'Standard ground processing.'}
              </div>
            </td>

            <!-- Items -->
            <td class="py-3 px-3">
              <span class="font-semibold text-slate-200">${o.total_items} items</span>
              <div class="text-[10px] text-slate-400">
                ${(o.items || []).slice(0, 2).map(i => `${i.requested_qty}x ${i.sku}`).join(", ")}
              </div>
            </td>

            <!-- Deadline -->
            <td class="py-3 px-3 text-slate-300 text-[11px] font-mono">
              ${o.delivery_deadline.replace("T", " ")}
            </td>

            <!-- Status -->
            <td class="py-3 px-3 text-center">
              <span class="font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                o.status === 'Partially Allocated' || o.status === 'Waiting for Stock' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                o.status === 'Picking' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                o.status === 'Packed' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                o.status === 'Dispatched' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }">${o.status}</span>
            </td>

            <!-- Actions -->
            <td class="py-3 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                ${actionButton}
                <button onclick="App.openOrderDetails(${o.id})" class="p-1.5 text-slate-400 hover:text-white" title="View Full Timeline">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    } catch (e) {
      console.error(e);
    }
  },

  async allocateOrder(orderId) {
    try {
      const res = await API.allocateOrder(orderId);
      Toast.show(`Stock Allocated for ${res.order_number}! Status: ${res.new_order_status}`, "ai");
      this.loadData();
    } catch (err) {
      Toast.show(err.message, "error");
    }
  },

  async startPicking(orderId) {
    try {
      const res = await API.createPickingTaskForOrder(orderId, "Alex Chen");
      Toast.show(`Picking task ${res.task_code} generated with optimized route!`, "success");
      App.navigate("picking");
    } catch (err) {
      Toast.show(err.message, "error");
    }
  }
};
