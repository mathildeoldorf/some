<script>
  import Message from "./../components/Message.svelte";
  let isMessage = false;
  let messageText = "";
  let messageType = "";

  import axios from "axios";
  import Posts from "./../components/Posts.svelte";
  import UserThumbnail from "./../components/UserThumbnail.svelte";
  import ModalPost from "./../components/ModalPost.svelte";
  import {
    profile,
    posts,
    users,
    contacts,
    postModal,
    feedPosts,
    isAuthorised
  } from "./../store.js";
  import { onMount } from "svelte";

  $: jAllPosts = $posts;
  $: jPosts = $feedPosts;
  $: jContacts = $contacts;

  $: pathArray = window.location.pathname.split("/");
  $: id = pathArray[2];

  $: user = {};

  $: isLogged = "";

  $: isCurrentContact = "";
  $: currentContact = "";

  let coverUrl = "";
  let coverImageFile;
  let profileUrl = "";
  let profileImageFile;
  let hiddenCoverInput;
  let hiddenProfileInput;
  let temporary = false;
  let contactStatusButton;
  let contactStatus;
  let actions;

  const handleSelectProfileImage = e => {
    temporary = true;
    console.log(e.target.files[0]);
    profileImageFile = e.target.files[0];
    console.log(URL.createObjectURL(event.target.files[0]));
    profileUrl = URL.createObjectURL(event.target.files[0]);
  };

  const handleSelectCoverImage = e => {
    temporary = true;
    console.log(e.target.files[0]);
    coverImageFile = e.target.files[0];
    console.log(URL.createObjectURL(event.target.files[0]));
    coverUrl = URL.createObjectURL(event.target.files[0]);
  };

  const handleRemoveCoverImage = () => {
    coverUrl = "";
    coverImageFile = "";
  };

  const handleRemoveProfileImage = () => {
    profileUrl = "";
    profileImageFile = "";
  };

  const handleUpdateImage = async type => {
    console.log(`updating ${type} image`);
    let formObject = new FormData();
    if (type === "profile") {
      formObject.append("img", profileImageFile);
    } else {
      formObject.append("cover", coverImageFile);
    }

    //   formObject.append("removed", imageUrl ? false : true);

    try {
      let response = await axios.patch(
        `http://localhost/profile/image`,
        formObject
      );

      let data = response.data.data;
      console.log(data);
      if (type === "profile") {
        console.log(user.img);
        user.img = data;
        $profile.img = data;
        profileUrl = "";
      } else {
        console.log(user.cover);
        user.cover = data;
        $profile.cover = data;
        coverUrl = "";
      }

      console.log(user);
      console.log($profile);
    } catch (error) {
      console.log(error.response.data.response);
      return;
    }
  };

  const handleAddContact = async () => {
    console.log("sending request" + id);
    console.log(contactStatus);
    console.log(contactStatusButton);

    try {
      let response = await axios.get(`http://localhost/contact/${id}`);
      let data = response.data.response;
      let status = response.data.status;
      console.log(data);
      contactStatusButton.innerText = status;
      // contactStatus.remove();

      isCurrentContact = true;

      $contacts = [...$contacts, currentContact];
      handleShowMessage("success", data);
    } catch (error) {
      console.log(error.response.data.response);
      return;
    }
  };

  const handleDeleteContact = async type => {
    console.log("removing contact");
    console.log(contactStatus);
    console.log(contactStatusButton);

    try {
      let response = await axios.delete(`http://localhost/contact/${id}/`);
      let data = response.data.response;
      let status = response.data.status;
      console.log(data);
      contactStatusButton.innerText = "Contact removed";
      contactStatus.remove();

      isCurrentContact = false;
      // $contacts = [...$contacts, currentContact];
      $contacts = $contacts.filter(
        contact => contact._id !== currentContact._id
      );

      handleShowMessage("success", response.data.response);
    } catch (error) {
      console.log(error.response.data.response);
      return;
    }
  };

  // const handleWithdrawRequest = async type => {
  //   console.log("removing contact");
  //   try {
  //     let response = await axios.get(`http://localhost/contact/${id}/`);
  //     let data = response.data.response;
  //     let status = response.data.status;
  //   } catch (error) {
  //     console.log(error.response.data.response);
  //     return;
  //   }
  // };

  onMount(() => {
    console.log(id);
    setTimeout(() => {
      user = $users.find(jUser => jUser._id === id);
      isLogged = user._id === $profile._id;

      isCurrentContact = $profile.contacts.find(contact =>
        contact.contactID === id ? true : false
      );

      currentContact = $users.find(currentProfile => currentProfile._id === id);

      user = currentContact ? currentContact : user;

      console.log(user);
      console.log(isLogged);
      console.log(isCurrentContact);
      console.log(currentContact);
    }, 200);
  });

  const handleShowMessage = (type, message) => {
    isMessage = true;
    messageType = type;
    messageText = message;
  };
</script>

<style>
  button:disabled {
    border: none;
    color: #fff;
  }
  section {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-gap: 10%;
    background-color: var(--web-wash);
  }

  .feed {
    display: grid;
    grid-gap: 4%;
    padding: 10%;
  }

  /* /////// */
  .profileHeader {
    height: 55vh;
    position: relative;
  }

  .coverContainer {
    height: 100%;
  }

  .coverImage {
    width: 100%;
    height: 100%;
  }

  .profileImageContainer {
    width: 100%;
    margin: 0 auto;
    top: 25%;
  }
  .profileImage {
    width: 10rem;
    border-radius: 50%;
    height: 10rem;
    border: 0.3rem solid white;
  }
  .profileName {
    top: 80%;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.1);
  }

  .addFriendButton:hover {
    background: #fff;
    color: #1877f2;
  }
  .status {
    position: absolute;
    left: 53%;
    top: 47%;
    justify-content: center;
    align-content: center;
    width: 4vw;
    height: 4vw;
    border-radius: 50%;
  }

  .changeContainer {
    position: absolute;
    right: 1%;
    width: 16%;
    top: 17%;
  }

  .actionTab {
    max-width: 25%;
    margin: 0 auto;
    padding: 1vw;
  }

  .actionTab button {
    text-transform: capitalize;
  }
  .changeCoverButton .fas {
    font-size: 1.5vw;
  }

  .changeCoverActions {
    transition: 0.2s ease all;
    cursor: pointer;
  }
  .changeCoverButton:hover {
    background: #e4e6eb;
  }
  .cameraProfileImage,
  .changeProfileActions {
    transition: 0.2s ease all;
    cursor: pointer;
  }
  .cameraProfileImage:hover,
  .changeProfileActions:hover {
    color: #1877f2;
  }
</style>

{#if user}
  {#if isMessage}
    <Message {isMessage} {messageType} {messageText} />
  {/if}
  <div class="profileHeader relative">
    <div class="coverContainer relative">
      {#if coverUrl}
        {#if temporary}
          <div
            class="coverImage img"
            style="background-image: url({coverUrl})" />
        {:else}
          <div
            class="coverImage img"
            style="background-image: url(/../images/cover/{coverUrl})" />
        {/if}
      {:else}
        <div
          style="background-image: url(/../images/cover/{user.cover})"
          alt="cover"
          class="coverImage img" />
      {/if}
      {#if isLogged}
        {#if coverUrl}
          <div class="changeContainer grid gridTwoColumn gridGapMedium">
            <button
              class="changeCoverActions bgBlue colorWhite"
              on:click={() => handleUpdateImage('cover')}>
              Save
            </button>
            <button
              class="changeCoverActions bgGrey"
              on:click={() => (coverUrl = '')}>
              Cancel
            </button>
          </div>
        {:else}
          <div class="changeContainer paddingSmall grid gridGapMedium">
            <button
              class="changeCoverButton grid gridOneSixth alignItemsCenter
              absolute bgWhite"
              on:click={() => hiddenCoverInput.click()}>
              <i class="cameraProfileImage justifySelfStart fas fa-camera" />
              <span class="justifySelfEnd">Edit cover image</span>
            </button>
          </div>
        {/if}
        <input
          bind:this={hiddenCoverInput}
          accept="image/*"
          type="file"
          alt="hiddenFile"
          style="display: none;"
          on:change={e => handleSelectCoverImage(e)} />
      {/if}
      <div class="profileImageContainer absolute grid justifyItemsCenter">
        {#if profileUrl}
          {#if temporary}
            <div
              class="profileImage img"
              style="background-image: url({profileUrl})" />
          {:else}
            <div
              class="profileImage img"
              style="background-image: url(/../images/profile/{profileUrl})" />
          {/if}
        {:else}
          <div
            style="background-image: url(/../images/profile/{user.img})"
            alt="profile"
            class="profileImage img" />
        {/if}

        {#if isLogged}
          {#if profileUrl}
            <div class="paddingSmall grid gridTwoColumn gridGapMedium">
              <button
                class="changeProfileActions bgBlue colorWhite"
                on:click={() => handleUpdateImage('profile')}>
                Save
              </button>
              <button
                class="changeProfileActions bgGrey"
                on:click={() => {
                  profileUrl = '';
                }}>
                Cancel
              </button>
            </div>
          {:else}
            <div class="paddingSmall grid gridGapMedium">
              <i
                class="cameraProfileImage fas fa-camera"
                on:click={() => hiddenProfileInput.click()} />
            </div>
          {/if}
          <input
            bind:this={hiddenProfileInput}
            accept="image/*"
            type="file"
            alt="hiddenFile"
            style="display: none;"
            on:change={e => handleSelectProfileImage(e)} />
        {/if}
        <span
          class="status"
          style={user.status == 1 ? 'background-color:#86DF81; border: solid 0.2vw #fff;' : 'background-color:transparent; border: none;'} />
      </div>
      <div class="profileName absolute paddingSmall textCenter">
        <h1 class="colorWhite">{user.firstName + ' ' + user.lastName}</h1>
      </div>
    </div>

    {#if !isCurrentContact}
      <div class="actionTab grid justifyItemsCenter">
        <button
          class="addFriendButton bgBlue colorWhite"
          on:click={handleAddContact}>
          Send request
        </button>
      </div>
    {/if}
    {#if isCurrentContact}
      <div class="actionTab grid gridTwoColumn gridGapMedium">
        {#if isCurrentContact.status === 'pending'}
          <button
            bind:this={contactStatusButton}
            disabled
            style="cursor: inherit"
            class="colorWhite bgBlue">
            {isCurrentContact.status}
          </button>
          <button class="bgWhite">Withdraw</button>
          <!-- </div> -->
        {/if}
        {#if isCurrentContact.status === 'accept'}
          <!-- <div class="actionTab grid gridGapMedium"> -->
          <button
            disabled
            bind:this={contactStatus}
            style="cursor: inherit"
            class="colorWhite bgBlue">
            {isCurrentContact.status + 'ed'}
          </button>
          <button
            bind:this={contactStatusButton}
            class="addFriendButton bgWhite"
            on:click={handleDeleteContact}>
            Remove
          </button>
        {/if}
      </div>
    {/if}
  </div>
  <section>
    <div />
    <div>
      {#if $profile.posts}
        <div class="feed">
          <Posts context="profile" {user} {isLogged} />
        </div>
      {/if}
    </div>
    <div />
  </section>
  <ModalPost />
{/if}
