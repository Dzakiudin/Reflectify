<script>
  import { onMount, onDestroy } from "svelte";
  import Modal from "$lib/components/Modal.svelte";
  import Toast from "$lib/components/Toast.svelte";

  let { data } = $props();
  let supabase = $derived(data.supabase);
  let user = $derived(data.user);

  let journals = $state([]);
  let loadingJournals = $state(true);
  let category = $state("Mindset");
  let content = $state("");

  let showEditModal = $state(false);
  let editId = $state("");
  let editCategory = $state("Mindset");
  let editContent = $state("");

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
    await loadJournals();
    setupRealtime();
  });
  onDestroy(() => {
    if (channel) supabase.removeChannel(channel);
  });

  function setupRealtime() {
    channel = supabase
      .channel("journal-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "journal_entries",
          filter: `user_id=eq.${user.id}`,
        },
        () => loadJournals(),
      )
      .subscribe();
  }

  async function loadJournals() {
    loadingJournals = true;
    const { data: rows, error } = await supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else journals = rows ?? [];
    loadingJournals = false;
  }

  async function saveJournal() {
    const trimmed = content.trim();
    if (!trimmed) return;
    const { error } = await supabase
      .from("journal_entries")
      .insert({ user_id: user.id, content: trimmed, category });
    if (error) showToast("Gagal menyimpan jurnal.", "error");
    else {
      showToast("Jurnal disimpan!");
      content = "";
      await loadJournals();
    }
  }

  function openEditModal(journal) {
    editId = journal.id;
    editCategory = journal.category;
    editContent = journal.content;
    showEditModal = true;
  }

  async function saveEditJournal() {
    const trimmed = editContent.trim();
    if (!trimmed) {
      showToast("Konten jurnal tidak boleh kosong.", "error");
      return;
    }
    const { error } = await supabase
      .from("journal_entries")
      .update({ content: trimmed, category: editCategory })
      .eq("id", editId);
    if (error) showToast("Gagal menyimpan perubahan.", "error");
    else {
      showToast("Perubahan disimpan!");
      showEditModal = false;
      await loadJournals();
    }
  }

  async function deleteJournal() {
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", editId);
    if (error) showToast("Gagal menghapus.", "error");
    else {
      showToast("Entri berhasil dihapus.");
      showEditModal = false;
      await loadJournals();
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const categories = ["Mindset", "Emosi", "Spiritual", "Sosial", "Skill"];

  function getBadgeClass(cat) {
    const map = {
      Mindset: "badge-mindset",
      Emosi: "badge-emosi",
      Spiritual: "badge-spiritual",
      Sosial: "badge-sosial",
      Skill: "badge-skill",
    };
    return map[cat] || "badge-mindset";
  }
</script>

<svelte:head><title>Insight Journal - Reflectify</title></svelte:head>
<Toast message={toastMessage} type={toastType} visible={toastVisible} />

<!-- Page Header -->
<div class="page-header animate-slide-up">
  <div class="page-header-row">
    <div class="icon-badge icon-badge-purple">
      <ion-icon name="book-outline" class="text-xl text-white"></ion-icon>
    </div>
    <div>
      <h2 class="page-header-title">Insight Journal</h2>
      <p class="page-header-subtitle">Tulis refleksi dan pelajaran harianmu</p>
    </div>
    <div class="page-header-actions">
      <div class="stat-pill">
        <ion-icon
          name="document-text"
          class="text-sm"
          style="color: var(--accent-primary);"
        ></ion-icon>
        {journals.length} Jurnal
      </div>
    </div>
  </div>
</div>

<!-- Two Column Layout -->
<div class="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-slide-up delay-1">
  <!-- Compose Card -->
  <div class="lg:col-span-2 section-card">
    <h3 class="section-card-title mb-5">
      <ion-icon
        name="create-outline"
        class="text-lg"
        style="color: var(--accent-primary);"
      ></ion-icon>
      Tulis Refleksi
    </h3>

    <!-- Pill Category Selector -->
    <div class="mb-5">
      <span
        class="text-xs font-semibold uppercase tracking-wider block mb-3"
        style="color: var(--text-muted);">Kategori</span
      >
      <div class="pill-selector">
        {#each categories as cat}
          <button
            class="pill-option {category === cat ? 'active' : ''}"
            onclick={() => (category = cat)}
          >
            {cat}
          </button>
        {/each}
      </div>
    </div>

    <div class="mb-5">
      <textarea
        id="journal-entry"
        rows="6"
        bind:value={content}
        class="input-dark resize-none"
        placeholder="Apa yang kamu pelajari hari ini?"
      ></textarea>
    </div>
    <button
      onclick={saveJournal}
      class="btn-primary w-full flex items-center justify-center gap-2 text-sm"
    >
      <ion-icon name="save-outline" class="text-lg"></ion-icon>
      Simpan Jurnal
    </button>
  </div>

  <!-- Journal List Card -->
  <div class="lg:col-span-3 section-card">
    <div class="bg-orb bg-orb-1" style="opacity:0.12;"></div>
    <h3 class="section-card-title mb-5">
      <ion-icon
        name="library-outline"
        class="text-lg"
        style="color: var(--accent-primary);"
      ></ion-icon>
      Jurnal Tersimpan
    </h3>

    <div class="space-y-3">
      {#if loadingJournals}
        {#each [1, 2] as _}
          <div class="skeleton h-24"></div>
        {/each}
      {:else if journals.length === 0}
        <div class="text-center py-16" style="color: var(--text-muted);">
          <div
            class="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style="background: var(--bg-surface); border: 1px solid var(--border-color);"
          >
            <ion-icon name="book-outline" class="text-3xl opacity-40"
            ></ion-icon>
          </div>
          <p class="text-sm font-medium">Belum ada jurnal tersimpan</p>
          <p class="text-xs mt-1">Tulis refleksimu di sebelah kiri</p>
        </div>
      {:else}
        {#each journals as journal, i (journal.id)}
          <button
            onclick={() => openEditModal(journal)}
            class="journal-card p-4 rounded-xl w-full text-left animate-slide-up"
            data-category={journal.category}
            style="background: var(--bg-surface); border: 1px solid var(--border-color); animation-delay: {i *
              0.04}s;"
          >
            <div class="flex justify-between items-center mb-2">
              <span class="badge {getBadgeClass(journal.category)}"
                >{journal.category}</span
              >
              <span class="text-xs" style="color: var(--text-muted);"
                >{formatDate(journal.created_at)}</span
              >
            </div>
            <p
              class="text-sm whitespace-pre-line leading-relaxed line-clamp-3"
              style="color: var(--text-secondary);"
            >
              {journal.content}
            </p>
          </button>
        {/each}
      {/if}
    </div>
  </div>
</div>

<!-- Edit Modal -->
<Modal bind:show={showEditModal} title="Edit Jurnal">
  {#snippet children()}
    <div class="space-y-4">
      <div>
        <label
          for="edit-journal-category"
          class="block text-sm font-medium mb-2"
          style="color: var(--text-secondary);">Kategori</label
        >
        <div class="pill-selector">
          {#each categories as cat}
            <button
              class="pill-option {editCategory === cat ? 'active' : ''}"
              onclick={() => (editCategory = cat)}>{cat}</button
            >
          {/each}
        </div>
      </div>
      <div>
        <label
          for="edit-journal-content"
          class="block text-sm font-medium mb-2"
          style="color: var(--text-secondary);">Konten Jurnal</label
        >
        <textarea
          id="edit-journal-content"
          rows="6"
          bind:value={editContent}
          class="input-dark resize-none"
        ></textarea>
      </div>
    </div>
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-6"
    >
      <button
        onclick={deleteJournal}
        class="btn-danger flex items-center justify-center gap-2 text-sm"
      >
        <ion-icon name="trash-outline"></ion-icon> Hapus
      </button>
      <div class="flex gap-3">
        <button
          onclick={() => (showEditModal = false)}
          class="btn-ghost text-sm">Batal</button
        >
        <button onclick={saveEditJournal} class="btn-primary text-sm"
          >Simpan</button
        >
      </div>
    </div>
  {/snippet}
</Modal>
