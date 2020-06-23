<script>
  import axios from "axios";
  import { Link } from "svelte-routing";

  import UserThumbnail from "./UserThumbnail.svelte";
  import SingleComment from "./SingleComment.svelte";

  import { jData } from "./../store.js";
  export let jPost;
  import { profile } from "./../store.js";
  import { users } from "./../store.js";
  import { posts } from "./../store.js";
  import { feedPosts } from "./../store.js";
  import { postModal } from "./../store.js";
  import { onMount } from "svelte";

  export let context;

  let now = Math.round(new Date().getTime() / 1000);
  $: timePast = jPost.timestamp < now ? now - jPost.timestamp : now - now;
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

  $: publicJson = {
    userID: $profile._id,
    firstName: $profile.firstName,
    lastName: $profile.lastName,
    img: $profile.img,
    status: $profile.status
  };

  $: jCurrentPost = $feedPosts.filter(
    currentPost => currentPost._id === jPost._id
  )[0];

  $: jPostUser = $users.filter(
    currentUser => currentUser._id === jCurrentPost.userID
  )[0];

  $: like =
    jCurrentPost && jCurrentPost.likes
      ? jCurrentPost.likes.find(
          currentLike => currentLike.userID === $profile._id
        )
      : undefined;

  $: comment = undefined;

  // POSTS
  let edit = false;
  let openOptions = false;
  const showOptions = () => {
    openOptions = true;
    console.log("here");
  };

  const handleDeletePost = async () => {
    console.log("delete post", jCurrentPost._id);
    try {
      let response = await axios.delete(
        `http://localhost/post/${jCurrentPost._id}`,
        {
          postID: jCurrentPost._id
        }
      );

      let data = response.data.response;
      console.log(data);

      $feedPosts = $feedPosts.filter(post => post._id !== jCurrentPost._id);
    } catch (error) {
      console.log(error.response.data);
      return;
    }

    // $profile.posts = $profile.posts;
  };

  const handleUpdatePost = async () => {
    console.log("editing post", jCurrentPost._id);
    $postModal.postData = jCurrentPost._id;
    $postModal.show = true;
    openOptions = false;
  };
  // LIKES

  const handleLike = async () => {
    if (jCurrentPost.likes && jCurrentPost.likes.length) {
      console.log("there is likes");
      if (like !== undefined) {
        console.log("unliking", "user is", $profile._id);
        handleDeleteLike();
        return;
      }
      handlePostLike();
    } else {
      jCurrentPost.likes = [];
      handlePostLike();
    }
  };

  const handlePostLike = async () => {
    console.log(jCurrentPost._id);
    try {
      let response = await axios.post("http://localhost/like", {
        postID: jCurrentPost._id
      });

      let data = response.data;
      console.log(data);
      jCurrentPost.likes = [...jCurrentPost.likes, publicJson];
    } catch (err) {
      // if (err) {
      console.log(err.response.data);
      return;
      // }
    }
  };

  const handleDeleteLike = async () => {
    try {
      let response = await axios.delete(
        `http://localhost/like/${jCurrentPost._id}`
      );

      let data = response.data;
      console.log(data);
      jCurrentPost.likes = jCurrentPost.likes.filter(
        currentLike => currentLike.userID !== $profile._id
      );
    } catch (err) {
      // if (err) {
      console.log(err.response.data);
      return;
      // }
    }
  };

  // COMMENTS
  let open = false;
  const filterComments = comments => comments.slice(0, 2);

  const handleComment = async (e, comment) => {
    console.log(jCurrentPost);

    comment = {
      userID: $profile._id,
      post_id: jCurrentPost._id,
      body: comment,
      timestamp: Math.round(new Date().getTime() / 1000),
      likes: []
    };
    console.log(comment);

    try {
      let response = await axios.post("http://localhost/comment", {
        postID: jCurrentPost._id,
        body: comment.body
      });
      let data = response.data;
      console.log(data);
      console.log(jCurrentPost);

      jCurrentPost.comments = [...jCurrentPost.comments, comment];
      console.log(jCurrentPost.comments);
      // console.log(jCurrentPost.comments);
      console.log("comment", jCurrentPost.comments);
      e.target.value = "";
    } catch (error) {
      console.log(error.response.data);
      return;
    }
    if (!jCurrentPost.comments) {
      jCurrentPost.comments = [];
    }
  };

  const handleToggleComments = () => {
    open = !open;
  };
</script>

<style>
  .singlePost {
    margin-top: 1vw;
  }

  .hidden {
    display: none;
  }

  .close {
    right: 6%;
    top: 3%;
  }

  .options {
    right: -5%;
    top: 10%;
    padding: 3%;
  }

  .options p,
  .optionsBtn,
  .updateActions {
    cursor: pointer;
  }

  .img {
    background-size: cover;
    background-repeat: no-repeat;
    width: 100%;
    height: 15vw;
  }

  .likes,
  .comments {
    display: grid;
    grid-template-columns: 1fr 4fr;
    align-items: center;
  }

  .likes {
    justify-self: baseline;
  }

  .comments {
    justify-self: flex-end;
    grid-template-columns: 1fr;
  }

  .comment {
    margin-bottom: 2%;
  }

  .likes .fas,
  .likes .far {
    font-size: 1.2vw;
    padding-right: 1vw;
  }

  .fa-thumbs-up::before {
    color: #606770;
  }

  .fa-thumbs-up.active::before {
    color: #2078f4;
  }

  .actions .fas,
  .actions .far {
    font-size: 1.5vw;
  }

  #comment {
    width: 100%;
  }
</style>

<!-- ################################## -->
{#if context && jPost && jCurrentPost && jPostUser}
  <div class="singlePost containerWhiteShadow paddingMedium relative">
    <!-- <Link to="/profile"> -->
    <UserThumbnail
      user={jPostUser}
      timestamp={convertTime(timePast)}
      context="post" />
    <!-- </Link> -->
    <p
      class={jCurrentPost.userID === $profile._id ? 'optionsBtn textRight' : 'hidden'}
      on:click={showOptions}>
      ...
    </p>
    {#if openOptions}
      <div class="options grid gridGapSmall absolute containerWhiteShadow ">
        <div class="paddingVerticalMedium">
          <p on:click={handleUpdatePost} class="update paddingVerticalSmall">
            Edit post
          </p>
          <p on:click={handleDeletePost} class="delete paddingVerticalSmall">
            Delete post
          </p>
        </div>
        <p
          class="close textRight absolute"
          on:click={() => (openOptions = false)}>
          x
        </p>
      </div>
    {/if}
    <div class="postContent paddingVerticalSmall">
      <div class="body paddingVerticalSmall">{jPost.body}</div>
      {#if jCurrentPost.img}
        <div
          class="img paddingVerticalSmall"
          style="background-image: url(/../images/posts/{jPost.img})" />
      {/if}
    </div>
    <div class="postStatus grid gridTwoColumn alignItemsCenter gridGapSmall">
      <span class="likes">
        <i
          on:click={handleLike}
          class={like ? 'fas fa-thumbs-up active' : 'far fa-thumbs-up'} />
        <p>
          {jCurrentPost.likes && jCurrentPost.likes.length > 1 ? jCurrentPost.likes[0].firstName + ' and ' + (jCurrentPost.likes.length - 1) + ' more' : jCurrentPost.likes && jCurrentPost.likes.length === 1 ? jCurrentPost.likes[0].firstName : '0 likes'}
        </p>
      </span>
      <span class="comments">
        <p>
          {jCurrentPost.comments ? jCurrentPost.comments.length : 0}
          {jCurrentPost.comments ? (jCurrentPost.comments.length === 1 ? 'comment' : 'comments') : 'comments'}
        </p>
      </span>
    </div>
    <form on:submit|preventDefault class="form">
      <div
        class="actions grid gridThreeColumn justifyItemsCenter alignItemsCenter
        paddingMedium">
        <i
          on:click={handleLike}
          class={like ? 'fas fa-thumbs-up' : 'far fa-thumbs-up'} />
        <label for="comment">
          <i class="far fa-comment-alt" />
        </label>
        <i class="fas fa-share-square" />
      </div>
      <input
        bind:value={comment}
        class="comment paddingVerticalMedium"
        type="text"
        name="comment"
        id="comment"
        placeholder="Your comment..."
        on:keyup={e => (e.keyCode == 13 ? handleComment(e, comment) : console.log(e.target.value))} />
    </form>
    {#if jCurrentPost && jCurrentPost.comments}
      {#if jCurrentPost.comments.length > 3 && open === false}
        {#each filterComments(jCurrentPost.comments.sort((a, b) => b.timestamp - a.timestamp)) as comment}
          <SingleComment {comment} />
        {/each}
        <button on:click={handleToggleComments} class="toggleComments">
          Show more
        </button>
      {:else if open === true}
        {#each jCurrentPost.comments.sort((a, b) => b.timestamp - a.timestamp) as comment}
          <SingleComment {comment} />
        {/each}
        <button on:click={handleToggleComments} class="toggleComments">
          Show less
        </button>
      {:else}
        {#each jCurrentPost.comments.sort((a, b) => b.timestamp - a.timestamp) as comment}
          <SingleComment {comment} />
        {/each}
      {/if}
    {/if}
    <!-- </form> -->
  </div>
{/if}

<!-- ################################## -->
