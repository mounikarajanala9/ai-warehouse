// Audit Trail & Logs View
const AuditLogsView = {
  currentEntity: "All",

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Tamper-Evident Audit Ledger</span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                100% Traceability
              </span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">Chronological record of priority calculations, inventory reservations, picking completions, and dispatches.</p>
          </div>
          <div class="flex items-center gap-2">
            <select id="audit-filter-select" class="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none cursor-pointer">
              <option value="All">All Operations</option>
              <option value="Order">Orders & Allocations</option>
              <option value="Inventory">Inventory & Stock</option>
              <option value="PickingTask">Picking Tasks</option>
              <option value="PackingTask">Packing & QC</option>
              <option value="Dispatch">Carrier Dispatches</option>
              <option value="Exception">Exceptions & Mitigations</option>
            </select>
          </div>
        </div>

        <!-- Audit Table -->
        <div class="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div class="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <h3 class="font-bold text-xs uppercase tracking-wider text-slate-300">System Activity Stream</h3>
            <span id="audit-count" class="text-xs text-indigo-400 font-mono">Loading...</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
                <tr>
                  <th class="py-3 px-4">Entity Type</th>
                  <th class="py-3 px-3">Action Tag</th>
                  <th class="py-3 px-3">Event Description & Decisions</th>
                  <th class="py-3 px-3">Actor</th>
                  <th class="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody id="audit-table-body" class="divide-y divide-slate-800/60">
                <tr><td colspan="5" class="py-8 text-center text-slate-400">Loading audit trail...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const select = document.getElementById("audit-filter-select");
    if (select) {
      select.addEventListener("change", (e) => {
        this.currentEntity = e.target.value;
        this.loadData();
      });
    }

    this.loadData();
  },

  async loadData() {
    try {
      const logs = await API.getAuditLogs(100, this.currentEntity);
      const countEl = document.getElementById("audit-count");
      const tbody = document.getElementById("audit-table-body");
      if (countEl) countEl.innerText = `${logs.length} logged events`;

      if (!logs || logs.length === 0) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400">No matching audit events recorded.</td></tr>`;
        return;
      }

      tbody.innerHTML = logs.map(l => `
        <tr class="hover:bg-slate-900/60 transition-colors">
          <td class="py-3.5 px-4">
            <span class="font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">${l.entity_type}</span>
          </td>
          <td class="py-3.5 px-3 font-mono font-semibold text-slate-300 text-[11px]">${l.action}</td>
          <td class="py-3.5 px-3 font-medium text-slate-200">${l.description}</td>
          <td class="py-3.5 px-3 font-mono text-slate-400 text-[11px]">${l.performed_by}</td>
          <td class="py-3.5 px-4 text-right font-mono text-slate-500 text-[11px]">${l.timestamp || 'Recent'}</td>
        </tr>
      `).join("");
    } catch (e) {
      console.error(e);
    }
  }
};
