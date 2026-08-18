// Modal Dialogs Manager
const Modals = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "modal-root";
      document.body.appendChild(this.container);
    }
  },

  close() {
    if (this.container) {
      this.container.innerHTML = "";
    }
  },

  // 1. Create Order Modal with Real-time Priority Preview
  async openCreateOrderModal() {
    this.init();
    try {
      const invData = await API.getInventory();
      const products = invData.items || [];

      this.container.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div class="glass-panel w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-700/80 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white">Create New Warehouse Order</h3>
                  <p class="text-xs text-slate-400">Intelligent priority scoring is automatically calculated on submission.</p>
                </div>
              </div>
              <button onclick="Modals.close()" class="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form id="create-order-form" class="mt-5 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1.5">Customer Name</label>
                  <input type="text" id="ord-customer" required placeholder="e.g. Apex Aerospace Systems" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-indigo-500 outline-none">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1.5">Customer Tier</label>
                  <select id="ord-tier" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-indigo-500 outline-none">
                    <option value="VIP">VIP Platinum Tier (+25 pts)</option>
                    <option value="Enterprise">Enterprise Corporate (+18 pts)</option>
                    <option value="Standard" selected>Standard Account (+5 pts)</option>
                    <option value="Retail">Retail Consumer (+10 pts)</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1.5">Delivery Deadline</label>
                  <input type="datetime-local" id="ord-deadline" required class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-indigo-500 outline-none">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1.5">Carrier Service</label>
                  <select id="ord-carrier" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-indigo-500 outline-none">
                    <option value="FedEx Priority Express">FedEx Priority Express (Air)</option>
                    <option value="UPS Ground Freight">UPS Ground Freight</option>
                    <option value="DHL Express Global">DHL Express Global</option>
                    <option value="BlueDart Swift Air">BlueDart Swift Air</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center gap-2 pt-1">
                <input type="checkbox" id="ord-express" class="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0">
                <label for="ord-express" class="text-xs font-medium text-slate-300">Flag as Urgent Express Dispatch (+20 priority pts)</label>
              </div>

              <!-- Product Items Selector -->
              <div class="pt-3 border-t border-slate-800">
                <label class="block text-xs font-semibold text-slate-300 mb-2">Order Line Items</label>
                <div id="order-items-list" class="space-y-2.5">
                  <div class="order-item-row flex items-center gap-2">
                    <select class="item-prod-select flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-indigo-500 outline-none">
                      ${products.map(p => `<option value="${p.id}">${p.sku} — ${p.name} (Avail: ${p.available_stock})</option>`).join("")}
                    </select>
                    <input type="number" min="1" max="100" value="2" class="item-qty-input w-20 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs text-center focus:border-indigo-500 outline-none">
                    <button type="button" class="btn-remove-row text-slate-500 hover:text-rose-400 p-1 text-sm" onclick="this.parentElement.remove()">✕</button>
                  </div>
                </div>
                <button type="button" id="btn-add-item-row" class="mt-2.5 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium">
                  <span>+ Add another SKU</span>
                </button>
              </div>

              <!-- Real-time Priority Preview Box -->
              <div class="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-bold text-indigo-300 uppercase tracking-wider text-[10px]">Smart Decision Engine Preview</span>
                  <span id="preview-priority-badge" class="font-bold px-2 py-0.5 rounded text-[11px] bg-indigo-500/20 text-indigo-300">CALCULATING...</span>
                </div>
                <p id="preview-priority-reason" class="text-slate-300 text-[11px] leading-relaxed">Multi-factor priority score combines deadline urgency, customer tier, and express flags.</p>
              </div>

              <!-- Buttons -->
              <div class="flex items-center justify-end gap-3 pt-3">
                <button type="button" onclick="Modals.close()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium">Cancel</button>
                <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      `;

      // Set default deadline to +4 hours from now
      const defaultDate = new Date();
      defaultDate.setHours(defaultDate.getHours() + 4);
      const isoLocal = new Date(defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      document.getElementById("ord-deadline").value = isoLocal;

      // Add item row event
      document.getElementById("btn-add-item-row").addEventListener("click", () => {
        const list = document.getElementById("order-items-list");
        const row = document.createElement("div");
        row.className = "order-item-row flex items-center gap-2";
        row.innerHTML = `
          <select class="item-prod-select flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-indigo-500 outline-none">
            ${products.map(p => `<option value="${p.id}">${p.sku} — ${p.name} (Avail: ${p.available_stock})</option>`).join("")}
          </select>
          <input type="number" min="1" max="100" value="1" class="item-qty-input w-20 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs text-center focus:border-indigo-500 outline-none">
          <button type="button" class="btn-remove-row text-slate-500 hover:text-rose-400 p-1 text-sm" onclick="this.parentElement.remove()">✕</button>
        `;
        list.appendChild(row);
      });

      // Handle Submit
      document.getElementById("create-order-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const cust = document.getElementById("ord-customer").value;
        const tier = document.getElementById("ord-tier").value;
        const deadline = document.getElementById("ord-deadline").value;
        const carrier = document.getElementById("ord-carrier").value;
        const express = document.getElementById("ord-express").checked;

        const rows = document.querySelectorAll(".order-item-row");
        const items = [];
        rows.forEach(r => {
          const pId = parseInt(r.querySelector(".item-prod-select").value);
          const qty = parseInt(r.querySelector(".item-qty-input").value) || 1;
          items.push({ product_id: pId, requested_qty: qty });
        });

        if (items.length === 0) {
          Toast.show("Please add at least one line item.", "warning");
          return;
        }

        try {
          const res = await API.createOrder({
            customer_name: cust,
            customer_type: tier,
            is_express: express,
            delivery_deadline: deadline,
            carrier: carrier,
            items: items
          });

          Toast.show(`Order ${res.order_number} created with ${res.priority} priority!`, "success");
          Modals.close();
          if (App.currentView === "orders" || App.currentView === "dashboard") {
            App.render();
          }
        } catch (err) {
          Toast.show(err.message, "error");
        }
      });

    } catch (err) {
      Toast.show("Failed to open order creation dialog.", "error");
    }
  },

  // 2. Restock Modal
  openRestockModal(productId, sku, name) {
    this.init();
    this.container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <div class="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-700/80">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 class="text-base font-bold text-white">Inbound Restock: ${sku}</h3>
            <button onclick="Modals.close()" class="text-slate-400 hover:text-white">✕</button>
          </div>
          <p class="text-xs text-slate-400 mt-2">${name}</p>

          <form id="restock-form" class="mt-4 space-y-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Restock Quantity (Units)</label>
              <input type="number" id="restock-qty" min="1" max="1000" value="50" required class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-indigo-500 outline-none">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Reason / Purchase Order</label>
              <input type="text" id="restock-reason" value="Replenishment PO Received" required class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-indigo-500 outline-none">
            </div>
            <div class="flex items-center justify-end gap-2.5 pt-3">
              <button type="button" onclick="Modals.close()" class="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
              <button type="submit" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold">Confirm Restock</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById("restock-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const qty = parseInt(document.getElementById("restock-qty").value);
      const reason = document.getElementById("restock-reason").value;
      try {
        await API.adjustInventory({
          product_id: productId,
          adjustment_type: "restock",
          quantity: qty,
          reason: reason
        });
        Toast.show(`Added ${qty} units to ${sku}.`, "success");
        Modals.close();
        App.render();
      } catch (err) {
        Toast.show(err.message, "error");
      }
    });
  },

  // 3. Report Damaged Modal
  openDamageReportModal(productId, sku, name) {
    this.init();
    this.container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <div class="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-rose-800/40">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2 text-rose-400 font-bold text-base">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span>Report Damaged Stock: ${sku}</span>
            </div>
            <button onclick="Modals.close()" class="text-slate-400 hover:text-white">✕</button>
          </div>
          <p class="text-xs text-slate-400 mt-2">${name}</p>

          <form id="damage-form" class="mt-4 space-y-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Damaged Quantity (Units)</label>
              <input type="number" id="dmg-qty" min="1" max="100" value="1" required class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-rose-500 outline-none">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Defect Description / Reason</label>
              <input type="text" id="dmg-reason" value="Fractured casing during bin handling" required class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-rose-500 outline-none">
            </div>
            <div class="p-3 rounded-xl bg-rose-950/30 border border-rose-800/30 text-[11px] text-rose-300">
              ⚠️ Damaged units are immediately subtracted from available stock and quarantined. An Exception will be auto-generated.
            </div>
            <div class="flex items-center justify-end gap-2.5 pt-2">
              <button type="button" onclick="Modals.close()" class="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
              <button type="submit" class="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold">Report Damage</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById("damage-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const qty = parseInt(document.getElementById("dmg-qty").value);
      const reason = document.getElementById("dmg-reason").value;
      try {
        const res = await API.adjustInventory({
          product_id: productId,
          adjustment_type: "damage",
          quantity: qty,
          reason: reason
        });
        Toast.show(res.message, "warning");
        Modals.close();
        App.render();
      } catch (err) {
        Toast.show(err.message, "error");
      }
    });
  },

  // 4. Global Search Modal
  openGlobalSearch() {
    this.init();
    this.container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-fade-in" onclick="if(event.target === this) Modals.close()">
        <div class="glass-panel w-full max-w-xl rounded-3xl p-4 shadow-2xl border border-slate-700/80">
          <div class="relative">
            <svg class="w-5 h-5 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" id="global-search-input" placeholder="Search orders (ORD-1024), SKUs (SKU-104), locations (A-01)..." class="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:border-indigo-500 outline-none" autofocus>
            <button onclick="Modals.close()" class="absolute right-3.5 top-2.5 text-slate-400 hover:text-white">✕</button>
          </div>

          <div id="global-search-results" class="mt-4 space-y-2 max-h-96 overflow-y-auto">
            <p class="text-xs text-slate-500 text-center py-6">Type above to search orders, products, and exceptions.</p>
          </div>
        </div>
      </div>
    `;

    const input = document.getElementById("global-search-input");
    const results = document.getElementById("global-search-results");

    input.addEventListener("input", async () => {
      const q = input.value.trim();
      if (!q) {
        results.innerHTML = `<p class="text-xs text-slate-500 text-center py-6">Type above to search orders, products, and exceptions.</p>`;
        return;
      }

      try {
        const [invRes, ordRes] = await Promise.all([
          API.getInventory({ search: q }),
          API.getOrders({ search: q })
        ]);

        const items = invRes.items || [];
        const orders = ordRes.orders || [];

        if (items.length === 0 && orders.length === 0) {
          results.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">No matching records found for "${q}".</p>`;
          return;
        }

        let html = "";
        if (orders.length > 0) {
          html += `<div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">Orders (${orders.length})</div>`;
          html += orders.slice(0, 5).map(o => `
            <div class="p-2.5 rounded-xl bg-slate-900/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 cursor-pointer flex items-center justify-between text-xs transition-colors" onclick="Modals.close(); App.openOrderDetails(${o.id})">
              <div>
                <div class="font-bold text-white">${o.order_number} <span class="text-slate-400 font-normal">(${o.customer_name})</span></div>
                <div class="text-[11px] text-slate-400 mt-0.5">${o.priority_reason || o.status}</div>
              </div>
              <span class="font-bold px-2 py-0.5 rounded text-[10px] ${o.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'}">${o.status}</span>
            </div>
          `).join("");
        }

        if (items.length > 0) {
          html += `<div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mt-3">Products & Inventory (${items.length})</div>`;
          html += items.slice(0, 5).map(p => `
            <div class="p-2.5 rounded-xl bg-slate-900/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 cursor-pointer flex items-center justify-between text-xs transition-colors" onclick="Modals.close(); App.navigate('inventory')">
              <div>
                <div class="font-bold text-white">${p.sku} — <span class="text-slate-300 font-normal">${p.name}</span></div>
                <div class="text-[11px] text-slate-400 mt-0.5">Loc: ${p.location_code} | Daily Demand: ${p.daily_demand}/day</div>
              </div>
              <span class="font-bold px-2 py-0.5 rounded text-[10px] ${p.status === 'Critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}">Avail: ${p.available_stock}</span>
            </div>
          `).join("");
        }

        results.innerHTML = html;
      } catch (e) {
        results.innerHTML = `<p class="text-xs text-rose-400 text-center py-4">Search error</p>`;
      }
    });
  }
};
