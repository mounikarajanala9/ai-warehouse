// Inventory Management View
const InventoryView = {
  currentCategory: "All",
  currentStatus: "All",
  currentSearch: "",
  currentSort: "stock_asc",

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Inventory & Stock Intelligence</span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Formula: Available = Current - Reserved - Damaged
              </span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">Real-time stock velocity, dynamic stockout forecasts, and automated replenishment prompts.</p>
          </div>
          <div class="flex items-center gap-2.5">
            <button onclick="Modals.openRestockModal(1, 'SKU-104', 'Quick Restock')" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>Restock Inventory</span>
            </button>
          </div>
        </div>

        <!-- Filters & Search Toolbar -->
        <div class="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            <!-- Search -->
            <div class="relative flex-1 min-w-[200px] max-w-sm">
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" id="inv-search-input" placeholder="Search SKU, product, supplier..." value="${this.currentSearch}" class="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-indigo-500 outline-none">
            </div>

            <!-- Category Filter -->
            <select id="inv-cat-select" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none cursor-pointer">
              <option value="All">All Categories</option>
            </select>

            <!-- Status Filter -->
            <select id="inv-stat-select" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none cursor-pointer">
              <option value="All" ${this.currentStatus === 'All' ? 'selected' : ''}>All Statuses</option>
              <option value="In Stock" ${this.currentStatus === 'In Stock' ? 'selected' : ''}>In Stock</option>
              <option value="Low Stock" ${this.currentStatus === 'Low Stock' ? 'selected' : ''}>Low Stock</option>
              <option value="Critical" ${this.currentStatus === 'Critical' ? 'selected' : ''}>Critical Stockout Risk</option>
              <option value="Out of Stock" ${this.currentStatus === 'Out of Stock' ? 'selected' : ''}>Out of Stock</option>
              <option value="Damaged" ${this.currentStatus === 'Damaged' ? 'selected' : ''}>Damaged / Discrepancy</option>
            </select>
          </div>

          <!-- Sort -->
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-slate-400">Sort by:</span>
            <select id="inv-sort-select" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none cursor-pointer">
              <option value="stock_asc" ${this.currentSort === 'stock_asc' ? 'selected' : ''}>Available Stock (Lowest First)</option>
              <option value="stock_desc" ${this.currentSort === 'stock_desc' ? 'selected' : ''}>Available Stock (Highest First)</option>
              <option value="days_asc" ${this.currentSort === 'days_asc' ? 'selected' : ''}>Days to Stockout (Most Urgent)</option>
              <option value="name_asc" ${this.currentSort === 'name_asc' ? 'selected' : ''}>Product Name (A-Z)</option>
            </select>
          </div>
        </div>

        <!-- Inventory Table Container -->
        <div class="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
                <tr>
                  <th class="py-3 px-4">SKU / Product</th>
                  <th class="py-3 px-3">Category</th>
                  <th class="py-3 px-3">Location</th>
                  <th class="py-3 px-3 text-center">Physical</th>
                  <th class="py-3 px-3 text-center">Reserved</th>
                  <th class="py-3 px-3 text-center">Damaged</th>
                  <th class="py-3 px-3 text-center font-bold text-slate-200">Net Available</th>
                  <th class="py-3 px-3 text-center">Days to Stockout</th>
                  <th class="py-3 px-3 text-center">Status</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="inventory-table-body" class="divide-y divide-slate-800/60">
                <tr><td colspan="10" class="py-8 text-center text-slate-400">Loading inventory records...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.loadData();
  },

  bindEvents() {
    const searchInput = document.getElementById("inv-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.currentSearch = e.target.value;
        this.loadData();
      });
    }

    const catSelect = document.getElementById("inv-cat-select");
    if (catSelect) {
      catSelect.addEventListener("change", (e) => {
        this.currentCategory = e.target.value;
        this.loadData();
      });
    }

    const statSelect = document.getElementById("inv-stat-select");
    if (statSelect) {
      statSelect.addEventListener("change", (e) => {
        this.currentStatus = e.target.value;
        this.loadData();
      });
    }

    const sortSelect = document.getElementById("inv-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.currentSort = e.target.value;
        this.loadData();
      });
    }
  },

  async loadData() {
    try {
      const data = await API.getInventory({
        category: this.currentCategory,
        status: this.currentStatus,
        search: this.currentSearch,
        sort_by: this.currentSort
      });

      // Populate categories dropdown if needed
      const catSelect = document.getElementById("inv-cat-select");
      if (catSelect && catSelect.options.length <= 1 && data.categories) {
        catSelect.innerHTML = `<option value="All">All Categories</option>` + data.categories.map(c => `<option value="${c}">${c}</option>`).join("");
      }

      const tbody = document.getElementById("inventory-table-body");
      if (!tbody) return;

      if (!data.items || data.items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="py-8 text-center text-slate-400">No matching products found.</td></tr>`;
        return;
      }

      tbody.innerHTML = data.items.map(p => {
        const isBelowReorder = p.available_stock <= p.reorder_level;
        return `
          <tr class="hover:bg-slate-900/60 transition-colors ${isBelowReorder ? 'bg-amber-950/10' : ''}">
            <!-- SKU & Name -->
            <td class="py-3 px-4">
              <div class="font-bold text-white flex items-center gap-1.5">
                <span>${p.sku}</span>
                ${isBelowReorder ? `<span class="text-amber-400 text-xs" title="Below Reorder Threshold (${p.reorder_level})">⚠️</span>` : ''}
              </div>
              <div class="text-[11px] text-slate-300 font-medium">${p.name}</div>
              <div class="text-[10px] text-slate-500 font-mono">${p.supplier} • $${p.unit_price}</div>
            </td>

            <!-- Category -->
            <td class="py-3 px-3 text-slate-300 text-[11px]">${p.category}</td>

            <!-- Location -->
            <td class="py-3 px-3">
              <span class="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-700">${p.location_code}</span>
            </td>

            <!-- Counts -->
            <td class="py-3 px-3 text-center text-slate-300">${p.current_stock}</td>
            <td class="py-3 px-3 text-center text-indigo-300 font-medium">${p.reserved_stock}</td>
            <td class="py-3 px-3 text-center ${p.damaged_stock > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'}">${p.damaged_stock}</td>
            <td class="py-3 px-3 text-center font-extrabold text-sm ${p.available_stock === 0 ? 'text-rose-400' : p.available_stock <= p.reorder_level ? 'text-amber-300' : 'text-emerald-400'}">
              ${p.available_stock}
            </td>

            <!-- Days to Stockout -->
            <td class="py-3 px-3 text-center">
              <span class="font-bold font-mono text-[11px] ${p.days_until_stockout <= 2.0 ? 'text-rose-400' : p.days_until_stockout <= 4.0 ? 'text-amber-300' : 'text-slate-300'}">
                ~${p.days_until_stockout} days
              </span>
              <span class="text-[9px] text-slate-500 block">(${p.daily_demand}/day)</span>
            </td>

            <!-- Status Badge -->
            <td class="py-3 px-3 text-center">
              <span class="font-bold text-[10px] px-2 py-0.5 rounded-full ${
                p.status === 'Critical' || p.status === 'Out of Stock' ? 'badge-critical' :
                p.status === 'Low Stock' || p.status === 'Damaged' ? 'badge-warning' :
                'badge-healthy'
              }">${p.status}</span>
            </td>

            <!-- Action Buttons -->
            <td class="py-3 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="Modals.openRestockModal(${p.id}, '${p.sku}', '${p.name.replace(/'/g, "\\'")}')" class="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] transition-colors" title="Restock">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
                <button onclick="Modals.openDamageReportModal(${p.id}, '${p.sku}', '${p.name.replace(/'/g, "\\'")}')" class="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[11px] transition-colors" title="Report Damaged">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    } catch (e) {
      console.error(e);
    }
  }
};
