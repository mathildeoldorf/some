<script>
  import axios from "axios";
  import UserThumbnail from "./UserThumbnail.svelte";
  import { profile } from "./../store.js";
  import { feedPosts } from "./../store.js";
  import { users } from "./../store.js";
  // import { contactsPosts } from "./../store.js";
  import { onMount } from "svelte";

  $: open = false;

  let now = Math.round(new Date().getTime() / 1000);

  $: timePast = comment.timestamp < now ? now - comment.timestamp : now - now;

  const convertTime = timePast => {
    if (timePast < 60) {
      timePast = Math.round(timePast) + " seconds ago";
    } else if (timePast > 60 && timePast < 3600) {
      timePast = Math.round(timePast / 60) + " mins ago";
    } else if (timePast > 3600 && timePast < 86400) {
      timePast = Math.round(timePast / 60 / 24) + " hours ago";
    } else {
      timePast = "A long time ago";
    }
    return timePast;
  };

  export let comment;
  let edit = false;
  let commentInput;
  let commentBefore;

  // NOT ABLE TO GET THE ID OF THE COMMENT IF ITS JUST BEEN CREATED - AFTER REFRESH I CAN

  $: jCurrentPost = $feedPosts.filter(
    currentPost => currentPost._id === comment.post_id
  )[0];

  $: jCurrentComment = jCurrentPost.comments.filter(
    currentComment => currentComment._id === comment._id
  )[0];

  $: jCommentUser = $users.filter(
    currentUser => currentUser._id === comment.userID
  )[0];

  onMount(() => {
    // console.log($users);
    // console.log(jCurrentPost);
    // console.log(jCurrentComment);
    // console.log(jCommentUser);
  });

  const showOptions = () => {
    open = true;
  };

  const handleDeleteComment = async () => {
    console.log("deleting comment");

    try {
      console.log(comment._id);
      console.log(jCurrentPost._id);

      let response = await axios.delete(
        `http://localhost/comment/${jCurrentPost._id}/${comment._id}`
      );

      let data = response.data;
      console.log(data);
      jCurrentPost.comments = jCurrentPost.comments.filter(
        currentComment => currentComment._id !== jCurrentComment._id
      );

      console.log(jCurrentPost.comments.length);
    } catch (err) {
      console.log(err.response.data);
      return;
    }
  };

  const handleUpdate = () => {
    console.log("currently editing a comment");
    console.log(jCurrentComment);
    edit = true;
    commentBefore = commentInput.innerText;
    setTimeout(() => {
      open = false;
      commentInput.focus();
      commentInput.style.outline = "none";
    }, 200);
  };

  const handleSaveUpdate = async () => {
    let timestamp = Math.round(new Date().getTime() / 1000);
    console.log("Save");
    try {
      let response = await axios.put(`http://localhost/comment`, {
        postID: jCurrentPost._id,
        commentID: jCurrentComment._id,
        body: commentInput.innerText,
        timestamp: timestamp
      });

      let data = response.data;
      console.log(data);
      jCurrentComment.body = commentInput.innerText;
      comment.timestamp = timestamp;
      edit = false;
    } catch (err) {
      console.log(err.response.data);
      return;
    }
  };

  const handleCancelUpdate = () => {
    console.log("Cancel");
    commentInput.innerText = commentBefore;
    edit = false;
  };
</script>

<style>
  .singleComment {
    grid-template-columns: 0.4fr 4fr 0.2fr;
  }

  .time {
    width: 100%;
  }

  .hidden {
    display: none;
  }

  .options {
    right: -10%;
    padding: 3%;
  }

  .options p,
  .optionsBtn,
  .updateActions {
    cursor: pointer;
  }

  .optionsBtn {
    padding: 0 50%;
  }

  .comment span {
    font-size: calc(0.5rem + 20%);
    font-weight: 600;
  }

  .comment {
    padding: 1vw 2vw;
  }

  .comment p {
    font-size: calc(0.5rem + 40%);
  }

  .close {
    right: 6%;
    top: 3%;
  }
</style>

<!-- ################################## -->
{#if jCurrentComment && jCommentUser}
  <div class="singleCommentContainer">
    <div
      class="singleComment grid paddingVerticalSmall alignItemsCenter relative">
      <UserThumbnail user={jCommentUser} context="form" />
      <div class="comment bgGrey">
        <span>{jCommentUser.firstName} {jCommentUser.lastName}</span>
        <p bind:this={commentInput} contenteditable={edit}>{comment.body}</p>
      </div>
      <p
        class={jCurrentComment.userID === $profile._id ? 'optionsBtn' : 'hidden'}
        on:click={showOptions}>
        ...
      </p>

      {#if open}
        <div class="options grid gridGapSmall absolute containerWhiteShadow ">
          <div class="paddingVerticalMedium">
            <p
              on:click={handleDeleteComment}
              class="delete paddingVerticalSmall">
              Delete comment
            </p>
            <p on:click={handleUpdate} class="update paddingVerticalSmall">
              Edit comment
            </p>
          </div>
          <p class="close textRight absolute" on:click={() => (open = false)}>
            x
          </p>
        </div>
      {/if}
    </div>
    {#if edit}
      <div class="updateContainer grid gridTwoThirds gridGapSmall">
        <div />
        <div class="grid gridTwoColumn gridGapSmall justifyItemsRight">
          <span
            class="updateActions paddingVerticalSmall"
            on:click={handleSaveUpdate}>
            Save
          </span>
          <span
            class="updateActions paddingVerticalSmall"
            on:click={handleCancelUpdate}>
            Cancel
          </span>
        </div>
      </div>
    {/if}
    {#if !edit}
      <span class="grid time textRight paddingHorizontalSmall">
        {convertTime(timePast)}
      </span>
      <!-- <p class="textRight paddingHorizontalSmall">{convertTime(timePast)}</p> -->
    {/if}
  </div>
{/if}
<!-- ################################## -->
