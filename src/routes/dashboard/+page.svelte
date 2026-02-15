<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  let { data } = $props();
  let supabase = $derived(data.supabase);
  let user = $derived(data.user);
  let chartCanvas;
  let chartInstance = null;
  let avgMood = $state("—");
  let avgFocus = $state("—");
  let activeDays = $state(0);

  function getLast7Days() {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push({
        label: days[d.getDay()],
        dateString: d.toISOString().split("T")[0],
      });
    }
    return result;
  }

  async function renderChart() {
    if (!browser || !chartCanvas) return;
    const Chart = (await import("chart.js/auto")).default;
    const last7Days = getLast7Days();
    const dateStrings = last7Days.map((d) => d.dateString);
    const labels = last7Days.map((d) => d.label);
    const { data: ratings, error } = await supabase
      .from("daily_ratings")
      .select("*")
      .in("date", dateStrings)
      .eq("user_id", user.id);
    if (error) return;
    const ratingsMap = new Map();
    (ratings ?? []).forEach((r) => ratingsMap.set(r.date, r));
    const moodData = dateStrings.map((d) => ratingsMap.get(d)?.mood ?? null);
    const focusData = dateStrings.map((d) => ratingsMap.get(d)?.focus ?? null);
    const validMoods = moodData.filter((v) => v !== null);
    const validFocus = focusData.filter((v) => v !== null);
    avgMood = validMoods.length
      ? (validMoods.reduce((a, b) => a + b, 0) / validMoods.length).toFixed(1)
      : "—";
    avgFocus = validFocus.length
      ? (validFocus.reduce((a, b) => a + b, 0) / validFocus.length).toFixed(1)
      : "—";
    activeDays = ratingsMap.size;
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(chartCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Mood",
            data: moodData,
            borderColor: "#818CF8",
            backgroundColor: "rgba(129,140,248,0.08)",
            tension: 0.4,
            fill: true,
            spanGaps: true,
            pointBackgroundColor: "#818CF8",
            pointBorderColor: "#0B0F1A",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            borderWidth: 2.5,
          },
          {
            label: "Fokus",
            data: focusData,
            borderColor: "#34D399",
            backgroundColor: "rgba(52,211,153,0.08)",
            tension: 0.4,
            fill: true,
            spanGaps: true,
            pointBackgroundColor: "#34D399",
            pointBorderColor: "#0B0F1A",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            borderWidth: 2.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#94A3B8",
              font: { family: "Plus Jakarta Sans", size: 13, weight: "600" },
              padding: 20,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            backgroundColor: "rgba(15,20,35,0.97)",
            titleColor: "#F1F5F9",
            bodyColor: "#94A3B8",
            borderColor: "rgba(255,255,255,0.08)",
            borderWidth: 1,
            cornerRadius: 12,
            padding: 14,
            titleFont: { family: "Plus Jakarta Sans", weight: "700" },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            ticks: { stepSize: 1, color: "#475569", font: { size: 12 } },
            grid: { color: "rgba(255,255,255,0.04)" },
            border: { display: false },
          },
          x: {
            ticks: { color: "#475569", font: { size: 12 } },
            grid: { display: false },
            border: { display: false },
          },
        },
        interaction: { intersect: false, mode: "index" },
        animation: { duration: 1000, easing: "easeOutQuart" },
      },
    });
  }
  onMount(() => {
    renderChart();
  });
</script>

<svelte:head><title>Growth Dashboard - Reflectify</title></svelte:head>

<div class="page-header animate-slide-up">
  <div class="page-header-row">
    <div class="icon-badge icon-badge-indigo">
      <ion-icon name="stats-chart-outline" class="text-xl text-white"
      ></ion-icon>
    </div>
    <div>
      <h2 class="page-header-title">Growth Dashboard</h2>
      <p class="page-header-subtitle">Pantau tren mood dan fokus harian Anda</p>
    </div>
    <div class="page-header-actions">
      <div class="stat-pill">
        <ion-icon name="calendar-outline" class="text-sm"></ion-icon>
        7 hari terakhir
      </div>
    </div>
  </div>
</div>

<div class="grid grid-cols-3 gap-4 mb-6 animate-slide-up delay-1">
  <div class="stat-card">
    <div class="flex items-center gap-2 mb-2">
      <div
        class="w-6 h-6 rounded-md flex items-center justify-center"
        style="background:rgba(129,140,248,0.15);"
      >
        <ion-icon
          name="happy-outline"
          class="text-sm"
          style="color:var(--accent-primary);"
        ></ion-icon>
      </div>
    </div>
    <p class="stat-card-value">{avgMood}</p>
    <p class="stat-card-label">Avg Mood</p>
  </div>
  <div class="stat-card">
    <div class="flex items-center gap-2 mb-2">
      <div
        class="w-6 h-6 rounded-md flex items-center justify-center"
        style="background:rgba(52,211,153,0.15);"
      >
        <ion-icon
          name="eye-outline"
          class="text-sm"
          style="color:var(--accent-success);"
        ></ion-icon>
      </div>
    </div>
    <p class="stat-card-value">{avgFocus}</p>
    <p class="stat-card-label">Avg Focus</p>
  </div>
  <div class="stat-card">
    <div class="flex items-center gap-2 mb-2">
      <div
        class="w-6 h-6 rounded-md flex items-center justify-center"
        style="background:rgba(251,191,36,0.15);"
      >
        <ion-icon
          name="flame-outline"
          class="text-sm"
          style="color:var(--accent-warm);"
        ></ion-icon>
      </div>
    </div>
    <p class="stat-card-value">
      {activeDays}<span
        class="text-base font-medium"
        style="color:var(--text-muted);">/7</span
      >
    </p>
    <p class="stat-card-label">Active Days</p>
  </div>
</div>

<div class="section-card animate-slide-up delay-2">
  <div class="bg-orb bg-orb-1" style="opacity:0.12;"></div>
  <h3 class="section-card-title mb-6">
    <ion-icon
      name="trending-up-outline"
      class="text-lg"
      style="color:var(--accent-primary);"
    ></ion-icon>
    Korelasi Mood & Fokus
  </h3>
  <div class="w-full h-80 md:h-96">
    <canvas bind:this={chartCanvas}></canvas>
  </div>
</div>
