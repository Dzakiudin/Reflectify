<script>
  import { onMount, onDestroy } from "svelte";
  import Modal from "$lib/components/Modal.svelte";
  import StarRating from "$lib/components/StarRating.svelte";
  import Toast from "$lib/components/Toast.svelte";

  let { data } = $props();
  let supabase = $derived(data.supabase);
  let user = $derived(data.user);

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const todayFormatted = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let activities = $state([]);
  let loadingActivities = $state(true);
  let activityError = $state("");
  let moodRating = $state(0);
  let focusRating = $state(0);

  let showAddModal = $state(false);
  let showEditModal = $state(false);
  let newActivityName = $state("");
  let editId = $state("");
  let editName = $state("");

  let toastMessage = $state("");
  let toastType = $state("success");
  let toastVisible = $state(false);
  function showToast(msg, type = "success") {
    toastVisible = false;
    setTimeout(() => {
      toastMessage = msg;
      toastType = type;
      toastVisible = true;
    }, 50);
  }

  let channel;
  onMount(async () => {
    await loadActivities();
    await loadRatings();
    setupRealtime();
  });
  onDestroy(() => {
    if (channel) supabase.removeChannel(channel);
  });

  function setupRealtime() {
    channel = supabase
      .channel("activities-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activities",
          filter: `user_id=eq.${user.id}`,
        },
        () => loadActivities(),
      )
      .subscribe();
  }

  async function loadActivities() {
    loadingActivities = true;
    const { data: rows, error } = await supabase
      .from("activities")
      .select("*")
      .eq("date", todayString)
      .order("created_at", { ascending: false });
    if (error) {
      activityError = "Error memuat aktivitas.";
    } else {
      activities = rows ?? [];
    }
    loadingActivities = false;
  }

  async function loadRatings() {
    const { data: row } = await supabase
      .from("daily_ratings")
      .select("*")
      .eq("date", todayString)
      .eq("user_id", user.id)
      .maybeSingle();
    if (row) {
      moodRating = row.mood;
      focusRating = row.focus;
    }
  }

  async function saveNewActivity() {
    const name = newActivityName.trim();
    if (!name) return;
    const { error } = await supabase
      .from("activities")
      .insert({ user_id: user.id, name, date: todayString });
    if (error) {
      showToast("Gagal menyimpan aktivitas.", "error");
    } else {
      showToast("Aktivitas baru disimpan!");
      newActivityName = "";
      showAddModal = false;
      await loadActivities();
    }
  }

  function openEditModal(activity) {
    editId = activity.id;
    editName = activity.name;
    showEditModal = true;
  }

  async function saveEditActivity() {
    const name = editName.trim();
    if (!name) {
      showToast("Nama aktivitas tidak boleh kosong.", "error");
      return;
    }
    const { error } = await supabase
      .from("activities")
      .update({ name })
      .eq("id", editId);
    if (error) {
      showToast("Gagal menyimpan perubahan.", "error");
    } else {
      showToast("Perubahan disimpan!");
      showEditModal = false;
      await loadActivities();
    }
  }

  async function deleteActivity() {
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", editId);
    if (error) {
      showToast("Gagal menghapus.", "error");
    } else {
      showToast("Entri berhasil dihapus.");
      showEditModal = false;
      await loadActivities();
    }
  }

  async function saveRating() {
    if (!moodRating || !focusRating) {
      showToast("Harap pilih rating bintang 1-5", "error");
      return;
    }
    const { error } = await supabase.from("daily_ratings").upsert(
      {
        user_id: user.id,
        date: todayString,
        mood: moodRating,
        focus: focusRating,
      },
      { onConflict: "user_id,date" },
    );
    if (error) {
      showToast("Gagal menyimpan rating.", "error");
    } else {
      showToast("Rating harian disimpan!");
    }
  }

  const moodEmoji = $derived(
    ["", "😞", "😐", "🙂", "😊", "🤩"][moodRating] || "",
  );
  const focusEmoji = $derived(
    ["", "🌧️", "☁️", "⛅", "🌤️", "☀️"][focusRating] || "",
  );
</script>

<svelte:head><title>Tracker Harian - Reflectify</title></svelte:head>
<Toast message={toastMessage} type={toastType} visible={toastVisible} />

<!-- Page Header -->
<div class="page-header animate-slide-up">
  <div class="page-header-row">
    <div class="icon-badge icon-badge-green">
      <ion-icon name="checkbox-outline" class="text-xl text-white"></ion-icon>
    </div>
    <div>
      <h2 class="page-header-title">Tracker Harian</h2>
      <p class="page-header-subtitle">{todayFormatted}</p>
    </div>
    <div class="page-header-actions">
      <div class="stat-pill">
        <ion-icon
          name="checkmark-circle"
          class="text-sm"
          style="color: var(--accent-success);"
        ></ion-icon>
        {activities.length} Aktivitas
      </div>
      <button
        onclick={() => (showAddModal = true)}
        class="btn-primary flex items-center gap-2 text-sm"
      >
        <ion-icon name="add-outline" class="text-lg"></ion-icon>
        Tambah
      </button>
    </div>
  </div>
</div>

<!-- Two Column Layout -->
<div class="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-slide-up delay-1">
  <!-- Activities Card (wider) -->
  <div class="lg:col-span-3 section-card">
    <div class="bg-orb bg-orb-1" style="opacity:0.15;"></div>
    <h3 class="section-card-title mb-5">
      <ion-icon
        name="list-outline"
        class="text-lg"
        style="color: var(--accent-success);"
      ></ion-icon>
      Aktivitas Hari Ini
    </h3>

    <div class="space-y-2.5">
      {#if loadingActivities}
        {#each [1, 2, 3] as _}
          <div class="skeleton h-14"></div>
        {/each}
      {:else if activityError}
        <div
          class="flex items-center gap-2 p-4 rounded-lg"
          style="background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.15);"
        >
          <ion-icon name="alert-circle" class="text-red-400"></ion-icon>
          <p class="text-sm text-red-400">{activityError}</p>
        </div>
      {:else if activities.length === 0}
        <div class="text-center py-16" style="color: var(--text-muted);">
          <div
            class="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style="background: var(--bg-surface); border: 1px solid var(--border-color);"
          >
            <ion-icon name="add-circle-outline" class="text-3xl opacity-40"
            ></ion-icon>
          </div>
          <p class="text-sm font-medium">Belum ada aktivitas hari ini</p>
          <p class="text-xs mt-1">Klik "Tambah" untuk memulai</p>
        </div>
      {:else}
        {#each activities as activity, i (activity.id)}
          <button
            onclick={() => openEditModal(activity)}
            class="flex items-center p-4 rounded-xl w-full text-left transition-all duration-200 animate-slide-up"
            style="background: rgba(52,211,153,0.05); border: 1px solid rgba(52,211,153,0.1); animation-delay: {i *
              0.04}s;"
            onmouseenter={(e) => {
              e.currentTarget.style.background = "rgba(52,211,153,0.1)";
              e.currentTarget.style.borderColor = "rgba(52,211,153,0.2)";
            }}
            onmouseleave={(e) => {
              e.currentTarget.style.background = "rgba(52,211,153,0.05)";
              e.currentTarget.style.borderColor = "rgba(52,211,153,0.1)";
            }}
          >
            <div
              class="flex items-center justify-center w-8 h-8 rounded-lg mr-4 flex-shrink-0"
              style="background: rgba(52,211,153,0.15);"
            >
              <span
                class="text-sm font-bold"
                style="color: var(--accent-success);">{i + 1}</span
              >
            </div>
            <span
              class="font-medium text-sm"
              style="color: var(--text-primary);">{activity.name}</span
            >
            <ion-icon
              name="chevron-forward-outline"
              class="ml-auto text-lg"
              style="color: var(--text-muted);"
            ></ion-icon>
          </button>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Rating Card (narrower) -->
  <div class="lg:col-span-2 section-card">
    <h3 class="section-card-title mb-5">
      <ion-icon
        name="star-outline"
        class="text-lg"
        style="color: var(--accent-warm);"
      ></ion-icon>
      Rating Harian
    </h3>

    <div class="space-y-6">
      <div
        class="p-4 rounded-xl"
        style="background: var(--bg-surface); border: 1px solid var(--border-color);"
      >
        <div class="flex items-center justify-between mb-3">
          <span
            class="text-sm font-semibold"
            style="color: var(--text-secondary);"
          >
            <ion-icon name="happy-outline" class="mr-1 align-middle"></ion-icon>
            Mood
          </span>
          {#if moodEmoji}
            <span class="text-2xl">{moodEmoji}</span>
          {/if}
        </div>
        <StarRating bind:value={moodRating} />
      </div>

      <div
        class="p-4 rounded-xl"
        style="background: var(--bg-surface); border: 1px solid var(--border-color);"
      >
        <div class="flex items-center justify-between mb-3">
          <span
            class="text-sm font-semibold"
            style="color: var(--text-secondary);"
          >
            <ion-icon name="eye-outline" class="mr-1 align-middle"></ion-icon>
            Fokus
          </span>
          {#if focusEmoji}
            <span class="text-2xl">{focusEmoji}</span>
          {/if}
        </div>
        <StarRating bind:value={focusRating} />
      </div>

      <button
        onclick={saveRating}
        class="btn-primary w-full flex items-center justify-center gap-2 text-sm"
      >
        <ion-icon name="save-outline" class="text-lg"></ion-icon>
        Simpan Rating
      </button>
    </div>
  </div>
</div>

<!-- Add Modal -->
<Modal bind:show={showAddModal} title="Tambah Aktivitas Baru">
  {#snippet children()}
    <div class="mb-6">
      <label
        for="activity-name"
        class="block text-sm font-medium mb-2"
        style="color: var(--text-secondary);">Nama Aktivitas</label
      >
      <input
        type="text"
        id="activity-name"
        bind:value={newActivityName}
        class="input-dark"
        placeholder="Contoh: Olahraga 30 menit"
        onkeydown={(e) => e.key === "Enter" && saveNewActivity()}
      />
    </div>
    <div class="flex justify-end gap-3">
      <button onclick={() => (showAddModal = false)} class="btn-ghost text-sm"
        >Batal</button
      >
      <button onclick={saveNewActivity} class="btn-primary text-sm"
        >Simpan</button
      >
    </div>
  {/snippet}
</Modal>

<!-- Edit Modal -->
<Modal bind:show={showEditModal} title="Edit Aktivitas">
  {#snippet children()}
    <div class="mb-6">
      <label
        for="edit-activity-name"
        class="block text-sm font-medium mb-2"
        style="color: var(--text-secondary);">Nama Aktivitas</label
      >
      <input
        type="text"
        id="edit-activity-name"
        bind:value={editName}
        class="input-dark"
        onkeydown={(e) => e.key === "Enter" && saveEditActivity()}
      />
    </div>
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
    >
      <button
        onclick={deleteActivity}
        class="btn-danger flex items-center justify-center gap-2 text-sm"
      >
        <ion-icon name="trash-outline"></ion-icon> Hapus
      </button>
      <div class="flex gap-3">
        <button
          onclick={() => (showEditModal = false)}
          class="btn-ghost text-sm">Batal</button
        >
        <button onclick={saveEditActivity} class="btn-primary text-sm"
          >Simpan</button
        >
      </div>
    </div>
  {/snippet}
</Modal>
