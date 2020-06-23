<script>
  import axios from "axios";

  import MainRight from "./../sections/MainRight.svelte";
  import MainMiddle from "./../sections/MainMiddle.svelte";
  import MainLeft from "./../sections/MainLeft.svelte";
  import Chats from "./../sections/Chats.svelte";
  import ModalPost from "./../components/ModalPost.svelte";
</script>

<style>
  section {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-gap: 10%;
    background-color: var(--web-wash);
  }
</style>

<section>
  <MainLeft />
  <MainMiddle />
  <MainRight />
  <Chats />
  <ModalPost />
</section>
