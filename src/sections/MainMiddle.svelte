<script>
  import Posts from "./../components/Posts.svelte";
  import Stories from "./../components/Stories.svelte";
</script>

<style>
  .feed {
    display: grid;
    grid-gap: 4%;
    padding: 10%;
  }
</style>

<section class="feed">
  <Stories />
  <Posts />
</section>
