<script>
  import axios from "axios";
  import { onMount } from "svelte";
  import { profile } from "./../store.js";
  import SingleChat from "./../components/SingleChat.svelte";

  $: user = $profile;
  $: chats = $profile.chats;

  const closeChat = () => {
    console.log("closing");
  };
</script>

<style>
  section {
    bottom: 0;
    left: 0;
    width: 100%;
    height: auto;
    justify-items: baseline;
  }
</style>

<!-- ############################## -->

{#if $profile.chats}
  <section
    class="chats fixed grid gridFourColumn gridGapSmall paddingHorizontalSmall">
    {#each $profile.chats as jChat}
      <!-- {#if $jData.chats.length < 4} -->
      <SingleChat user={jChat} open={jChat.open} />
      <!-- <SingleChat {jChat} open={jChat.open === false ? false : true} /> -->
      <!-- {/if} -->
    {/each}
  </section>
{/if}

<!-- ############################## -->
