// Interactive Hackathon Demo Scenario: Stock Shortage Showdown
const DemoScenarioView = {
  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- Header & Jury Highlights -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 shadow-2xl">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">Hackathon Star Feature</span>
              <span class="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider">Live Decision Engine</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Intelligent Stock Shortage Showdown
            </h1>
            <p class="text-xs text-slate-300 mt-1">
              Real-time demonstration of priority reservation, partial allocation, backorder split, and low-priority lockout.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button id="btn-reset-demo" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <span>Reset Clean Scenario</span>
            </button>
            <button id="btn-run-demo-step" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
              <svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              <span>Execute Smart Allocation</span>
            </button>
          </div>
        </div>

        <!-- 3-Way State Comparison Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- 1. The Contested Inventory (SKU-104) -->
          <div class="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                  <h3 class="font-bold text-sm text-white">Contested Inventory Stock</h3>
                </div>
                <span class="font-mono text-xs font-bold text-cyan-400">SKU-104</span>
              </div>

              <div class="mt-4 space-y-3">
                <div>
                  <div class="text-sm font-bold text-slate-100">Ultra-Precision Optical Sensor</div>
                  <div class="text-xs text-slate-400">Bin Location: A-01-02-B | Supplier: Apex Optronics</div>
                </div>

                <div class="grid grid-cols-2 gap-2 pt-2">
                  <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span class="text-[10px] text-slate-400 block uppercase font-semibold">Current Physical</span>
                    <span id="demo-sku-current" class="text-lg font-bold text-slate-200">10 units</span>
                  </div>
                  <div class="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30">
                    <span class="text-[10px] text-rose-400 block uppercase font-semibold">Damaged Quarantine</span>
                    <span id="demo-sku-damaged" class="text-lg font-bold text-rose-400">3 units</span>
                  </div>
                  <div class="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/30">
                    <span class="text-[10px] text-indigo-400 block uppercase font-semibold">Reserved Stock</span>
                    <span id="demo-sku-reserved" class="text-lg font-bold text-indigo-300">0 units</span>
                  </div>
                  <div class="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
                    <span class="text-[10px] text-emerald-400 block uppercase font-bold">Net Available</span>
                    <span id="demo-sku-avail" class="text-xl font-extrabold text-emerald-300">7 units</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 p-3 rounded-xl bg-slate-900/80 text-[11px] text-slate-300 font-mono border border-slate-800">
              Formula: Available (7) = Physical (10) - Damaged (3) - Reserved (0)
            </div>
          </div>

          <!-- 2. Contender 1: ORD-1024 (Urgent VIP) -->
          <div class="glass-panel rounded-3xl p-6 border-2 border-rose-500/50 shadow-xl bg-gradient-to-b from-rose-950/10 to-slate-900/90 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-rose-500/30">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-500 live-pulse"></span>
                  <h3 class="font-bold text-sm text-white">ORD-1024 (Urgent Order)</h3>
                </div>
                <span class="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">CRITICAL PRIORITY</span>
              </div>

              <div class="mt-4 space-y-3">
                <div>
                  <div class="text-sm font-bold text-slate-100">Apex Aerospace Systems</div>
                  <div class="text-xs text-rose-300 font-semibold">VIP Platinum Customer • Express Air SLA</div>
                </div>

                <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div class="flex justify-between text-xs">
                    <span class="text-slate-400">Demand:</span>
                    <span class="font-bold text-white">10 × SKU-104</span>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-slate-400">Deadline:</span>
                    <span class="font-bold text-rose-400">Within 2.5 hours</span>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-slate-400">Calculated Score:</span>
                    <span class="font-bold text-rose-300 font-mono">95.0 / 100</span>
                  </div>
                  <div class="flex justify-between text-xs pt-1 border-t border-slate-800">
                    <span class="text-slate-400">Fulfillment Status:</span>
                    <span id="demo-ord1-status" class="font-bold text-amber-300">Created</span>
                  </div>
                </div>

                <div id="demo-ord1-alloc-box" class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div class="text-[11px] text-slate-400">Allocation Outcome:</div>
                  <div id="demo-ord1-alloc-text" class="font-semibold text-slate-200 mt-0.5">Awaiting allocation trigger...</div>
                </div>
              </div>
            </div>

            <div class="mt-3 text-[11px] text-rose-300 font-mono">
              Priority Reason: CRITICAL — VIP Customer + Deadline &lt; 3h.
            </div>
          </div>

          <!-- 3. Contender 2: ORD-1027 (Low Priority) -->
          <div class="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                  <h3 class="font-bold text-sm text-white">ORD-1027 (Standard Order)</h3>
                </div>
                <span class="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">LOW PRIORITY</span>
              </div>

              <div class="mt-4 space-y-3">
                <div>
                  <div class="text-sm font-bold text-slate-100">OmniSupply Network</div>
                  <div class="text-xs text-slate-400">Standard Ground Fulfillment</div>
                </div>

                <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div class="flex justify-between text-xs">
                    <span class="text-slate-400">Demand:</span>
                    <span class="font-bold text-white">5 × SKU-104</span>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-slate-400">Deadline:</span>
                    <span class="font-bold text-slate-300">In 48.0 hours</span>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-slate-400">Calculated Score:</span>
                    <span class="font-bold text-slate-400 font-mono">20.0 / 100</span>
                  </div>
                  <div class="flex justify-between text-xs pt-1 border-t border-slate-800">
                    <span class="text-slate-400">Fulfillment Status:</span>
                    <span id="demo-ord2-status" class="font-bold text-slate-400">Created</span>
                  </div>
                </div>

                <div id="demo-ord2-alloc-box" class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div class="text-[11px] text-slate-400">Allocation Outcome:</div>
                  <div id="demo-ord2-alloc-text" class="font-semibold text-slate-200 mt-0.5">Awaiting allocation trigger...</div>
                </div>
              </div>
            </div>

            <div class="mt-3 text-[11px] text-slate-400 font-mono">
              Priority Reason: LOW — Delivery in 48h (No express flag).
            </div>
          </div>
        </div>

        <!-- 8-Step Intelligent Decision Breakdown Panel -->
        <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/40 bg-gradient-to-br from-slate-900/90 via-purple-950/20 to-slate-950">
          <h3 class="text-base font-bold text-white flex items-center gap-2 pb-4 border-b border-purple-500/20">
            <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <span>Autonomous Decision Engine Execution Trace (8 Stages)</span>
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            ${[
              { num: "1", title: "Shortage Detection", text: "Total demand is 15 units (10 + 5). Warehouse has only 7 unreserved available units." },
              { num: "2", title: "Priority Calculation", text: "ORD-1024 evaluated at 95 pts (Critical) vs ORD-1027 at 20 pts (Low)." },
              { num: "3", title: "Priority Reservation", text: "All 7 available units immediately locked & reserved for ORD-1024." },
              { num: "4", title: "Partial Allocation", text: "ORD-1024 allocated 7 units. Status moved to 'Partially Allocated'." },
              { num: "5", title: "Backorder Split", text: "Remaining 3 units of ORD-1024 sent to Urgent Replenishment Backorder." },
              { num: "6", title: "Low-Priority Lockout", text: "ORD-1027 locked out from consuming reserved stock. Status: 'Waiting for Stock'." },
              { num: "7", title: "Restock PO Trigger", text: "Emergency Purchase Order recommended to Apex Optronics Ltd for 40 units." },
              { num: "8", title: "Audit & Explainability", text: "Natural-language reasoning generated and saved to tamper-evident ledger." }
            ].map(s => `
              <div class="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/20 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <span class="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/40">${s.num}</span>
                    <span class="font-bold text-xs text-white">${s.title}</span>
                  </div>
                  <p class="text-[11px] text-slate-300 leading-relaxed">${s.text}</p>
                </div>
              </div>
            `).join("")}
          </div>

          <div id="demo-explanation-terminal" class="mt-6 p-4 rounded-2xl bg-black/80 border border-purple-500/30 text-xs font-mono text-purple-300 leading-relaxed max-h-48 overflow-y-auto">
            &gt; SYSTEM READY. Click "Execute Smart Allocation" to observe live allocation decisions.
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.loadState();
  },

  bindEvents() {
    document.getElementById("btn-reset-demo").addEventListener("click", async () => {
      try {
        await API.resetDemoScenario();
        Toast.show("Demo Scenario reset to initial state.", "success");
        this.loadState();
      } catch (e) {
        Toast.show(e.message, "error");
      }
    });

    document.getElementById("btn-run-demo-step").addEventListener("click", async () => {
      try {
        const res = await API.executeSmartAllocationDemoStep();
        Toast.show("Smart Stock Allocation executed successfully!", "ai");
        this.loadState();
        
        const term = document.getElementById("demo-explanation-terminal");
        if (term) {
          term.innerText = `> EXECUTION COMPLETE:\n${res.explanation}`;
        }
      } catch (e) {
        Toast.show(e.message, "error");
      }
    });
  },

  async loadState() {
    try {
      const data = await API.getDemoScenarioState();
      const sku = data.sku_104;
      const ord1 = data.order_urgent_1024;
      const ord2 = data.order_low_1027;

      if (sku) {
        document.getElementById("demo-sku-current").innerText = `${sku.current_stock} units`;
        document.getElementById("demo-sku-damaged").innerText = `${sku.damaged_stock} units`;
        document.getElementById("demo-sku-reserved").innerText = `${sku.reserved_stock} units`;
        document.getElementById("demo-sku-avail").innerText = `${sku.available_stock} units`;
      }

      if (ord1) {
        document.getElementById("demo-ord1-status").innerText = ord1.status;
        const itm = ord1.items && ord1.items[0];
        if (itm && itm.allocated_qty > 0) {
          document.getElementById("demo-ord1-alloc-text").innerHTML = `
            <span class="text-emerald-400 font-bold">✅ ${itm.allocated_qty}/10 Units Reserved</span>
            <span class="text-rose-400 block text-[10px] mt-0.5">⚠️ ${itm.backordered_qty || 3} Units on Urgent Backorder</span>
          `;
          document.getElementById("demo-ord1-alloc-box").className = "p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs";
        } else {
          document.getElementById("demo-ord1-alloc-text").innerText = "0/10 Units Allocated (Pending)";
        }
      }

      if (ord2) {
        document.getElementById("demo-ord2-status").innerText = ord2.status;
        const itm = ord2.items && ord2.items[0];
        if (itm && itm.allocated_qty === 0 && ord2.status !== "Created") {
          document.getElementById("demo-ord2-alloc-text").innerHTML = `
            <span class="text-amber-400 font-bold">🔒 0/5 Allocated (Locked Out)</span>
            <span class="text-slate-400 block text-[10px] mt-0.5">5 Units Backordered (Sufficient Lead Time)</span>
          `;
          document.getElementById("demo-ord2-alloc-box").className = "p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs";
        } else {
          document.getElementById("demo-ord2-alloc-text").innerText = "0/5 Units Allocated (Pending)";
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
};
