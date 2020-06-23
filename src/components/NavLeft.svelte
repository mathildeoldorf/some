<script>
  import Search from "./Search.svelte";
  import { Link } from "svelte-routing";
</script>

<style>
  .left {
    grid-template-columns: 0.5fr 3fr;
  }

  .fa-facebook:before {
    color: #4891f0;
    font-size: 3vw;
  }
</style>

<div class="left grid gridGapSmall relative">
  <Link to="/">
    <i class="fab fa-facebook" />
  </Link>
  <Search />
</div>
