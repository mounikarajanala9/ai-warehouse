// Sidebar Navigation Component
const Sidebar = {
  render(currentView = "dashboard", role = "Warehouse Manager") {
    const navItems = [
      { id: "landing", label: "Executive Pulse", icon: "sparkles", roles: ["Warehouse Manager", "Picker", "Packing Staff", "Admin"] },
      { id: "dashboard", label: "Command Center", icon: "layout-dashboard", badge: "Live", roles: ["Warehouse Manager", "Admin"] },
      { id: "demo_scenario", label: "Demo Scenario", icon: "flame", badge: "Star", highlight: true, roles: ["Warehouse Manager", "Picker", "Packing Staff", "Admin"] },
      { id: "inventory", label: "Inventory Control", icon: "boxes", roles: ["Warehouse Manager", "Admin"] },
      { id: "orders", label: "Order Fulfillment", icon: "shopping-bag", roles: ["Warehouse Manager", "Admin"] },
      { id: "picking", label: "Picking Terminal", icon: "navigation", badge: "Route AI", roles: ["Warehouse Manager", "Picker", "Admin"] },
      { id: "packing", label: "Packing & QC", icon: "package-check", roles: ["Warehouse Manager", "Packing Staff", "Admin"] },
      { id: "exceptions", label: "Exceptions Board", icon: "shield-alert", badge: "AI Fix", roles: ["Warehouse Manager", "Admin"] },
      { id: "dispatches", label: "Dispatch Logistics", icon: "truck", roles: ["Warehouse Manager", "Admin"] },
      { id: "analytics", label: "Bottleneck Analytics", icon: "bar-chart-3", badge: "Insights", roles: ["Warehouse Manager", "Admin"] },
      { id: "audit_logs", label: "Audit & Timeline", icon: "history", roles: ["Warehouse Manager", "Admin"] }
    ];

    const icons = {
      "sparkles": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>`,
      "layout-dashboard": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 5a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg>`,
      "flame": `<svg class="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.527.82-1.173 1.559-1.874 2.251-1.077 1.066-2.298 2.052-3.13 3.395C4.24 10.155 4 11.536 4 13a8 8 0 1016 0c0-2.36-.97-4.478-2.508-6.002a9.78 9.78 0 00-2.617-1.897 10.428 10.428 0 00-2.48-.548zM10 15a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path></svg>`,
      "boxes": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>`,
      "shopping-bag": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>`,
      "navigation": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>`,
      "package-check": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
      "shield-alert": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`,
      "truck": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>`,
      "bar-chart-3": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>`,
      "history": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    };

    const filteredItems = navItems.filter(item => item.roles.includes(role));

    return `
      <aside id="app-sidebar" class="w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between p-4 fixed lg:static inset-y-0 left-0 z-40 transform -translate-x-full lg:translate-x-0 transition-transform duration-300">
        <div>
          <!-- Section Label -->
          <div class="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Navigation Hub</div>
          
          <!-- Nav list -->
          <nav class="space-y-1">
            ${filteredItems.map(item => {
              const isActive = currentView === item.id;
              const isHighlight = item.highlight;
              return `
                <button 
                  onclick="App.navigate('${item.id}')"
                  class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive 
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm" 
                      : isHighlight
                      ? "bg-purple-950/40 text-purple-300 border border-purple-800/40 hover:bg-purple-900/40 hover:text-white"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/80"
                  }"
                >
                  <div class="flex items-center gap-3">
                    <span class="${isActive ? 'text-indigo-400' : isHighlight ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'}">
                      ${icons[item.icon] || ''}
                    </span>
                    <span>${item.label}</span>
                  </div>
                  ${item.badge ? `
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badge === 'Star' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      item.badge === 'Live' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }">${item.badge}</span>
                  ` : ''}
                </button>
              `;
            }).join("")}
          </nav>
        </div>

        <!-- Bottom Role & System Card -->
        <div class="pt-4 border-t border-slate-800/80">
          <div class="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/20">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">Active Workspace</span>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <div class="text-xs font-semibold text-slate-200 truncate">Main Distribution Hub #1</div>
            <div class="text-[10px] text-slate-400 mt-1">Zone A • B • C • D | Grid v2.4</div>
          </div>
        </div>
      </aside>
    `;
  }
};
