<script>
  let { message = "", type = "success", visible = false } = $props();
</script>

{#if visible}
  <div class="fixed top-6 right-6 z-50 animate-slide-right" role="alert">
    <div
      class="glass-card flex items-center gap-3 px-5 py-4 min-w-[300px] max-w-md
      {type === 'success'
        ? 'border-l-4 !border-l-emerald-400'
        : 'border-l-4 !border-l-red-400'}"
    >
      <ion-icon
        name={type === "success" ? "checkmark-circle" : "alert-circle"}
        class="text-xl flex-shrink-0 {type === 'success'
          ? 'text-emerald-400'
          : 'text-red-400'}"
      ></ion-icon>
      <p class="text-sm font-medium text-slate-200">{message}</p>
    </div>
  </div>
{/if}
