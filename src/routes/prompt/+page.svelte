<script>
  const prompts = [
    "Apa hal kecil yang bisa kamu maafkan hari ini (baik pada diri sendiri atau orang lain)?",
    "Apakah kamu hari ini menilai atau mencoba memahami orang lain?",
    "Satu hal apa yang kamu syukuri hari ini, sekecil apapun itu?",
    "Apa satu hal yang kamu pelajari tentang dirimu sendiri hari ini?",
    "Kapan kamu merasa paling 'hadir' atau 'mindful' hari ini?",
    "Apa satu batasan (boundary) yang berhasil kamu jaga hari ini?",
    "Jika kamu bisa mengulang satu interaksi hari ini, apa yang akan kamu lakukan secara berbeda?",
  ];

  let currentIndex = $state(Math.floor(Math.random() * prompts.length));
  let currentPrompt = $derived(prompts[currentIndex]);
  let isTransitioning = $state(false);

  function generateNewPrompt() {
    isTransitioning = true;
    setTimeout(() => {
      let next;
      do {
        next = Math.floor(Math.random() * prompts.length);
      } while (next === currentIndex && prompts.length > 1);
      currentIndex = next;
      isTransitioning = false;
    }, 300);
  }
</script>

<svelte:head><title>Daily Prompt - Reflectify</title></svelte:head>

<!-- Page Header -->
<div class="page-header animate-slide-up">
  <div class="page-header-row">
    <div class="icon-badge icon-badge-amber">
      <ion-icon name="sparkles-outline" class="text-xl text-white"></ion-icon>
    </div>
    <div>
      <h2 class="page-header-title">Daily Prompt</h2>
      <p class="page-header-subtitle">
        Pertanyaan refleksi untuk melatih kesadaran diri
      </p>
    </div>
    <div class="page-header-actions">
      <div class="stat-pill">
        <ion-icon name="help-circle-outline" class="text-sm"></ion-icon>
        Prompt #{currentIndex + 1} dari {prompts.length}
      </div>
    </div>
  </div>
</div>

<!-- Prompt Display Card -->
<div
  class="section-card text-center animate-slide-up delay-1"
  style="box-shadow: var(--shadow-glow);"
>
  <div class="bg-orb bg-orb-1" style="opacity:0.15;"></div>
  <div class="bg-orb bg-orb-2" style="opacity:0.1;"></div>

  <!-- Floating sparkle -->
  <div class="flex justify-center mb-6">
    <div
      class="w-14 h-14 rounded-2xl flex items-center justify-center animate-float"
      style="background: linear-gradient(135deg, rgba(129,140,248,0.15), rgba(168,85,247,0.15)); border: 1px solid rgba(129,140,248,0.1);"
    >
      <ion-icon
        name="sparkles"
        class="text-2xl"
        style="color: var(--accent-primary);"
      ></ion-icon>
    </div>
  </div>

  <!-- Quote marks + prompt -->
  <div class="relative max-w-2xl mx-auto py-4">
    <span class="quote-mark absolute -top-4 left-0">"</span>
    <p
      class="text-xl md:text-2xl font-semibold leading-relaxed px-8 transition-all duration-300"
      style="color: var(--text-secondary); opacity: {isTransitioning
        ? 0
        : 1}; transform: translateY({isTransitioning
        ? '10px'
        : '0'}); font-family: 'Plus Jakarta Sans', sans-serif;"
    >
      {currentPrompt}
    </p>
    <span class="quote-mark absolute -bottom-10 right-0">"</span>
  </div>

  <!-- Accent line -->
  <div
    class="w-20 h-1 mx-auto mt-12 mb-8 rounded-full"
    style="background: linear-gradient(90deg, var(--accent-primary), rgba(168,85,247,0.8));"
  ></div>

  <button
    onclick={generateNewPrompt}
    class="btn-ghost inline-flex items-center gap-2 text-sm"
    style="color: var(--accent-primary); border-color: rgba(129,140,248,0.3);"
  >
    <ion-icon name="refresh-outline" class="text-lg"></ion-icon>
    Ganti Pertanyaan
  </button>
</div>
