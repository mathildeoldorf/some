<script>
  import { Router, Route, Link } from "svelte-routing";
  import Main from "./../pages/Main.svelte";
  import Profile from "./../pages/Profile.svelte";
  export let url = ""; //This property is necessary declare to avoid ignore the Router

  import NavRight from "./NavRight.svelte";
  import NavLeft from "./NavLeft.svelte";
  import NavMiddle from "./NavMiddle.svelte";
</script>

<style>
  nav {
    top: 0;
    grid-template-columns: 1fr 2fr 1fr;
    padding: 1% 2%;
    border-radius: 0;
  }
</style>

<Router {url}>
  <nav
    class="fixed grid alignItemsCenter colorGrey containerWhiteShadow
    gridGapMedium">
    <NavLeft />
    <NavMiddle />
    <NavRight />
  </nav>
  <div class="pages">
    <Route path="profile/:id">
      <Profile />
    </Route>
    <Route path="profile/:id">
      <Profile />
    </Route>
    <Route path="/">
      <!-- <Profile /> -->
      <Main />
    </Route>
  </div>
</Router>
