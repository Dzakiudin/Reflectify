<script>
  let { data } = $props();
  let messages = $state([
    {
      text: "Halo! Saya di sini untuk membantu Anda berefleksi. Apa yang ada di pikiran Anda?",
      isUser: false,
    },
  ]);
  let inputText = $state("");
  let isLoading = $state(false);
  let chatBox;

  function scrollToBottom() {
    if (chatBox)
      setTimeout(() => {
        chatBox.scrollTop = chatBox.scrollHeight;
      }, 50);
  }

  async function handleSend() {
    const prompt = inputText.trim();
    if (!prompt || isLoading) return;
    messages = [...messages, { text: prompt, isUser: true }];
    inputText = "";
    isLoading = true;
    scrollToBottom();
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const result = await response.json();
      messages = [...messages, { text: result.response, isUser: false }];
    } catch {
      messages = [
        ...messages,
        {
          text: "Maaf, terjadi masalah koneksi. Coba beberapa saat lagi.",
          isUser: false,
        },
      ];
    }
    isLoading = false;
    scrollToBottom();
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
</script>

<svelte:head><title>AI Companion - Reflectify</title></svelte:head>

<!-- Page Header -->
<div class="page-header animate-slide-up">
  <div class="page-header-row">
    <div class="icon-badge icon-badge-rose">
      <ion-icon name="chatbubble-ellipses-outline" class="text-xl text-white"
      ></ion-icon>
    </div>
    <div>
      <h2 class="page-header-title">AI Companion</h2>
      <p class="page-header-subtitle flex items-center gap-2">
        <span class="status-dot-online"></span>
        Guru batin mini Anda · Selalu siap mendengar
      </p>
    </div>
  </div>
</div>

<!-- Chat Section -->
<div
  class="section-card animate-slide-up delay-1"
  style="padding: 0; overflow: hidden;"
>
  <!-- Chat Box -->
  <div
    bind:this={chatBox}
    class="p-5 overflow-y-auto space-y-4"
    style="height: 26rem; background: rgba(0,0,0,0.12);"
  >
    {#each messages as msg, i}
      {#if msg.isUser}
        <div class="chat-bubble-user" style="animation-delay: {i * 0.03}s;">
          <p class="whitespace-pre-line">{msg.text}</p>
        </div>
      {:else}
        <div
          class="flex items-end gap-2.5"
          style="animation: slideUp 0.3s var(--ease) both; animation-delay: {i *
            0.03}s;"
        >
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style="background: linear-gradient(135deg, rgba(129,140,248,0.2), rgba(168,85,247,0.2)); border: 1px solid rgba(129,140,248,0.1);"
          >
            <ion-icon
              name="sparkles"
              class="text-xs"
              style="color: var(--accent-primary);"
            ></ion-icon>
          </div>
          <div class="chat-bubble-ai">
            <p class="whitespace-pre-line">{msg.text}</p>
          </div>
        </div>
      {/if}
    {/each}

    {#if isLoading}
      <div class="flex items-end gap-2.5">
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style="background: linear-gradient(135deg, rgba(129,140,248,0.2), rgba(168,85,247,0.2)); border: 1px solid rgba(129,140,248,0.1);"
        >
          <ion-icon
            name="sparkles"
            class="text-xs"
            style="color: var(--accent-primary);"
          ></ion-icon>
        </div>
        <div class="chat-bubble-ai flex items-center gap-1.5">
          <span
            class="inline-block w-2 h-2 rounded-full"
            style="background: var(--accent-primary); animation: typing 1.4s infinite 0s;"
          ></span>
          <span
            class="inline-block w-2 h-2 rounded-full"
            style="background: var(--accent-primary); animation: typing 1.4s infinite 0.2s;"
          ></span>
          <span
            class="inline-block w-2 h-2 rounded-full"
            style="background: var(--accent-primary); animation: typing 1.4s infinite 0.4s;"
          ></span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Input Bar -->
  <div class="p-4" style="border-top: 1px solid var(--border-color);">
    <div class="chat-input-bar">
      <input
        type="text"
        bind:value={inputText}
        onkeydown={handleKeydown}
        disabled={isLoading}
        placeholder="Tulis pesanmu..."
      />
      <button
        onclick={handleSend}
        disabled={isLoading}
        aria-label="Kirim pesan"
      >
        <ion-icon name="send-outline" class="text-lg"></ion-icon>
      </button>
    </div>
  </div>
</div>
