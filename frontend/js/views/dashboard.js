// Warehouse Command Center Dashboard View
const DashboardView = {
  charts: {},

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- Dashboard Header & Fast Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Warehouse Command Center</span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 live-pulse"></span>
                <span>Active Telemetry</span>
              </span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">Autonomous decision engine monitoring throughput, shortage allocations, and bottlenecks.</p>
          </div>
          <div class="flex items-center gap-2.5">
            <button onclick="App.navigate('demo_scenario')" class="px-3.5 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all flex items-center gap-1.5">
              <svg class="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.527.82-1.173 1.559-1.874 2.251-1.077 1.066-2.298 2.052-3.13 3.395C4.24 10.155 4 11.536 4 13a8 8 0 1016 0c0-2.36-.97-4.478-2.508-6.002a9.78 9.78 0 00-2.617-1.897 10.428 10.428 0 00-2.48-.548zM10 15a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path></svg>
              <span>Demo Shortage Scenario</span>
            </button>
            <button onclick="Modals.openCreateOrderModal()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>Create Order</span>
            </button>
          </div>
        </div>

        <!-- 15 Key Performance Metrics Cards Grid -->
        <div id="dash-kpi-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div class="p-4 rounded-2xl glass-panel text-center"><p class="text-xs text-slate-400">Loading KPIs...</p></div>
        </div>

        <!-- AI & Smart Recommendations Section (Core Requirement) -->
        <div class="glass-panel rounded-3xl p-6 border border-purple-500/30 shadow-xl bg-gradient-to-br from-slate-900/90 via-purple-950/20 to-slate-950">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-purple-500/20">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div>
                <h2 class="text-base font-bold text-white flex items-center gap-2">
                  <span>AI & Smart Decision Recommendations</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 uppercase tracking-wider">Automated Rules Active</span>
                </h2>
                <p class="text-xs text-slate-400">Real-time analysis derived from inventory velocity, order priority queues, and stage bottlenecks.</p>
              </div>
            </div>
            <button onclick="App.render()" class="text-xs text-purple-300 hover:text-white flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <span>Refresh Insights</span>
            </button>
          </div>

          <div id="smart-recommendations-list" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <p class="text-xs text-slate-400">Evaluating decision rules...</p>
          </div>
        </div>

        <!-- 8 Interactive Operational Charts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <!-- Chart 1: Orders by Status -->
          <div class="glass-panel rounded-2xl p-5 border border-slate-800">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Orders by Status</h3>
              <span class="text-[10px] text-slate-500 font-mono">Real-time</span>
            </div>
            <div class="h-44 relative">
              <canvas id="chart-orders-status"></canvas>
            </div>
          </div>

          <!-- Chart 2: Orders by Priority -->
          <div class="glass-panel rounded-2xl p-5 border border-slate-800">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Orders by Priority</h3>
              <span class="text-[10px] text-slate-500 font-mono">Weighted</span>
            </div>
            <div class="h-44 relative">
              <canvas id="chart-orders-priority"></canvas>
            </div>
          </div>

          <!-- Chart 3: Daily Volume Trend -->
          <div class="glass-panel rounded-2xl p-5 border border-slate-800">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Daily Volume & SLA</h3>
              <span class="text-[10px] text-slate-500 font-mono">7-Day History</span>
            </div>
            <div class="h-44 relative">
              <canvas id="chart-daily-volume"></canvas>
            </div>
          </div>

          <!-- Chart 4: Inventory Health -->
          <div class="glass-panel rounded-2xl p-5 border border-slate-800">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Inventory Health</h3>
              <span class="text-[10px] text-slate-500 font-mono">SKU Status</span>
            </div>
            <div class="h-44 relative">
              <canvas id="chart-inventory-health"></canvas>
            </div>
          </div>

          <!-- Chart 5: Picking Performance by Zone -->
          <div class="glass-panel rounded-2xl p-5 border border-slate-800">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Picking Speed by Zone</h3>
              <span class="text-[10px] text-slate-500 font-mono">Mins / Order</span>
            </div>
            <div class="h-44 relative">
              <canvas id="chart-picking-performance"></canvas>
            </div>
          </div>

          <!-- Chart 6: Packing Station Output -->
          <div class="glass-panel rounded-2xl p-5 border border-slate-800">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Packing QC & Throughput</h3>
              <span class="text-[10px] text-slate-500 font-mono">Stations 1-3</span>
            </div>
            <div class="h-44 relative">
              <canvas id="chart-packing-performance"></canvas>
            </div>
          </div>

          <!-- Chart 7: Dispatch SLA by Carrier -->
          <div class="glass-panel rounded-2xl p-5 border border-slate-800">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Dispatch Carrier SLAs</h3>
              <span class="text-[10px] text-slate-500 font-mono">On-Time %</span>
            </div>
            <div class="h-44 relative">
              <canvas id="chart-dispatch-performance"></canvas>
            </div>
          </div>

          <!-- Chart 8: Top Bottleneck Delay Attribution -->
          <div class="glass-panel rounded-2xl p-5 border border-slate-800">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Delay Attribution %</h3>
              <span class="text-[10px] text-rose-400 font-bold font-mono">Bottlenecks</span>
            </div>
            <div class="h-44 relative">
              <canvas id="chart-bottleneck-stages"></canvas>
            </div>
          </div>
        </div>

        <!-- Recent Operational Activity Trail -->
        <div class="glass-panel rounded-3xl p-6 border border-slate-800">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h3 class="text-sm font-bold text-white">Live Operations Audit Stream</h3>
            </div>
            <button onclick="App.navigate('audit_logs')" class="text-xs text-indigo-400 hover:text-indigo-300">View Full Audit Log →</button>
          </div>
          <div id="recent-activity-container" class="space-y-2.5">
            <p class="text-xs text-slate-400">Loading activity...</p>
          </div>
        </div>
      </div>
    `;

    // Load Data
    try {
      const data = await API.getDashboard();
      this.populateKPIs(data.metrics);
      this.populateRecommendations(data.smart_recommendations);
      this.populateActivity(data.recent_activity);
      this.renderCharts(data.charts);
    } catch (err) {
      Toast.show("Failed to load dashboard data: " + err.message, "error");
    }
  },

  populateKPIs(m) {
    const kpiContainer = document.getElementById("dash-kpi-grid");
    if (!kpiContainer) return;

    const cards = [
      { label: "Total Orders", val: m.total_orders, sub: "In system", color: "indigo" },
      { label: "Pending Orders", val: m.pending_orders, sub: "Awaiting fulfillment", color: "blue" },
      { label: "Urgent Orders", val: m.urgent_orders, sub: "Critical / High SLA", color: "rose", highlight: true },
      { label: "Being Picked", val: m.orders_being_picked, sub: "Zone A-D active", color: "amber" },
      { label: "Orders Packed", val: m.orders_packed, sub: "QC Inspected", color: "emerald" },
      { label: "Ready to Dispatch", val: m.orders_ready_dispatch, sub: "Outbound staged", color: "cyan" },
      { label: "Orders Dispatched", val: m.orders_dispatched, sub: "In transit / Shipped", color: "purple" },
      { label: "Low Stock SKUs", val: m.low_stock_items, sub: "< Reorder point", color: "amber" },
      { label: "Out of Stock", val: m.out_of_stock_items, sub: "0 units available", color: "rose", highlight: m.out_of_stock_items > 0 },
      { label: "Damaged Units", val: m.damaged_items, sub: "Quarantined stock", color: "rose" },
      { label: "Missing Units", val: m.missing_items, sub: "Discrepancy count", color: "amber" },
      { label: "Avg Fulfillment", val: `${m.avg_fulfillment_time_mins}m`, sub: "Bench: 18.0m", color: "cyan" },
      { label: "Picking Efficiency", val: `${m.picking_efficiency_pct}%`, sub: "Route AI active", color: "emerald" },
      { label: "Packing Efficiency", val: `${m.packing_efficiency_pct}%`, sub: "99.1% QC pass", color: "emerald" },
      { label: "Inventory Accuracy", val: `${m.inventory_accuracy_pct}%`, sub: "Cycle audited", color: "emerald" }
    ];

    kpiContainer.innerHTML = cards.map(c => `
      <div class="p-3.5 rounded-2xl glass-panel glass-card-hover border ${c.highlight ? 'border-rose-500/40 bg-rose-950/20' : 'border-slate-800'} text-left">
        <span class="text-[11px] font-semibold text-slate-400 truncate block">${c.label}</span>
        <div class="text-xl sm:text-2xl font-extrabold text-${c.color}-400 mt-1">${c.val}</div>
        <span class="text-[10px] text-slate-500 mt-0.5 block truncate">${c.sub}</span>
      </div>
    `).join("");
  },

  populateRecommendations(recs) {
    const container = document.getElementById("smart-recommendations-list");
    if (!container) return;

    if (!recs || recs.length === 0) {
      container.innerHTML = `<p class="text-xs text-emerald-400">✅ All operational metrics within target parameters. No critical bottlenecks detected.</p>`;
      return;
    }

    container.innerHTML = recs.map(r => `
      <div class="p-4 rounded-2xl bg-slate-900/90 border ${r.severity === 'critical' ? 'border-rose-500/40 bg-rose-950/20' : r.severity === 'high' ? 'border-amber-500/40 bg-amber-950/20' : 'border-purple-500/30'} flex flex-col justify-between text-xs space-y-2.5">
        <div>
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${r.severity === 'critical' ? 'bg-rose-500/20 text-rose-300' : r.severity === 'high' ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300'}">${r.badge}</span>
            <span class="text-[10px] text-slate-400 font-mono">${r.id}</span>
          </div>
          <h4 class="font-bold text-slate-100 text-sm leading-snug">${r.title}</h4>
          <p class="text-slate-300 mt-1 text-[11px] leading-relaxed"><strong class="text-slate-400">Evidence:</strong> ${r.evidence}</p>
          <p class="text-purple-300 mt-1 text-[11px] font-mono leading-relaxed"><strong class="text-purple-400">Decision:</strong> ${r.decision}</p>
        </div>

        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <span class="text-[11px] text-slate-400 font-medium truncate">${r.action_text}</span>
          <button onclick="DashboardView.handleAction('${r.action_type}', '${r.action_target}')" class="shrink-0 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shadow-sm">
            Execute Action →
          </button>
        </div>
      </div>
    `).join("");
  },

  handleAction(actionType, target) {
    if (actionType === "allocate_order") {
      App.openOrderDetails(parseInt(target));
    } else if (actionType === "restock_sku") {
      Modals.openRestockModal(parseInt(target), "SKU", "Product");
    } else if (actionType === "view_analytics") {
      App.navigate("analytics");
    } else if (actionType === "view_exceptions") {
      App.navigate("exceptions");
    } else {
      App.navigate("inventory");
    }
  },

  populateActivity(acts) {
    const container = document.getElementById("recent-activity-container");
    if (!container) return;

    container.innerHTML = acts.map(a => `
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div class="flex items-center gap-3">
          <span class="font-bold px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">${a.entity_type}</span>
          <span class="text-slate-200 font-medium">${a.description}</span>
        </div>
        <div class="text-[10px] text-slate-500 font-mono">${a.performed_by} • ${a.timestamp || 'Recent'}</div>
      </div>
    `).join("");
  },

  renderCharts(data) {
    // Destroy previous chart instances
    Object.values(this.charts).forEach(c => c && c.destroy && c.destroy());
    this.charts = {};

    const chartDefaults = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#94a3b8", font: { size: 10 } } }
      }
    };

    // 1. Orders by Status (Doughnut)
    const ctxStatus = document.getElementById("chart-orders-status");
    if (ctxStatus && data.orders_by_status) {
      this.charts.status = new Chart(ctxStatus, {
        type: "doughnut",
        data: {
          labels: data.orders_by_status.map(s => s.status),
          datasets: [{
            data: data.orders_by_status.map(s => s.count),
            backgroundColor: ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4"],
            borderWidth: 0
          }]
        },
        options: chartDefaults
      });
    }

    // 2. Orders by Priority (Bar)
    const ctxPriority = document.getElementById("chart-orders-priority");
    if (ctxPriority && data.orders_by_priority) {
      this.charts.priority = new Chart(ctxPriority, {
        type: "bar",
        data: {
          labels: data.orders_by_priority.map(p => p.priority),
          datasets: [{
            label: "Orders",
            data: data.orders_by_priority.map(p => p.count),
            backgroundColor: ["#f43f5e", "#f59e0b", "#3b82f6", "#64748b"],
            borderRadius: 6
          }]
        },
        options: {
          ...chartDefaults,
          scales: {
            x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "#1e293b" } }
          }
        }
      });
    }

    // 3. Daily Volume Trend (Line)
    const ctxDaily = document.getElementById("chart-daily-volume");
    if (ctxDaily && data.daily_order_volume) {
      this.charts.daily = new Chart(ctxDaily, {
        type: "line",
        data: {
          labels: data.daily_order_volume.map(d => d.date),
          datasets: [
            {
              label: "Received",
              data: data.daily_order_volume.map(d => d.received),
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              fill: true,
              tension: 0.3
            },
            {
              label: "Fulfilled",
              data: data.daily_order_volume.map(d => d.fulfilled),
              borderColor: "#10b981",
              backgroundColor: "transparent",
              tension: 0.3
            }
          ]
        },
        options: {
          ...chartDefaults,
          scales: {
            x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "#1e293b" } }
          }
        }
      });
    }

    // 4. Inventory Health (Pie)
    const ctxHealth = document.getElementById("chart-inventory-health");
    if (ctxHealth && data.inventory_health) {
      this.charts.health = new Chart(ctxHealth, {
        type: "pie",
        data: {
          labels: data.inventory_health.map(h => h.status),
          datasets: [{
            data: data.inventory_health.map(h => h.count),
            backgroundColor: ["#10b981", "#f59e0b", "#f43f5e", "#ef4444", "#a855f7"],
            borderWidth: 0
          }]
        },
        options: chartDefaults
      });
    }

    // 5. Picking Performance (Bar)
    const ctxPick = document.getElementById("chart-picking-performance");
    if (ctxPick && data.picking_performance) {
      this.charts.pick = new Chart(ctxPick, {
        type: "bar",
        data: {
          labels: data.picking_performance.map(p => p.zone.split(" ")[1]),
          datasets: [{
            label: "Avg Mins",
            data: data.picking_performance.map(p => p.avg_mins),
            backgroundColor: "#3b82f6",
            borderRadius: 6
          }]
        },
        options: {
          ...chartDefaults,
          scales: {
            x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "#1e293b" } }
          }
        }
      });
    }

    // 6. Packing Performance (Bar)
    const ctxPack = document.getElementById("chart-packing-performance");
    if (ctxPack && data.packing_performance) {
      this.charts.pack = new Chart(ctxPack, {
        type: "bar",
        data: {
          labels: data.packing_performance.map(p => p.station.split(" ")[0]),
          datasets: [{
            label: "Packages",
            data: data.packing_performance.map(p => p.packed),
            backgroundColor: "#10b981",
            borderRadius: 6
          }]
        },
        options: {
          ...chartDefaults,
          scales: {
            x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "#1e293b" } }
          }
        }
      });
    }

    // 7. Dispatch SLA (Bar)
    const ctxDisp = document.getElementById("chart-dispatch-performance");
    if (ctxDisp && data.dispatch_performance) {
      this.charts.disp = new Chart(ctxDisp, {
        type: "bar",
        data: {
          labels: data.dispatch_performance.map(d => d.carrier.split(" ")[0]),
          datasets: [{
            label: "SLA %",
            data: data.dispatch_performance.map(d => d.sla_pct),
            backgroundColor: "#8b5cf6",
            borderRadius: 6
          }]
        },
        options: {
          ...chartDefaults,
          scales: {
            x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { display: false } },
            y: { min: 80, max: 100, ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "#1e293b" } }
          }
        }
      });
    }

    // 8. Bottleneck Stages (Horizontal Bar)
    const ctxBottleneck = document.getElementById("chart-bottleneck-stages");
    if (ctxBottleneck && data.bottleneck_stages) {
      const stages = data.bottleneck_stages;
      this.charts.bottleneck = new Chart(ctxBottleneck, {
        type: "bar",
        data: {
          labels: ["Allocation", "Picking", "Packing", "Dispatch"],
          datasets: [{
            label: "% Delay",
            data: [stages.allocation.delay_pct, stages.picking.delay_pct, stages.packing.delay_pct, stages.dispatch.delay_pct],
            backgroundColor: ["#3b82f6", "#f43f5e", "#f59e0b", "#10b981"],
            borderRadius: 6
          }]
        },
        options: {
          ...chartDefaults,
          indexAxis: 'y',
          scales: {
            x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "#1e293b" } },
            y: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { display: false } }
          }
        }
      });
    }
  }
};
