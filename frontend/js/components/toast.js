// Toast Notification System
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none";
      document.body.appendChild(this.container);
    }
  },

  show(message, type = "info", duration = 4000) {
    this.init();

    const toast = document.createElement("div");
    toast.className = `pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-4 opacity-0 max-w-md ${
      type === "success"
        ? "bg-slate-900 border border-emerald-500/40 text-emerald-300"
        : type === "error"
        ? "bg-slate-900 border border-rose-500/40 text-rose-300"
        : type === "warning"
        ? "bg-slate-900 border border-amber-500/40 text-amber-300"
        : type === "ai"
        ? "bg-slate-900 border border-indigo-500/50 text-indigo-300"
        : "bg-slate-900 border border-slate-700 text-slate-200"
    }`;

    let iconSvg = "";
    if (type === "success") {
      iconSvg = `<svg class="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
    } else if (type === "error") {
      iconSvg = `<svg class="w-5 h-5 text-rose-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    } else if (type === "warning") {
      iconSvg = `<svg class="w-5 h-5 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
    } else if (type === "ai") {
      iconSvg = `<svg class="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`;
    } else {
      iconSvg = `<svg class="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div class="flex-1 text-sm font-medium leading-relaxed">${message}</div>
      <button class="text-slate-400 hover:text-white ml-2 text-xs" onclick="this.parentElement.remove()">✕</button>
    `;

    this.container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-4", "opacity-0");
      toast.classList.add("translate-y-0", "opacity-100");
    });

    // Auto dismiss
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};
