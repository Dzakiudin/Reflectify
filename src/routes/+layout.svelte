<script>
  import { onMount } from "svelte";
  import { goto, invalidate } from "$app/navigation";
  import { page } from "$app/state";
  import Toast from "$lib/components/Toast.svelte";
  import "../app.css";

  let { data, children } = $props();

  let supabase = $derived(data.supabase);
  let session = $derived(data.session);
  let user = $derived(data.user);

  let authEmail = $state("");
  let authPassword = $state("");
  let authError = $state("");
  let isAuthLoading = $state(false);

  let toastMessage = $state("");
  let toastType = $state("success");
  let toastVisible = $state(false);

  let currentTab = $state("tracker");
  let sidebarCollapsed = $state(false);
  let profileDropdownOpen = $state(false);

  const navItems = [
    {
      id: "tracker",
      label: "Tracker Harian",
      icon: "checkbox-outline",
      path: "/tracker",
    },
    {
      id: "journal",
      label: "Insight Journal",
      icon: "book-outline",
      path: "/journal",
    },
    {
      id: "dashboard",
      label: "Growth Dashboard",
      icon: "stats-chart-outline",
      path: "/dashboard",
    },
    {
      id: "prompt",
      label: "Daily Prompt",
      icon: "sparkles-outline",
      path: "/prompt",
    },
    {
      id: "ai",
      label: "AI Companion",
      icon: "chatbubble-ellipses-outline",
      path: "/ai",
    },
  ];

  function showToast(message, type = "success") {
    toastVisible = false;
    setTimeout(() => {
      toastMessage = message;
      toastType = type;
      toastVisible = true;
    }, 50);
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Selamat Pagi";
    if (h < 17) return "Selamat Siang";
    return "Selamat Malam";
  }

  function getUserInitials(email) {
    if (!email) return "?";
    return email.charAt(0).toUpperCase();
  }

  $effect(() => {
    const path = page.url?.pathname;
    if (path) {
      const match = navItems.find((item) => path.startsWith(item.path));
      if (match) currentTab = match.id;
    }
  });

  onMount(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== session?.expires_at)
        invalidate("supabase:auth");
    });
    return () => subscription.unsubscribe();
  });

  async function handleLogin() {
    authError = "";
    if (!authEmail || !authPassword) {
      authError = "Email dan password tidak boleh kosong.";
      return;
    }
    isAuthLoading = true;
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    isAuthLoading = false;
    if (error) {
      authError =
        error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : "Gagal login. Coba lagi.";
    } else {
      goto("/tracker");
    }
  }

  async function handleRegister() {
    authError = "";
    if (authPassword.length < 6) {
      authError = "Password minimal harus 6 karakter.";
      return;
    }
    isAuthLoading = true;
    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
    });
    isAuthLoading = false;
    if (error) {
      authError = error.message.includes("already registered")
        ? "Email ini sudah terdaftar. Silakan login."
        : "Gagal mendaftar. Coba lagi.";
    } else {
      showToast("Registrasi berhasil! Silakan cek email untuk verifikasi.");
      goto("/tracker");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    goto("/");
  }
  function navigateTo(item) {
    currentTab = item.id;
    goto(item.path);
  }
</script>

<svelte:head>
  <title>Reflectify - Track & Reflect</title>
</svelte:head>

<Toast message={toastMessage} type={toastType} visible={toastVisible} />

{#if !session}
  <!-- ===== AUTH PAGE — SPLIT LAYOUT ===== -->
  <div
    class="min-h-screen flex flex-col lg:flex-row"
    style="background: var(--bg-deep);"
  >
    <!-- Left Branding Panel (desktop only) -->
    <div
      class="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-center items-center p-16"
      style="background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.04) 100%);"
    >
      <!-- Orbs -->
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div
        class="bg-orb"
        style="width:160px;height:160px;background:rgba(52,211,153,0.06);top:60%;right:20%;animation:float 12s ease-in-out infinite;"
      ></div>

      <div class="relative z-10 text-center max-w-md animate-fade-in">
        <div
          class="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8 animate-float"
          style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary-dim)); box-shadow: 0 12px 40px rgba(99,102,241,0.4);"
        >
          <ion-icon name="analytics-outline" class="text-4xl text-white"
          ></ion-icon>
        </div>
        <h1
          class="text-5xl font-extrabold tracking-tight mb-4"
          style="font-family: 'Plus Jakarta Sans', sans-serif; background: linear-gradient(135deg, #fff 0%, var(--accent-primary) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;"
        >
          Reflectify
        </h1>
        <p
          class="text-lg leading-relaxed"
          style="color: var(--text-secondary);"
        >
          Lacak aktivitas, tulis refleksi harian, dan pantau pertumbuhan diri
          Anda secara mindful.
        </p>

        <!-- Feature pills -->
        <div class="flex flex-wrap justify-center gap-3 mt-10">
          {#each [{ icon: "checkbox-outline", text: "Activity Tracker" }, { icon: "book-outline", text: "Insight Journal" }, { icon: "stats-chart-outline", text: "Growth Analytics" }, { icon: "chatbubble-ellipses-outline", text: "AI Companion" }] as feat}
            <div class="stat-pill">
              <ion-icon name={feat.icon} class="text-sm"></ion-icon>
              {feat.text}
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Right Auth Form Panel -->
    <div class="flex-1 flex items-center justify-center p-6 lg:p-16 relative">
      <!-- Mobile orbs -->
      <div class="lg:hidden bg-orb bg-orb-1"></div>
      <div class="lg:hidden bg-orb bg-orb-2"></div>

      <div class="w-full max-w-md relative z-10">
        <!-- Mobile logo -->
        <div class="lg:hidden text-center mb-10 animate-slide-up">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 animate-float"
            style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary-dim)); box-shadow: 0 8px 30px rgba(99,102,241,0.4);"
          >
            <ion-icon name="analytics-outline" class="text-3xl text-white"
            ></ion-icon>
          </div>
          <h1
            class="text-3xl font-extrabold tracking-tight"
            style="font-family: 'Plus Jakarta Sans', sans-serif; background: linear-gradient(135deg, #fff 0%, var(--accent-primary) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;"
          >
            Reflectify
          </h1>
          <p class="text-sm mt-2" style="color: var(--text-muted);">
            Track & Reflect · Tumbuh setiap hari
          </p>
        </div>

        <!-- Auth Card -->
        <div
          class="section-card animate-scale-in"
          style="background: rgba(15,20,35,0.7); box-shadow: var(--shadow-glow);"
        >
          <h2
            class="text-2xl font-bold mb-2"
            style="font-family: 'Plus Jakarta Sans', sans-serif;"
          >
            Selamat Datang
          </h2>
          <p class="text-sm mb-8" style="color: var(--text-muted);">
            Masuk atau buat akun untuk memulai.
          </p>

          <div class="space-y-5">
            <div class="animate-slide-up delay-2">
              <label
                for="auth-email"
                class="block text-sm font-medium mb-2"
                style="color: var(--text-secondary);">Email</label
              >
              <input
                type="email"
                id="auth-email"
                bind:value={authEmail}
                class="input-dark"
                placeholder="nama@email.com"
                onkeydown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div class="animate-slide-up delay-3">
              <label
                for="auth-password"
                class="block text-sm font-medium mb-2"
                style="color: var(--text-secondary);">Password</label
              >
              <input
                type="password"
                id="auth-password"
                bind:value={authPassword}
                class="input-dark"
                placeholder="••••••••"
                onkeydown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {#if authError}
              <div
                class="flex items-center gap-2 p-3 rounded-lg animate-slide-down"
                style="background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2);"
              >
                <ion-icon
                  name="alert-circle"
                  class="text-red-400 text-lg flex-shrink-0"
                ></ion-icon>
                <p class="text-sm text-red-400">{authError}</p>
              </div>
            {/if}

            <div
              class="flex flex-col sm:flex-row gap-3 pt-1 animate-slide-up delay-4"
            >
              <button
                onclick={handleLogin}
                class="btn-primary flex-1 text-center"
                disabled={isAuthLoading}
              >
                {isAuthLoading ? "Memproses..." : "Login"}
              </button>
              <button
                onclick={handleRegister}
                class="btn-ghost flex-1 text-center"
                disabled={isAuthLoading}
              >
                Register
              </button>
            </div>
          </div>

          <p class="text-xs mt-8 text-center" style="color: var(--text-muted);">
            <ion-icon name="shield-checkmark-outline" class="align-middle mr-1"
            ></ion-icon>
            Data Anda terenkripsi dan aman tersimpan.
          </p>
        </div>
      </div>
    </div>
  </div>
{:else}
  <!-- ===== APP SHELL ===== -->
  <div
    id="app-page"
    class="flex flex-col md:flex-row min-h-screen {sidebarCollapsed
      ? 'sidebar-collapsed'
      : ''}"
    style="background: var(--bg-deep);"
  >
    <!-- Mobile Header -->
    <header
      class="md:hidden sticky top-0 z-20 px-5 py-3.5 flex justify-between items-center"
      style="background: rgba(11,15,26,0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--border-color);"
    >
      <div>
        <h1
          class="text-lg font-bold"
          style="font-family: 'Plus Jakarta Sans', sans-serif; background: linear-gradient(135deg, #fff, var(--accent-primary)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;"
        >
          Reflectify
        </h1>
        <p class="text-[10px]" style="color: var(--text-muted);">
          {getGreeting()} 👋
        </p>
      </div>
      <div class="relative">
        <button
          onclick={() => (profileDropdownOpen = !profileDropdownOpen)}
          class="cursor-pointer flex items-center justify-center w-9 h-9 rounded-full"
          style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary-dim));"
          aria-label="Profile menu"
        >
          <span class="text-sm font-bold text-white"
            >{getUserInitials(user?.email)}</span
          >
        </button>
        {#if profileDropdownOpen}
          <div
            class="absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden animate-slide-down z-50"
            style="background: rgba(15,20,35,0.97); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid var(--border-color-hover); box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);"
          >
            <!-- Close button -->
            <button
              onclick={() => (profileDropdownOpen = false)}
              class="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200"
              style="color: var(--text-muted); background: rgba(255,255,255,0.05);"
              aria-label="Close"
            >
              <ion-icon name="close-outline" class="text-sm"></ion-icon>
            </button>

            <!-- User Info -->
            <div
              class="p-4 pb-3"
              style="border-bottom: 1px solid var(--border-color);"
            >
              <p
                class="text-[11px] font-medium mb-1"
                style="color: var(--text-muted);"
              >
                Signed in as
              </p>
              <p
                class="text-sm font-semibold truncate"
                style="color: var(--text-primary);"
              >
                {user?.email ?? "..."}
              </p>
            </div>

            <!-- Logout -->
            <button
              onclick={handleLogout}
              class="w-full text-left px-4 py-3 text-sm flex items-center gap-2 cursor-pointer transition-colors duration-200"
              style="color: var(--accent-danger);"
              onmouseenter={(e) =>
                (e.currentTarget.style.background = "rgba(248,113,113,0.08)")}
              onmouseleave={(e) =>
                (e.currentTarget.style.background = "transparent")}
            >
              <ion-icon name="log-out-outline" class="text-base"></ion-icon>
              Logout
            </button>
          </div>
        {/if}
      </div>
    </header>

    <!-- Desktop Sidebar -->
    <aside
      id="sidebar"
      class="hidden md:flex md:w-64 p-6 flex-col fixed top-0 left-0 h-full z-20"
    >
      <!-- Logo -->
      <div class="flex items-center mb-3 animate-slide-left">
        <div
          class="icon-badge icon-badge-indigo mr-3"
          style="width:2.25rem;height:2.25rem;border-radius:10px;"
        >
          <ion-icon name="analytics-outline" class="text-base text-white"
          ></ion-icon>
        </div>
        <span
          id="logo-text"
          class="text-xl font-bold"
          style="font-family: 'Plus Jakarta Sans', sans-serif; background: linear-gradient(135deg, #fff, var(--accent-primary)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;"
        >
          Reflectify
        </span>
        <span
          id="logo-icon"
          class="text-2xl font-bold hidden"
          style="color: var(--accent-primary);"
        >
          <ion-icon name="analytics-outline"></ion-icon>
        </span>
      </div>
      <p
        class="text-[11px] mb-8 animate-slide-left delay-1"
        style="color: var(--text-muted);"
        id="logo-text"
      >
        {getGreeting()} 👋
      </p>

      <!-- Nav -->
      <nav class="flex-grow">
        <p
          class="text-[10px] font-bold uppercase tracking-widest mb-3 px-2"
          style="color: var(--text-muted);"
        >
          Menu
        </p>
        <ul class="space-y-1">
          {#each navItems as item, i}
            <li
              class="animate-slide-left"
              style="animation-delay: {0.05 + i * 0.04}s;"
            >
              <button
                onclick={() => navigateTo(item)}
                class="nav-link {currentTab === item.id ? 'active' : ''}"
              >
                <ion-icon name={item.icon} class="text-lg mr-3"></ion-icon>
                <span class="nav-text">{item.label}</span>
              </button>
            </li>
          {/each}
        </ul>
      </nav>

      <!-- User Info -->
      <div
        id="user-info-box"
        class="mt-6 pt-4"
        style="border-top: 1px solid var(--border-color);"
      >
        <div class="flex items-center gap-3 mb-4">
          <div
            class="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
            style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary-dim));"
          >
            <span class="text-sm font-bold text-white"
              >{getUserInitials(user?.email)}</span
            >
          </div>
          <div class="min-w-0 nav-text">
            <p class="text-xs truncate" style="color: var(--text-secondary);">
              {user?.email ?? "..."}
            </p>
          </div>
        </div>
        <button
          onclick={handleLogout}
          class="w-full flex items-center justify-center text-sm px-3 py-2.5 rounded-lg font-medium cursor-pointer transition-all duration-200"
          style="background: rgba(248,113,113,0.06); color: var(--accent-danger); border: 1px solid rgba(248,113,113,0.12);"
          onmouseenter={(e) => {
            e.currentTarget.style.background = "rgba(248,113,113,0.12)";
            e.currentTarget.style.borderColor = "rgba(248,113,113,0.25)";
          }}
          onmouseleave={(e) => {
            e.currentTarget.style.background = "rgba(248,113,113,0.06)";
            e.currentTarget.style.borderColor = "rgba(248,113,113,0.12)";
          }}
        >
          <ion-icon name="log-out-outline" class="mr-2"></ion-icon>
          <span class="nav-text">Logout</span>
        </button>
        <p
          class="text-center text-[10px] mt-4"
          style="color: var(--text-muted);"
        >
          © 2025 Reflectify by <span
            class="font-semibold"
            style="color: var(--accent-primary);">@JakiJeki</span
          >
        </p>
      </div>
    </aside>

    <!-- Main Content -->
    <main
      id="main-content"
      class="flex-1 md:ml-64 p-5 md:p-10 overflow-auto pb-24 md:pb-10"
    >
      <div class="animate-fade-in">
        {@render children()}
      </div>
    </main>

    <!-- Mobile Bottom Nav -->
    <nav
      class="md:hidden fixed bottom-0 left-0 right-0 flex justify-around z-20"
      style="background: rgba(11,15,26,0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-top: 1px solid var(--border-color);"
    >
      {#each navItems as item}
        <button
          onclick={() => navigateTo(item)}
          class="nav-link-mobile {currentTab === item.id ? 'active' : ''}"
        >
          <ion-icon name={item.icon} class="text-2xl"></ion-icon>
          <span class="text-[10px] mt-0.5">{item.label.split(" ")[0]}</span>
        </button>
      {/each}
    </nav>
  </div>
{/if}
