<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let { data } = $props();

  onMount(() => {
    if (data.session) goto("/tracker");
  });
</script>

<svelte:head>
  <title>Reflectify - Track & Reflect</title>
</svelte:head>
