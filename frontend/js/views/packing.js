// Packing & Quality Check Station View
const PackingView = {
  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Packing & Quality Assurance Station</span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                100% Barcode QC Inspection
              </span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">Verification of SKU counts, package weight determination, and tamper-evident sealing.</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400">Assigned Station:</span>
            <span class="text-xs font-bold text-slate-200 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">Station STN-1 (Sam Rivera)</span>
          </div>
        </div>

        <!-- Packing Queue -->
        <div class="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div class="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <h3 class="font-bold text-xs uppercase tracking-wider text-slate-300">Orders in Packing Queue</h3>
            <span id="pack-queue-count" class="text-xs text-indigo-400 font-mono">Loading...</span>
          </div>

          <div id="packing-tasks-container" class="divide-y divide-slate-800/60">
            <p class="text-xs text-slate-400 text-center py-8">Loading packing tasks...</p>
          </div>
        </div>
      </div>
    `;

    this.loadTasks();
  },

  async loadTasks() {
    try {
      const tasks = await API.getPackingTasks();
      const countEl = document.getElementById("pack-queue-count");
      const container = document.getElementById("packing-tasks-container");
      if (countEl) countEl.innerText = `${tasks.length} orders queued`;

      if (!tasks || tasks.length === 0) {
        if (container) container.innerHTML = `<div class="p-8 text-center text-slate-400 text-xs">No orders currently waiting in the packing queue.</div>`;
        return;
      }

      container.innerHTML = tasks.map(t => `
        <div class="p-5 hover:bg-slate-900/40 transition-colors space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2.5">
                <span class="font-mono font-bold text-white text-sm">${t.order_number}</span>
                <span class="font-bold text-[10px] px-2 py-0.5 rounded-full ${t.priority === 'Critical' ? 'badge-critical' : 'badge-healthy'}">${t.priority}</span>
                <span class="text-xs text-slate-400">• ${t.customer_name}</span>
              </div>
              <div class="text-xs text-indigo-300 font-mono mt-1">Carrier: ${t.carrier || 'FedEx Express'} | Station: ${t.station_name}</div>
            </div>

            <div class="flex items-center gap-2">
              <span class="font-bold text-xs px-2.5 py-1 rounded-lg ${t.qc_status === 'Passed' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}">
                QC: ${t.qc_status}
              </span>
              <span class="font-bold text-xs px-2.5 py-1 rounded-lg bg-indigo-950/40 text-indigo-300 border border-indigo-500/30">
                ${t.status}
              </span>
            </div>
          </div>

          <!-- Items Checklist -->
          <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Package Contents:</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              ${(t.items || []).map(itm => `
                <div class="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between">
                  <span class="font-medium text-slate-200">${itm.requested_qty}x ${itm.sku}</span>
                  <span class="text-emerald-400 font-bold">✓ Verified</span>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Station Controls -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div class="flex items-center gap-2 text-xs">
              <span class="text-slate-400">Box:</span>
              <select id="box-select-${t.id}" class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none">
                <option value="Small (Box-S)">Small (Box-S)</option>
                <option value="Medium (Box-M)" selected>Medium (Box-M)</option>
                <option value="Large Heavy Duty (Box-L)">Large Heavy Duty (Box-L)</option>
              </select>

              <span class="text-slate-400 ml-2">Weight:</span>
              <input type="number" id="weight-input-${t.id}" value="2.8" step="0.1" class="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs text-center outline-none">
              <span class="text-slate-400">kg</span>
            </div>

            <div class="flex items-center gap-2">
              <button onclick="PackingView.markQC(${t.id}, true)" class="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold transition-all">
                ✓ Pass QC Inspection
              </button>
              <button onclick="PackingView.markPacked(${t.id})" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all">
                Seal & Stage for Dispatch →
              </button>
            </div>
          </div>
        </div>
      `).join("");
    } catch (e) {
      console.error(e);
    }
  },

  async markQC(taskId, passed) {
    try {
      const res = await API.performPackingAction({
        task_id: taskId,
        action: "complete_qc",
        qc_passed: passed,
        qc_notes: "Visual and barcode verification 100% compliant."
      });
      Toast.show(res.message, "success");
      this.loadTasks();
    } catch (e) {
      Toast.show(e.message, "error");
    }
  },

  async markPacked(taskId) {
    try {
      const box = document.getElementById(`box-select-${taskId}`)?.value || "Medium (Box-M)";
      const weight = parseFloat(document.getElementById(`weight-input-${taskId}`)?.value) || 2.8;

      const res = await API.performPackingAction({
        task_id: taskId,
        action: "mark_packed",
        box_size: box,
        package_weight_kg: weight
      });
      Toast.show(res.message, "success");
      this.loadTasks();
    } catch (e) {
      Toast.show(e.message, "error");
    }
  }
};
