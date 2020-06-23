<script>
  import axios from "axios";
  import { onMount } from "svelte";

  import UserThumbnail from "./../components/UserThumbnail.svelte";

  import { profile } from "./../store.js";
  import { contacts } from "./../store.js";
  import { posts } from "./../store.js";

  $: user = $profile;

  $: jContacts = $contacts.map(jContact => jContact);

  const showSearchContainer = () => {
    console.log("showing messenger search");
  };

  const handleOpenChat = jContact => {
    let jCheckChat = $profile.chats.find(
      contact => contact._id === jContact._id
    );

    if (jCheckChat === undefined) {
      jContact.open = true;
      $profile.chats = [...$profile.chats, jContact];
      console.log("this profile has these chats ", $profile.chats);
    } else if (jCheckChat.open === false) {
      let currentChatIndex = $profile.chats.indexOf(jCheckChat);
      console.log("opening an active chat");
      $profile.chats[currentChatIndex].open = true;
    }
  };
</script>

<style>
  .contactsContainer {
    top: 15%;
    right: 0;
    width: 25%;
    z-index: 0;
  }

  .header {
    border-bottom: 0.1vw solid #a7adb4;
    padding: 5% 0;
  }

  .fas {
    font-size: 1.4vw;
    justify-self: flex-end;
  }
</style>

<!-- ############################## -->

<section class="contactsContainer fixed paddingTiny">
  <div class="header grid gridThreeFourth alignItemsCenter">
    <h2>Contacts</h2>
    <i class="fas fa-search" on:click={showSearchContainer} />
  </div>
  {#each jContacts as jContact}
    <span on:click={handleOpenChat(jContact)}>
      <UserThumbnail context="contact" user={jContact} message={''} />
    </span>
  {/each}
</section>

<!-- ############################## -->
