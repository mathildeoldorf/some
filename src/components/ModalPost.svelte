<script>
  import axios from "axios";
  import { onMount } from "svelte";

  import UserThumbnail from "./UserThumbnail.svelte";
  import { profile, feedPosts, postModal } from "./../store.js";

  let hiddenImageInput;
  let inputDescription;
  let imageFile = "";
  let imageUrl = "";
  $: showModal = $postModal.show;

  $: jUser = $profile;

  let post;
  let temporary = false;

  $: jCurrentPost = $feedPosts.filter(
    post => post._id === $postModal.postData
  )[0];

  $: if ($postModal.postData) {
    setTimeout(() => {
      post.value = jCurrentPost.body;
      imageUrl = jCurrentPost.img;
    }, 200);
  }

  const handleClose = () => {
    $postModal.show = false;
    $postModal.postData = undefined;
    imageUrl = "";
    imageFile = "";
    jCurrentPost = "";
    post.value = "";
    console.log(imageUrl, imageFile, jCurrentPost);
  };

  const handleSelectImage = e => {
    temporary = true;
    imageFile = e.target.files[0];
    imageUrl = URL.createObjectURL(event.target.files[0]);
  };

  const handleRemoveImage = () => {
    imageUrl = "";
    imageFile = "";
  };

  const handlePost = async e => {
    console.log(e.target.value);

    let formObject = new FormData();
    formObject.append("img", imageFile);
    formObject.append("body", post.value);

    try {
      let response = await axios.post("http://localhost/post", formObject);
      let data = response.data.data;
      console.log(data);
      // $profile.posts = [data, ...$profile.posts];
      $feedPosts = [data, ...$feedPosts];
      e.target.value = "";
      post.value = "";
      handleClose();
    } catch (error) {
      console.log(error.response);
    }
  };

  const handleUpdatePost = async () => {
    console.log("editing");
    let timestamp = Math.round(new Date().getTime() / 1000);

    console.log(imageUrl);
    console.log($feedPosts);
    console.log(post.value);

    let formObject = new FormData();
    formObject.append("body", post.value);
    formObject.append("postID", jCurrentPost._id);
    formObject.append("timestamp", timestamp);
    formObject.append("img", imageFile);
    formObject.append("removed", imageUrl ? false : true);

    console.log("updating post", jCurrentPost._id);
    try {
      let response = await axios.patch(`http://localhost/post`, formObject);

      let data = response.data.data;
      console.log(data);

      // jCurrentPost = data;
      jCurrentPost.body = data.body;
      data.img ? (jCurrentPost.img = data.img) : null;
      // img: data.img

      jCurrentPost = jCurrentPost;

      let posts = $feedPosts;
      $feedPosts = "";
      $feedPosts = posts;

      console.log(jCurrentPost);
    } catch (error) {
      console.log(error.response.data);
      return;
    }

    handleClose();
  };

  onMount(() => {
    console.log($feedPosts);
    console.log(post);
  });

  const init = form => {
    form.focus();
  };
</script>

<style>
  .postModal {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
    background-color: rgba(255, 255, 255, 0.7);
  }

  form {
    width: 35%;
    height: 80%;
  }

  .header h2 {
    text-align: center;
    color: var(--primary-text);
  }

  .header {
    position: relative;
    padding-bottom: 2vw;
    border-bottom: 0.1vw solid #a7adb4;
  }

  .header span {
    position: absolute;
    top: -10%;
    left: 90%;
    background-color: #f1f2f5;
    width: 2.5vw;
    height: 2.5vw;
    padding: 0.7vw;
    border-radius: 50%;
  }

  .header .fas {
    font-size: 1.2vw;
  }

  .body {
    border: none;
    font-size: calc(0.8vw + 30%);
    overflow: auto;
    outline: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;
    resize: none; /*remove the resize handle on the bottom right*/
    width: 100%;
  }

  .body::placeholder {
    color: #a7adb4;
    font-weight: 100;
  }

  .main {
    padding: 2% 8%;
  }

  .actions {
    grid-template-columns: 6fr 1fr 1fr;
  }

  .actions span {
    background-color: transparent;
    width: 3vw;
    height: 3vw;
    padding: 0.7vw;
    border-radius: 50%;
    transition: 0.2s ease-in-out;
  }

  .actions span:hover {
    background-color: #f1f2f5;
  }

  .fa-image {
    color: #86df81;
  }

  .fa-user-tag {
    color: #1877f2;
  }
  .postModal .img {
    background-size: contain;
    background-repeat: no-repeat;
    width: 100%;
    height: 15vw;
    display: grid;
  }
  .imagePreview span {
    /* position: absolute;
    top: 4%;
    left: 93%;
    background-color: #f1f2f5;
    width: 2vw;
    height: 2vw;
    border-radius: 50%; */
    position: absolute;
    top: 4%;
    left: 62%;
    background-color: #f1f2f5;
    width: 2vw;
    height: 2vw;
    border-radius: 50%;
  }

  .imagePreview .fas {
    font-size: 1.2vw;
  }
</style>

{#if showModal}
  <div class="postModal grid" style="display: {showModal ? 'grid' : 'none'}">
    <form
      on:submit|preventDefault={$postModal.postData ? handleUpdatePost : handlePost}
      class="containerWhiteShadow alignSelfCenter justifySelfCenter">
      <div class="header grid justifyContentCenter alignContentCenter">
        <h2 class="">{$postModal.postData ? 'Edit Post' : 'Create Post'}</h2>
        <span class="grid justifyContentCenter alignContentCenter">
          <i class="fas fa-times" on:click={handleClose} />
        </span>
      </div>
      <div class="main relative">
        <UserThumbnail context="modal" user={jUser} />
        <textarea
          use:init
          bind:this={post}
          name="body"
          class="body paddingSmall"
          cols="30"
          rows="3"
          placeholder="What's on your mind {jUser.firstName}?" />
        {#if imageUrl}
          {#if temporary}
            <div
              class="img paddingVerticalSmall imagePreview relative"
              style="background-image: url({imageUrl})">
              <span class="grid justifyContentCenter alignContentCenter">
                <i class="fas fa-times" on:click={handleRemoveImage} />
              </span>
            </div>
          {:else}
            <div
              class="img paddingVerticalSmall imagePreview relative"
              style="background-image: url(/../images/posts/{imageUrl})">
              <span class="grid justifyContentCenter alignContentCenter">
                <i class="fas fa-times" on:click={handleRemoveImage} />
              </span>
            </div>
          {/if}
        {/if}
        <div class="actions grid paddingSmall justifyItemsRight">
          <div />
          <span class="grid justifyContentCenter alignContentCenter">
            <i
              on:click={() => hiddenImageInput.click()}
              class="fas fa-image paddingHorizontalSmall" />
          </span>
          <span class="grid justifyContentCenter alignContentCenter">
            <i class="fas fa-user-tag paddingHorizontalSmall" />
          </span>
          <input
            bind:this={hiddenImageInput}
            accept="image/*"
            type="file"
            alt="hiddenFile"
            style="display: none;"
            on:change={e => handleSelectImage(e)} />
        </div>
        <button type="submit">{$postModal.postData ? 'Edit' : 'Post'}</button>
      </div>
    </form>
  </div>
{/if}
<!-- {/if} -->
