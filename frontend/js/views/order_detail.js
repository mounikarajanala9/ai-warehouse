// Order Detail & Activity Timeline View
const OrderDetailView = {
  async render(container, orderId) {
    container.innerHTML = `<div class="p-8 text-center text-slate-400">Loading order timeline & allocation decision...</div>`;

    try {
      const order = await API.getOrderDetails(orderId);

      container.innerHTML = `
        <div class="space-y-6 animate-fade-in pb-12">
          <!-- Top Bar & Breadcrumb -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <button onclick="App.navigate('orders')" class="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-medium">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              <span>Back to Orders Hub</span>
            </button>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-400">Order Stage:</span>
              <span class="font-bold text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">${order.status}</span>
            </div>
          </div>

          <!-- Order Summary Card -->
          <div class="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-3">
                  <h1 class="text-2xl font-extrabold text-white tracking-tight">${order.order_number}</h1>
                  <span class="font-bold text-xs px-2.5 py-0.5 rounded-full ${order.priority === 'Critical' ? 'badge-critical' : 'badge-healthy'}">${order.priority} Priority</span>
                  ${order.is_express ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">EXPRESS AIR</span>` : ''}
                </div>
                <p class="text-sm font-semibold text-slate-300 mt-1">${order.customer_name} <span class="text-xs text-slate-500 font-normal">(${order.customer_type} Tier)</span></p>
                <p class="text-xs text-indigo-300 font-mono mt-1">Priority Reason: ${order.priority_reason}</p>
              </div>

              <!-- Quick Stage Triggers -->
              <div class="flex items-center gap-2.5">
                ${order.status === 'Created' || order.status === 'Waiting for Stock' ? `
                  <button onclick="OrderDetailView.allocate(${order.id})" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30">
                    Smart Stock Allocation →
                  </button>
                ` : order.status === 'Allocated' || order.status === 'Partially Allocated' ? `
                  <button onclick="OrderDetailView.pick(${order.id})" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30">
                    Generate Picking Route →
                  </button>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Allocation Decision & Reasoning Panel (Core Requirement #9 & #26) -->
          <div class="glass-panel rounded-3xl p-6 border border-purple-500/30 shadow-xl bg-gradient-to-br from-slate-900/90 via-purple-950/20 to-slate-950">
            <div class="flex items-center gap-2 pb-3 border-b border-purple-500/20 mb-4">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              <h3 class="font-bold text-sm text-white">Smart Inventory Allocation Decision Engine</h3>
            </div>

            <div class="space-y-3">
              ${(order.items || []).map(i => `
                <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div class="font-bold text-white">${i.sku} — ${i.product_name}</div>
                    <div class="text-slate-300 mt-1 font-mono text-[11px]">${i.decision_log || `Requested: ${i.requested_qty} | Allocated: ${i.allocated_qty} | Backordered: ${i.backordered_qty || 0}`}</div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold font-mono">Allocated: ${i.allocated_qty}/${i.requested_qty}</span>
                    ${i.backordered_qty > 0 ? `<span class="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold font-mono">Backordered: ${i.backordered_qty}</span>` : ''}
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Visual Activity Timeline (Core Requirement #17) -->
          <div class="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl">
            <h3 class="font-bold text-sm text-white mb-6 flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Order Lifecycle & Activity Timeline</span>
            </h3>

            <div class="space-y-6 relative pl-6 border-l-2 border-slate-800 ml-3">
              ${(order.timeline || []).map((t, idx) => `
                <div class="relative group">
                  <!-- Indicator Dot -->
                  <div class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                    t.status === 'completed' ? 'bg-emerald-500 border-emerald-400' :
                    t.status === 'current' ? 'bg-indigo-500 border-indigo-300 live-pulse' :
                    'bg-slate-900 border-slate-700'
                  }"></div>

                  <div>
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-bold ${t.status === 'completed' ? 'text-emerald-400' : t.status === 'current' ? 'text-indigo-400' : 'text-slate-500'}">
                        ${idx + 1}. ${t.stage}
                      </span>
                      <span class="text-[10px] text-slate-500 font-mono">${t.time || 'Pending'}</span>
                    </div>
                    <p class="text-xs text-slate-300 mt-1">${t.desc}</p>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="p-8 text-center text-rose-400">Failed to load order details: ${e.message}</div>`;
    }
  },

  async allocate(orderId) {
    try {
      const res = await API.allocateOrder(orderId);
      Toast.show("Inventory allocated with priority reservation!", "ai");
      this.render(document.getElementById("main-content"), orderId);
    } catch (e) {
      Toast.show(e.message, "error");
    }
  },

  async pick(orderId) {
    try {
      await API.createPickingTaskForOrder(orderId, "Alex Chen");
      Toast.show("Picking route generated!", "success");
      App.navigate("picking");
    } catch (e) {
      Toast.show(e.message, "error");
    }
  }
};
