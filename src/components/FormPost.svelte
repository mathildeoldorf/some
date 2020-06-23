<script>
  import UserThumbnail from "./UserThumbnail.svelte";
  import ModalPost from "./../components/ModalPost.svelte";
  import { profile, postModal } from "./../store.js";
  export let isLogged;
  export let user;
  export let context;

  const onOpenModal = () => {
    $postModal.show = true;
    console.log($postModal);
    console.log(context);
  };

  $: jUser = $profile;

  let active = false;
</script>

<style>
  .formPost form {
    grid-template-columns: 1fr 8fr;
  }

  .formPost input {
    border-radius: 5vw;
  }
</style>

<div class="formPost containerWhiteShadow paddingMedium">
  <form class="grid alignItemsCenter">

    <UserThumbnail context="form" user={jUser} />
    {#if context === undefined || (context === 'profile' && isLogged)}
      <input
        type="text"
        on:focus={onOpenModal}
        placeholder="What's on your mind {jUser.firstName} ?" />
    {:else}
      <input
        type="text"
        on:focus={onOpenModal}
        placeholder="What do you wanna say to {user.firstName} ?" />
    {/if}
  </form>
</div>
