// Picking Management & Optimization Terminal View
const PickingView = {
  currentTaskId: null,

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Picking Management & Route AI</span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                S-Shape Route Optimizer
              </span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">Minimizes picker travel distance across warehouse aisle/bay coordinates.</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400">Assigned Picker:</span>
            <span class="text-xs font-bold text-slate-200 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">Alex Chen (Zone A/B)</span>
          </div>
        </div>

        <!-- Main Layout: Task Selector & Active Route Terminal -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left: Tasks Queue -->
          <div class="glass-panel rounded-3xl p-5 border border-slate-800 flex flex-col justify-between max-h-[750px]">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <h3 class="font-bold text-xs uppercase tracking-wider text-slate-300">Active Picking Tasks</h3>
                <span id="pick-task-count" class="text-xs text-indigo-400 font-mono">Loading...</span>
              </div>
              <div id="picking-tasks-list" class="space-y-2.5 overflow-y-auto max-h-[620px] pr-1">
                <p class="text-xs text-slate-400 text-center py-6">Loading tasks...</p>
              </div>
            </div>
          </div>

          <!-- Right: Route Visualizer & Item Checklist Terminal -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Active Route Metrics & 2D Map -->
            <div class="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 id="active-task-title" class="text-base font-bold text-white">Select a Picking Task</h3>
                  <p id="active-task-sub" class="text-xs text-slate-400 mt-0.5">Click any task on the left to inspect optimized route & item checklist.</p>
                </div>
                <div id="active-task-action-container"></div>
              </div>

              <!-- Route KPIs -->
              <div id="route-metrics-bar" class="grid grid-cols-3 gap-3 my-4">
                <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <span class="text-[10px] text-slate-400 uppercase font-semibold block">Total Walking</span>
                  <span id="metric-distance" class="text-base font-extrabold text-cyan-400">0 m</span>
                </div>
                <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <span class="text-[10px] text-slate-400 uppercase font-semibold block">Est. Duration</span>
                  <span id="metric-duration" class="text-base font-extrabold text-indigo-400">0.0 mins</span>
                </div>
                <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <span class="text-[10px] text-slate-400 uppercase font-semibold block">Locations</span>
                  <span id="metric-stops" class="text-base font-extrabold text-emerald-400">0 bins</span>
                </div>
              </div>

              <!-- Recommended Route Breadcrumb Sequence -->
              <div class="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs">
                <span class="font-bold text-indigo-300 uppercase tracking-wider text-[10px] block mb-1">Recommended Picking Sequence:</span>
                <div id="route-sequence-display" class="font-mono text-slate-200 text-xs flex flex-wrap items-center gap-1.5">
                  <span class="text-slate-500">No active route selected.</span>
                </div>
              </div>

              <!-- Interactive 2D Warehouse Coordinate Map -->
              <div class="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 warehouse-grid relative h-52 overflow-hidden flex items-center justify-center">
                <div id="warehouse-map-canvas" class="w-full h-full relative">
                  <div class="absolute inset-0 flex items-center justify-center text-xs text-slate-600 font-mono">
                    2D Warehouse Layout (Zone A-D Coordinate Grid)
                  </div>
                </div>
              </div>
            </div>

            <!-- Item Scan & Verification Checklist -->
            <div class="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl">
              <h4 class="font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">Item Verification Checklist</h4>
              <div id="picking-items-checklist" class="space-y-2.5">
                <p class="text-xs text-slate-500 text-center py-4">No task selected.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.loadTasks();
  },

  async loadTasks() {
    try {
      const tasks = await API.getPickingTasks();
      const countEl = document.getElementById("pick-task-count");
      const listEl = document.getElementById("picking-tasks-list");
      if (countEl) countEl.innerText = `${tasks.length} tasks`;

      if (!tasks || tasks.length === 0) {
        if (listEl) listEl.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">No active picking tasks.</p>`;
        return;
      }

      listEl.innerHTML = tasks.map(t => `
        <div onclick="PickingView.selectTask(${t.id})" class="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border ${this.currentTaskId === t.id ? 'border-indigo-500 bg-indigo-950/30' : 'border-slate-800'} cursor-pointer text-xs transition-all space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold font-mono text-white">${t.task_code}</span>
            <span class="font-bold px-2 py-0.5 rounded text-[10px] ${t.priority === 'Critical' ? 'badge-critical' : 'badge-healthy'}">${t.priority}</span>
          </div>
          <div class="text-slate-300 font-medium">${t.order_number} • ${t.customer_name}</div>
          <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>${t.zone}</span>
            <span class="font-mono text-indigo-300">${t.sum_picked_qty || 0}/${t.sum_req_qty || 0} Picked</span>
          </div>
        </div>
      `).join("");

      // Auto select first task if none selected
      if (!this.currentTaskId && tasks.length > 0) {
        this.selectTask(tasks[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  },

  async selectTask(taskId) {
    this.currentTaskId = taskId;
    try {
      const task = await API.getPickingTask(taskId);
      const opt = task.route_details;

      document.getElementById("active-task-title").innerText = `${task.task_code} (${task.order_number})`;
      document.getElementById("active-task-sub").innerText = `Customer: ${task.customer_name} | Priority: ${task.priority} | Assigned: ${task.picker_name || 'Alex Chen'}`;

      // Update metrics
      document.getElementById("metric-distance").innerText = `${opt.total_distance_meters} m`;
      document.getElementById("metric-duration").innerText = `${opt.estimated_time_mins} mins`;
      document.getElementById("metric-stops").innerText = `${opt.number_of_locations} bins`;

      // Update Route breadcrumb
      const seqDisplay = document.getElementById("route-sequence-display");
      if (seqDisplay && opt.route_sequence) {
        seqDisplay.innerHTML = opt.route_sequence.map((loc, idx) => `
          <span class="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-indigo-300 font-bold">${idx + 1}. ${loc}</span>
          ${idx < opt.route_sequence.length - 1 ? '<span class="text-slate-500">→</span>' : ''}
        `).join("");
      }

      // Render 2D Canvas Map
      this.drawWarehouseMap(opt.sorted_items);

      // Render Items Checklist
      const checklist = document.getElementById("picking-items-checklist");
      if (checklist) {
        checklist.innerHTML = (task.items || []).map(itm => `
          <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl ${itm.status === 'Picked' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'} flex items-center justify-center font-bold">
                ${itm.status === 'Picked' ? '✓' : itm.sequence_order}
              </div>
              <div>
                <div class="font-bold text-white">${itm.sku} — ${itm.product_name}</div>
                <div class="text-[11px] text-indigo-300 font-mono mt-0.5">Bin: ${itm.location} | Qty: ${itm.requested_qty} units</div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              ${itm.status === 'Picked' ? `
                <span class="font-bold text-emerald-400 text-xs px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30">Picked (100%)</span>
              ` : `
                <button onclick="PickingView.pickSingleItem(${task.id}, ${itm.id})" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm">
                  Scan & Pick
                </button>
              `}
            </div>
          </div>
        `).join("");
      }

      // Action button: Complete Picking
      const actContainer = document.getElementById("active-task-action-container");
      if (actContainer) {
        actContainer.innerHTML = `
          <button onclick="PickingView.completeTask(${task.id})" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span>Complete Order Picking →</span>
          </button>
        `;
      }

    } catch (e) {
      console.error(e);
    }
  },

  drawWarehouseMap(items) {
    const canvas = document.getElementById("warehouse-map-canvas");
    if (!canvas) return;

    canvas.innerHTML = `
      <!-- Packing Station Base at (10, 10) -->
      <div class="absolute left-3 bottom-3 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono text-[10px] font-bold shadow-lg">
        Packing Depot (0,0)
      </div>
      <!-- SVG Path connecting stops -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="100%" stop-color="#06b6d4" />
          </linearGradient>
        </defs>
        ${items.map((itm, idx) => {
          const next = items[idx + 1];
          if (!next) return '';
          const x1 = Math.min(90, Math.max(10, itm.coords.x * 0.4));
          const y1 = Math.min(85, Math.max(15, itm.coords.y * 1.8));
          const x2 = Math.min(90, Math.max(10, next.coords.x * 0.4));
          const y2 = Math.min(85, Math.max(15, next.coords.y * 1.8));
          return `<line x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%" stroke="url(#routeGradient)" stroke-width="2" stroke-dasharray="4,4" />`;
        }).join("")}
      </svg>
      <!-- Stop Markers -->
      ${items.map(itm => {
        const x = Math.min(90, Math.max(10, itm.coords.x * 0.4));
        const y = Math.min(85, Math.max(15, itm.coords.y * 1.8));
        return `
          <div style="left: ${x}%; top: ${y}%;" class="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
            <div class="w-6 h-6 rounded-full bg-indigo-600 border-2 border-cyan-400 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
              ${itm.sequence_order}
            </div>
            <span class="text-[9px] font-mono text-cyan-300 bg-slate-900/90 px-1 rounded mt-0.5 border border-slate-700">${itm.location_code}</span>
          </div>
        `;
      }).join("")}
    `;
  },

  async pickSingleItem(taskId, itemId) {
    try {
      await API.performPickingAction({
        task_id: taskId,
        action: "pick_item",
        item_id: itemId
      });
      Toast.show("Barcode verified & item picked!", "success");
      this.selectTask(taskId);
    } catch (e) {
      Toast.show(e.message, "error");
    }
  },

  async completeTask(taskId) {
    try {
      const res = await API.performPickingAction({
        task_id: taskId,
        action: "complete"
      });
      Toast.show(res.message, "success");
      this.loadTasks();
    } catch (e) {
      Toast.show(e.message, "error");
    }
  }
};
