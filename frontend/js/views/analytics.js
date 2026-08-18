// Analytics & Operational Bottleneck Intelligence View
const AnalyticsView = {
  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Operational Analytics & Bottlenecks</span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Automated Friction Analysis
              </span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">Cross-stage fulfillment latency attribution, worker efficiency rankings, and staffing advice.</p>
          </div>
        </div>

        <!-- Primary Bottleneck Attribution Banner (Core Requirement #15) -->
        <div id="bottleneck-banner-container">
          <div class="p-6 rounded-3xl glass-panel text-center"><p class="text-xs text-slate-400">Analyzing bottlenecks...</p></div>
        </div>

        <!-- Key Analytics Metrics 4-Box Grid -->
        <div id="analytics-kpi-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-5 rounded-3xl glass-panel text-center"><p class="text-xs text-slate-400">Loading metrics...</p></div>
        </div>

        <!-- Stage Latency Waterfall vs Benchmark Table -->
        <div class="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl">
          <h3 class="text-base font-bold text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            <span>Fulfillment Stage Latency vs SLA Benchmark</span>
          </h3>

          <div id="stage-waterfall-container" class="space-y-3">
            <p class="text-xs text-slate-400">Loading waterfall data...</p>
          </div>
        </div>

        <!-- Worker Productivity Rankings Table -->
        <div class="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div class="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <h3 class="font-bold text-xs uppercase tracking-wider text-slate-300">Staff Productivity & Accuracy Leaderboard</h3>
            <span class="text-xs text-emerald-400 font-mono">Shift Active</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
                <tr>
                  <th class="py-3 px-4">Operator</th>
                  <th class="py-3 px-3">Role / Zone</th>
                  <th class="py-3 px-3 text-center">Tasks Completed</th>
                  <th class="py-3 px-3 text-center">Avg Speed</th>
                  <th class="py-3 px-3 text-center">Accuracy</th>
                  <th class="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody id="worker-table-body" class="divide-y divide-slate-800/60">
                <tr><td colspan="6" class="py-6 text-center text-slate-400">Loading worker rankings...</td></tr>
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
      const data = await API.getAnalytics();
      const b = data.bottleneck;

      // 1. Bottleneck Banner
      const banner = document.getElementById("bottleneck-banner-container");
      if (banner) {
        banner.innerHTML = `
          <div class="p-6 rounded-3xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 border-2 border-rose-500/40 shadow-2xl space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-rose-500 live-pulse"></span>
                <span class="font-bold text-xs uppercase tracking-wider text-rose-300">Primary Bottleneck Detected</span>
              </div>
              <span class="font-bold font-mono text-xs px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">${b.delay_attribution_pct}% Delay Attribution</span>
            </div>

            <h2 class="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              ${b.message}
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <span class="font-bold text-slate-400 block mb-1 uppercase text-[10px]">Empirical Evidence:</span>
                <p class="text-slate-200">${b.evidence}</p>
              </div>
              <div class="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30">
                <span class="font-bold text-purple-300 block mb-1 uppercase text-[10px]">Actionable Staffing Recommendation:</span>
                <p class="text-slate-100 font-semibold">${b.recommendation}</p>
              </div>
            </div>
          </div>
        `;
      }

      // 2. KPIs
      const kpiContainer = document.getElementById("analytics-kpi-grid");
      if (kpiContainer) {
        kpiContainer.innerHTML = `
          <div class="p-5 rounded-3xl glass-panel border border-slate-800">
            <span class="text-xs text-slate-400 font-medium">On-Time Fulfillment SLA</span>
            <div class="text-2xl font-extrabold text-emerald-400 mt-1">${data.order_analytics.on_time_fulfillment_rate_pct}%</div>
            <span class="text-[10px] text-slate-500 mt-0.5 block">${data.order_analytics.completed_orders} Completed / ${data.order_analytics.delayed_orders} At-Risk</span>
          </div>
          <div class="p-5 rounded-3xl glass-panel border border-slate-800">
            <span class="text-xs text-slate-400 font-medium">Inventory Turnover</span>
            <div class="text-2xl font-extrabold text-cyan-400 mt-1">${data.inventory_analytics.inventory_turnover_ratio}x</div>
            <span class="text-[10px] text-slate-500 mt-0.5 block">${data.inventory_analytics.total_stock_units} Units in Warehouse</span>
          </div>
          <div class="p-5 rounded-3xl glass-panel border border-slate-800">
            <span class="text-xs text-slate-400 font-medium">Avg Cycle Duration</span>
            <div class="text-2xl font-extrabold text-indigo-400 mt-1">${data.fulfillment_analytics.avg_fulfillment_time_mins}m</div>
            <span class="text-[10px] text-slate-500 mt-0.5 block">Pick: ${data.fulfillment_analytics.avg_picking_time_mins}m | Pack: ${data.fulfillment_analytics.avg_packing_time_mins}m</span>
          </div>
          <div class="p-5 rounded-3xl glass-panel border border-slate-800">
            <span class="text-xs text-slate-400 font-medium">Operational Efficiency</span>
            <div class="text-2xl font-extrabold text-purple-400 mt-1">${b.overall_efficiency_pct}%</div>
            <span class="text-[10px] text-slate-500 mt-0.5 block">Zero manual calculations</span>
          </div>
        `;
      }

      // 3. Stage Waterfall
      const waterfallContainer = document.getElementById("stage-waterfall-container");
      if (waterfallContainer && data.stage_waterfall) {
        waterfallContainer.innerHTML = data.stage_waterfall.map(s => `
          <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-3">
              <span class="font-bold px-2 py-0.5 rounded text-[10px] ${
                s.status === 'Critical' ? 'bg-rose-500/20 text-rose-300' :
                s.status === 'Warning' ? 'bg-amber-500/20 text-amber-300' :
                'bg-emerald-500/20 text-emerald-300'
              }">${s.status}</span>
              <span class="font-bold text-white text-sm">${s.stage}</span>
            </div>

            <div class="flex items-center gap-6 font-mono text-xs">
              <div>
                <span class="text-slate-500 text-[10px] block">Benchmark:</span>
                <span class="text-slate-300">${s.benchmark_mins} mins</span>
              </div>
              <div>
                <span class="text-slate-500 text-[10px] block">Actual Avg:</span>
                <span class="font-bold ${s.avg_duration_mins > s.benchmark_mins ? 'text-rose-400' : 'text-emerald-400'}">${s.avg_duration_mins} mins</span>
              </div>
            </div>
          </div>
        `).join("");
      }

      // 4. Workers Leaderboard
      const workerTbody = document.getElementById("worker-table-body");
      if (workerTbody && data.workers) {
        workerTbody.innerHTML = data.workers.map(w => `
          <tr class="hover:bg-slate-900/60 transition-colors">
            <td class="py-3 px-4 font-bold text-white">${w.name}</td>
            <td class="py-3 px-3 text-slate-300 font-mono text-[11px]">${w.role}</td>
            <td class="py-3 px-3 text-center font-bold text-indigo-300 font-mono">${w.tasks_completed}</td>
            <td class="py-3 px-3 text-center text-slate-200 font-mono">${w.avg_speed_mins} mins</td>
            <td class="py-3 px-3 text-center font-bold text-emerald-400 font-mono">${w.accuracy_pct}%</td>
            <td class="py-3 px-4 text-right">
              <span class="font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">${w.status}</span>
            </td>
          </tr>
        `).join("");
      }

    } catch (e) {
      console.error(e);
    }
  }
};
