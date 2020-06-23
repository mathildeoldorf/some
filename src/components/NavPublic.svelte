<script>
  import FormNav from "./FormNav.svelte";
</script>

<style>
  nav {
    top: 0;
    padding: 1% 2%;
    border-radius: 0;
  }
  .fa-facebook:before {
    font-size: 3vw;
  }

  @media screen and (max-width: 1000px) {
    nav.gridTwoColumn {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>

<nav
  class="fixed grid gridTwoColumn gridGapMedium alignItemsCenter
  containerWhiteShadow colorGrey">
  <div class="left">
    <i class="fab fa-facebook" />
  </div>
  <FormNav />
</nav>
