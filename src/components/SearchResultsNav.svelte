<script>
  import UserThumbnail from "./UserThumbnail.svelte";
  export let ajUsers;
  export let txtSearch;
  export let active;
</script>

<style>
  .searchResultsContainer {
    padding: 20% 0% 10% 0;
    top: -15%;
    left: -10%;
    width: 130%;
    margin-top: -0.2em;
    height: auto;
    max-height: 70vh;
    overflow-y: scroll;
    overflow-x: hidden;
    z-index: 0;
    border-radius: 0.2vw;
  }

  .searchResults {
    padding: 0 10%;
  }

  .fas.fa-arrow-left {
    left: 10%;
    top: -200%;
    font-size: calc(0.5rem + 50%);
  }
</style>

<div
  class="searchResultsContainer absolute alignItemsStart containerWhiteShadow
  colorGrey"
  style="display: {active ? 'grid' : 'none'}">
  <i class="fas fa-arrow-left relative" on:click={() => (active = false)} />
  <div class="searchResults">
    {#each ajUsers as jUser}
      <UserThumbnail
        context="search"
        user={jUser}
        on:click={() => (window.location.pathname = '/profile')} />
    {/each}
    {#if ajUsers.length === 0 && txtSearch.length !== 0}
      <div>No result</div>
    {/if}
  </div>
</div>
