// Landing / Operations Overview Page
const LandingView = {
  async render(container) {
    container.innerHTML = `
      <div class="space-y-8 animate-fade-in pb-12">
        <!-- Hero Section -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-950 border border-indigo-500/20 p-8 sm:p-12 shadow-2xl">
          <div class="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -left-16 -bottom-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="relative z-10 max-w-3xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <span class="w-2 h-2 rounded-full bg-indigo-400 live-pulse"></span>
              Autonomous Warehouse Intelligence Platform
            </div>
            <h1 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              From Inventory to Dispatch — <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300">Intelligent Operations</span>
            </h1>
            <p class="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Real-time multi-factor order prioritization, intelligent stock shortage allocation, route-optimized picking, packing quality assurance, and proactive bottleneck detection.
            </p>

            <div class="mt-8 flex flex-wrap items-center gap-4">
              <button onclick="App.navigate('dashboard')" class="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                <span>Open Warehouse Command Center</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
              <button onclick="App.navigate('demo_scenario')" class="px-6 py-3 rounded-2xl bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-500/40 text-sm font-semibold hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.527.82-1.173 1.559-1.874 2.251-1.077 1.066-2.298 2.052-3.13 3.395C4.24 10.155 4 11.536 4 13a8 8 0 1016 0c0-2.36-.97-4.478-2.508-6.002a9.78 9.78 0 00-2.617-1.897 10.428 10.428 0 00-2.48-.548zM10 15a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path></svg>
                <span>Launch Interactive Demo Showdown</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Live Operations Metrics Grid -->
        <div id="landing-metrics" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-5 rounded-2xl glass-panel text-center"><p class="text-xs text-slate-400">Loading metrics...</p></div>
        </div>

        <!-- End-to-End Core Workflow Visualization -->
        <div class="glass-panel rounded-3xl p-6 sm:p-8">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-800">
            <div>
              <h2 class="text-lg font-bold text-white flex items-center gap-2">
                <span class="text-indigo-400 font-mono text-sm">01 //</span>
                Automated Fulfillment Lifecycle Workflow
              </h2>
              <p class="text-xs text-slate-400 mt-1">Autonomous decision-making at every stage of warehouse execution.</p>
            </div>
            <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 self-start sm:self-auto">Zero Manual Calculations</span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-6">
            ${[
              { step: "1", title: "Order Created", desc: "Ingested via API or ERP", color: "indigo" },
              { step: "2", title: "Priority Scored", desc: "Deadline + VIP + Age", color: "indigo" },
              { step: "3", title: "Inventory Check", desc: "Available Stock Calc", color: "indigo" },
              { step: "4", title: "Smart Allocation", desc: "Priority Reservation", color: "purple" },
              { step: "5", title: "Optimized Picking", desc: "S-Shape Route AI", color: "blue" },
              { step: "6", title: "Packing & QC", desc: "Weight & Box Sizing", color: "blue" },
              { step: "7", title: "Dispatch Hand-off", desc: "Carrier Manifesting", color: "emerald" },
              { step: "8", title: "Stock Synced", desc: "Real-time Ledger", color: "emerald" }
            ].map(s => `
              <div class="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between text-center relative group hover:border-indigo-500/40 transition-colors">
                <div class="w-6 h-6 rounded-full bg-${s.color}-600/30 text-${s.color}-300 text-xs font-bold mx-auto flex items-center justify-center mb-2 border border-${s.color}-500/40">
                  ${s.step}
                </div>
                <div class="font-bold text-xs text-slate-200">${s.title}</div>
                <div class="text-[10px] text-slate-400 mt-1">${s.desc}</div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Exception Resolution & Decision Engine Highlights -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="glass-panel rounded-3xl p-6 border-l-4 border-l-purple-500">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 class="text-base font-bold text-white">Explainable Decision Engine</h3>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
              Every critical decision (stock reservation, backorder allocation, route ordering, reorder quantities) includes transparent reasoning: <strong>Problem → Evidence → Decision → Action</strong>.
            </p>
            <div class="mt-4 p-3 rounded-xl bg-slate-900/90 text-xs text-purple-300 font-mono border border-purple-500/20">
              "Only 7 units of SKU-104 available. ORD-1024 reserved all 7 units due to CRITICAL priority (Deadline in 2.5h)."
            </div>
          </div>

          <div class="glass-panel rounded-3xl p-6 border-l-4 border-l-amber-500">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 class="text-base font-bold text-white">1-Click Exception Auto-Resolution</h3>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
              Damaged units, inventory discrepancies, and picking delays automatically trigger targeted recovery workflows with 1-click execution for warehouse managers.
            </p>
            <div class="mt-4 p-3 rounded-xl bg-slate-900/90 text-xs text-amber-300 font-mono border border-amber-500/20">
              "Damaged Item: Quarantine 2 units of SKU-205 to Defective Bin D-04 and issue RMA replacement."
            </div>
          </div>
        </div>
      </div>
    `;

    // Load real metrics into landing page
    try {
      const data = await API.getDashboard();
      const m = data.metrics;
      const metricsContainer = document.getElementById("landing-metrics");
      if (metricsContainer) {
        metricsContainer.innerHTML = `
          <div class="p-5 rounded-2xl glass-panel glass-card-hover border border-slate-800 text-left">
            <span class="text-xs text-slate-400 font-medium">Total Orders Active</span>
            <div class="text-2xl sm:text-3xl font-extrabold text-white mt-1">${m.total_orders}</div>
            <span class="text-[11px] text-indigo-400 mt-1 block font-medium">${m.urgent_orders} Critical / Urgent</span>
          </div>
          <div class="p-5 rounded-2xl glass-panel glass-card-hover border border-slate-800 text-left">
            <span class="text-xs text-slate-400 font-medium">Fulfillment Time</span>
            <div class="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-1">${m.avg_fulfillment_time_mins} <span class="text-sm font-normal text-slate-400">mins</span></div>
            <span class="text-[11px] text-emerald-400 mt-1 block font-medium">Picking Efficiency ${m.picking_efficiency_pct}%</span>
          </div>
          <div class="p-5 rounded-2xl glass-panel glass-card-hover border border-slate-800 text-left">
            <span class="text-xs text-slate-400 font-medium">Inventory Accuracy</span>
            <div class="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">${m.inventory_accuracy_pct}%</div>
            <span class="text-[11px] text-slate-400 mt-1 block font-medium">${m.low_stock_items} Low-Stock Alert(s)</span>
          </div>
          <div class="p-5 rounded-2xl glass-panel glass-card-hover border border-slate-800 text-left">
            <span class="text-xs text-slate-400 font-medium">Orders Dispatched</span>
            <div class="text-2xl sm:text-3xl font-extrabold text-purple-400 mt-1">${m.orders_dispatched}</div>
            <span class="text-[11px] text-purple-300 mt-1 block font-medium">${m.orders_ready_dispatch} Staged at Outbound</span>
          </div>
        `;
      }
    } catch (e) {}
  }
};
