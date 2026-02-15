<script>
  let { value = $bindable(0), onchange } = $props();

  function setRating(n) {
    value = n;
    if (onchange) onchange(n);
  }
</script>

<div class="flex items-center gap-1">
  {#each [1, 2, 3, 4, 5] as n}
    <button
      onclick={() => setRating(n)}
      class="star-btn text-2xl transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
      style="color: {n <= value
        ? 'var(--accent-warm-bright)'
        : 'var(--text-muted)'}; filter: {n <= value
        ? 'drop-shadow(0 0 6px rgba(251,191,36,0.5))'
        : 'none'};"
      aria-label="Rating {n} dari 5"
    >
      <ion-icon name={n <= value ? "star" : "star-outline"}></ion-icon>
    </button>
  {/each}
</div>
