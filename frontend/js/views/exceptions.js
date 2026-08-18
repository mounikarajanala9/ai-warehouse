// Exception Management & Auto-Resolution View
const ExceptionsView = {
  currentStatus: "All",
  currentSeverity: "All",

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Exception Control & Auto-Resolution</span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                1-Click Recovery Workflows
              </span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">Autonomous mitigation for stockouts, physical bin discrepancies, and operational delays.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="App.render()" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <span>Refresh Exceptions</span>
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <select id="exc-stat-select" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none cursor-pointer">
              <option value="All" ${this.currentStatus === 'All' ? 'selected' : ''}>All Statuses</option>
              <option value="Resolution Suggested" ${this.currentStatus === 'Resolution Suggested' ? 'selected' : ''}>Resolution Suggested (Ready to Apply)</option>
              <option value="Open" ${this.currentStatus === 'Open' ? 'selected' : ''}>Open / Detected</option>
              <option value="Investigating" ${this.currentStatus === 'Investigating' ? 'selected' : ''}>Under Investigation</option>
              <option value="Resolved" ${this.currentStatus === 'Resolved' ? 'selected' : ''}>Resolved</option>
            </select>

            <select id="exc-sev-select" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none cursor-pointer">
              <option value="All" ${this.currentSeverity === 'All' ? 'selected' : ''}>All Severities</option>
              <option value="Critical" ${this.currentSeverity === 'Critical' ? 'selected' : ''}>Critical</option>
              <option value="High" ${this.currentSeverity === 'High' ? 'selected' : ''}>High</option>
              <option value="Medium" ${this.currentSeverity === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="Low" ${this.currentSeverity === 'Low' ? 'selected' : ''}>Low</option>
            </select>
          </div>
        </div>

        <!-- Exceptions Feed -->
        <div id="exceptions-feed-container" class="space-y-4">
          <p class="text-xs text-slate-400 text-center py-8">Loading exceptions...</p>
        </div>
      </div>
    `;

    this.bindEvents();
    this.loadData();
  },

  bindEvents() {
    const statSelect = document.getElementById("exc-stat-select");
    if (statSelect) {
      statSelect.addEventListener("change", (e) => {
        this.currentStatus = e.target.value;
        this.loadData();
      });
    }

    const sevSelect = document.getElementById("exc-sev-select");
    if (sevSelect) {
      sevSelect.addEventListener("change", (e) => {
        this.currentSeverity = e.target.value;
        this.loadData();
      });
    }
  },

  async loadData() {
    try {
      const exceptions = await API.getExceptions({
        status: this.currentStatus,
        severity: this.currentSeverity
      });

      const container = document.getElementById("exceptions-feed-container");
      if (!container) return;

      if (!exceptions || exceptions.length === 0) {
        container.innerHTML = `<div class="p-8 text-center glass-panel rounded-3xl text-emerald-400 text-xs font-semibold">✅ No open exceptions matching current filters. All operations flowing normally.</div>`;
        return;
      }

      container.innerHTML = exceptions.map(exc => {
        const isResolved = exc.status === "Resolved";
        const isCritical = exc.severity === "Critical";

        return `
          <div class="glass-panel rounded-3xl p-6 border ${
            isResolved ? 'border-slate-800 opacity-75' :
            isCritical ? 'border-rose-500/50 bg-rose-950/10' :
            'border-amber-500/40 bg-amber-950/10'
          } shadow-xl space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div class="flex items-center gap-2.5">
                <span class="font-mono font-bold text-white text-sm">${exc.exception_code}</span>
                <span class="font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full ${
                  isCritical ? 'badge-critical' : 'badge-warning'
                }">${exc.severity} Severity</span>
                <span class="text-xs text-slate-400 font-medium">• ${exc.type}</span>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-400 font-mono">Team: ${exc.responsible_team}</span>
                <span class="font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full ${
                  isResolved ? 'badge-healthy' : 'badge-ai'
                }">${exc.status}</span>
              </div>
            </div>

            <!-- Description -->
            <div>
              <p class="text-xs text-slate-200 leading-relaxed font-medium">${exc.description}</p>
              <div class="text-[11px] text-slate-500 mt-1 font-mono">Detected: ${exc.detected_time || 'Recent'} ${exc.order_number ? `| Associated Order: ${exc.order_number}` : ''}</div>
            </div>

            <!-- Automated AI Recommendation Box (Core Requirement #12 & #16) -->
            <div class="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs">
              <div class="flex items-center gap-2 mb-1.5">
                <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <span class="font-bold text-purple-300 uppercase tracking-wider text-[10px]">Automated System Recommendation</span>
              </div>
              <p class="text-slate-200 leading-relaxed font-mono text-[11px]">${exc.recommended_action || 'Review discrepancy with shift supervisor.'}</p>
              ${exc.resolution_notes ? `<div class="text-emerald-400 mt-2 font-bold text-[11px]">Resolution Executed: ${exc.resolution_notes} (${exc.resolved_at})</div>` : ''}
            </div>

            <!-- Action Controls -->
            ${!isResolved ? `
              <div class="flex items-center justify-end gap-3 pt-2">
                <button onclick="ExceptionsView.investigate(${exc.id})" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">
                  Mark Under Investigation
                </button>
                <button onclick="ExceptionsView.approveResolution(${exc.id})" class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5">
                  <span>✓ Approve & Execute Recommendation</span>
                </button>
              </div>
            ` : ''}
          </div>
        `;
      }).join("");
    } catch (e) {
      console.error(e);
    }
  },

  async approveResolution(excId) {
    try {
      const res = await API.performExceptionAction({
        exception_id: excId,
        action: "approve_recommendation"
      });
      Toast.show(res.message, "success");
      this.loadData();
    } catch (e) {
      Toast.show(e.message, "error");
    }
  },

  async investigate(excId) {
    try {
      const res = await API.performExceptionAction({
        exception_id: excId,
        action: "investigate"
      });
      Toast.show(res.message, "info");
      this.loadData();
    } catch (e) {
      Toast.show(e.message, "error");
    }
  }
};
