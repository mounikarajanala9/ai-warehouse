// Dispatch Tracking & Logistics View
const DispatchesView = {
  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Outbound Staging & Carrier Logistics</span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Automated Carrier Manifests
              </span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">Real-time carrier pickup confirmation, tracking generation, and transit monitoring.</p>
          </div>
        </div>

        <!-- Dispatches Grid -->
        <div class="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div class="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <h3 class="font-bold text-xs uppercase tracking-wider text-slate-300">Outbound Manifests & Shipments</h3>
            <span id="disp-count" class="text-xs text-indigo-400 font-mono">Loading...</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
                <tr>
                  <th class="py-3 px-4">Order / Customer</th>
                  <th class="py-3 px-3">Carrier Service</th>
                  <th class="py-3 px-3 font-mono">Tracking Number</th>
                  <th class="py-3 px-3">Weight</th>
                  <th class="py-3 px-3 text-center">Dispatch Status</th>
                  <th class="py-3 px-3">Dispatch Time</th>
                  <th class="py-3 px-4 text-right">Logistics Action</th>
                </tr>
              </thead>
              <tbody id="dispatches-table-body" class="divide-y divide-slate-800/60">
                <tr><td colspan="7" class="py-8 text-center text-slate-400">Loading dispatches...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.loadData();
  },

  async loadData() {
    try {
      const dispatches = await API.getDispatches();
      const countEl = document.getElementById("disp-count");
      const tbody = document.getElementById("dispatches-table-body");
      if (countEl) countEl.innerText = `${dispatches.length} shipments logged`;

      if (!dispatches || dispatches.length === 0) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400">No active dispatch manifests.</td></tr>`;
        return;
      }

      tbody.innerHTML = dispatches.map(d => {
        const isReady = d.dispatch_status === "Ready";
        const isInTransit = d.dispatch_status === "In Transit";
        const isDelivered = d.dispatch_status === "Delivered";

        return `
          <tr class="hover:bg-slate-900/60 transition-colors">
            <td class="py-3.5 px-4">
              <div class="font-bold text-white font-mono">${d.order_number}</div>
              <div class="text-[11px] text-slate-300 font-medium">${d.customer_name}</div>
              <div class="text-[10px] text-slate-500">${d.customer_type} • ${d.total_items} items</div>
            </td>

            <td class="py-3.5 px-3">
              <span class="font-semibold text-slate-200">${d.carrier}</span>
            </td>

            <td class="py-3.5 px-3">
              <span class="font-mono text-indigo-300 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px]">${d.tracking_number}</span>
            </td>

            <td class="py-3.5 px-3 text-slate-300 font-mono">${d.package_weight_kg} kg</td>

            <td class="py-3.5 px-3 text-center">
              <span class="font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                isDelivered ? 'badge-healthy' :
                isInTransit ? 'badge-active' :
                'badge-warning'
              }">${d.dispatch_status}</span>
            </td>

            <td class="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
              ${d.dispatch_time || 'Awaiting Pickup'}
            </td>

            <td class="py-3.5 px-4 text-right">
              ${isReady ? `
                <button onclick="DispatchesView.confirm(${d.order_id}, '${d.carrier}')" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md">
                  Confirm Dispatch →
                </button>
              ` : isInTransit ? `
                <button onclick="DispatchesView.markDelivered(${d.order_id})" class="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-semibold text-xs transition-all">
                  ✓ Confirm Delivery
                </button>
              ` : `
                <span class="text-[11px] text-emerald-400 font-semibold font-mono">Delivered ✓</span>
              `}
            </td>
          </tr>
        `;
      }).join("");
    } catch (e) {
      console.error(e);
    }
  },

  async confirm(orderId, carrier) {
    try {
      const res = await API.confirmDispatch({
        order_id: orderId,
        carrier: carrier,
        dispatched_by: "Logistics Lead"
      });
      Toast.show(res.message, "success");
      this.loadData();
    } catch (e) {
      Toast.show(e.message, "error");
    }
  },

  async markDelivered(orderId) {
    try {
      const res = await API.markDelivered(orderId);
      Toast.show(res.message, "success");
      this.loadData();
    } catch (e) {
      Toast.show(e.message, "error");
    }
  }
};
