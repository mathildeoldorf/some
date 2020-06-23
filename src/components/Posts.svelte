<script>
  import { onMount } from "svelte";
  import axios from "axios";

  import SinglePost from "./../components/SinglePost.svelte";
  import FormPost from "./../components/FormPost.svelte";

  import { profile } from "./../store.js";
  import { contacts } from "./../store.js";
  import { users } from "./../store.js";
  import { posts } from "./../store.js";
  import { feedPosts } from "./../store.js";
  import { postModal } from "../store.js";

  export let context;
  export let user;
  export let isLogged;

  $: jAllPosts = $posts;
  $: jPosts = $feedPosts;
  $: jContacts = $contacts;

  // $: user = $profile;

  // $: context === undefined && fetchContactsPosts();
  // $: context === "profile" && fetchAllPosts();
  // $: context === undefined ? user = $profile;
  $: user && fetchAllPosts();

  // $: currentProfile =
  //   $profile._id === user._id
  //     ? $profile
  //     : $users.filter(contact => contact._id === user._id);

  let usersPosts = [];
  let contactsPosts = [];

  onMount(() => {
    setTimeout(() => {
      if (context === undefined) {
        user = $profile;
      }
      console.log(context);
      console.log(user);
      console.log($feedPosts);
      console.log(isLogged);
    }, 200);
  });

  const fetchAllPosts = async () => {
    console.log("fetching all posts");
    try {
      let response = await axios.get("http://localhost/posts");
      let data = response.data.data;
      console.log(data);
      if (context === undefined) {
        $feedPosts = data;
        if (!jContacts.length) {
          $feedPosts = data.filter(post => post.userID === user._id);
        }
        if (context === undefined && jContacts) {
          $feedPosts = data.filter(post => post.userID === user._id);
          jContacts.map(contact => {
            console.log(contact);
            if (contact.posts.length) {
              contact.posts.map(post => {
                console.log(post);
                $feedPosts = [...$feedPosts, post];
              });
            }
          });
          console.log($feedPosts);
        }
        console.log($feedPosts);
      } else {
        $feedPosts = "";
        $feedPosts = data.filter(post => post.userID === user._id);
        console.log($feedPosts);
      }
    } catch (error) {
      if (error) {
        console.log(error.response.data.response);
      }
    }
  };

  const fetchContactsPosts = async () => {
    console.log("fetching contacts posts");

    $contacts.forEach(contact => {
      if (contact.hasOwnProperty("posts")) {
        let contactsPosts = contact.posts.map(post => {
          let user = {
            _id: contact._id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            img: contact.img,
            status: contact.status
          };
          post.user = user;
          console.log(post);
          return post;
        });

        $feedPosts = [...$feedPosts, ...contactsPosts];
      }
    });
    // setTimeout(() => {
    console.log($feedPosts);
    // }, 200);

    fetchUsersPosts();
  };

  const fetchUsersPosts = () => {
    console.log("fetching user's posts");
    if ($profile.hasOwnProperty("posts")) {
      usersPosts = $profile.posts.map(post => {
        let user = {
          _id: $profile._id,
          firstName: $profile.firstName,
          lastName: $profile.lastName,
          img: $profile.img,
          status: $profile.status
        };
        post.user = user;

        return post;
      });

      $feedPosts = [...$feedPosts, ...usersPosts];
      console.log($feedPosts);

      $feedPosts = $feedPosts.sort(function(a, b) {
        return b.timestamp - a.timestamp;
      });
    }
  };

  // const onOpenModal = () => {
  //   $postModal.show = true;
  //   console.log($postModal);
  // };
</script>

<style>
  .posts {
    margin: 8% 0;
  }
</style>

{#if user && $feedPosts}
  <section class="posts grid">
    <!-- <FormPost {isLogged} {user} /> -->
    <FormPost {isLogged} {user} {context} />
    <!-- {#if (context = 'profile')}
      {#each $feedPosts as jPost}
        <SinglePost {jPost} context="profile" />
      {/each}
    {:else} -->
    {#each $feedPosts as jPost}
      <SinglePost {jPost} context="feed" />
    {/each}
    <!-- {/if} -->
  </section>
{/if}
