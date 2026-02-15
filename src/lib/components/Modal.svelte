<script>
  let { show = $bindable(false), title = "", children } = $props();
</script>

{#if show}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
  >
    <!-- Overlay -->
    <button
      class="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in cursor-default"
      onclick={() => (show = false)}
      aria-label="Close"
      tabindex="-1"
    ></button>

    <!-- Modal Card -->
    <div
      class="relative w-full max-w-lg glass-card-glow p-6 md:p-8 animate-scale-in"
      style="background: rgba(15,20,35,0.95); border: 1px solid var(--border-color-hover);"
    >
      {#if title}
        <h3
          class="text-xl font-bold mb-6"
          style="font-family: 'Plus Jakarta Sans', sans-serif;"
        >
          {title}
        </h3>
      {/if}
      {@render children()}
    </div>
  </div>
{/if}
