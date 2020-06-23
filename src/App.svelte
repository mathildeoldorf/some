<script>
  import { onMount } from "svelte";
  import axios from "axios";
  import Nav from "./components/Nav.svelte";
  import NavPublic from "./components/NavPublic.svelte";
  import Main from "./pages/Main.svelte";
  import Chats from "./sections/Chats.svelte";
  import Public from "./pages/Public.svelte";
  import Message from "./components/Message.svelte";
  import { profile } from "./store.js";
  import { contacts } from "./store.js";
  import { users } from "./store.js";

  import { isAuthorised } from "./store.js";
  $: auth = $isAuthorised.auth ? $isAuthorised.auth : false;
  $: token = $isAuthorised.token;
  $: user = $profile;
  $: jUsers = $users;
  $: jContacts = $contacts;

  const fetchUser = async () => {
    console.log("fetching user");
    try {
      let response = await axios.get("http://localhost/profile");
      user = response.data.response;

      $profile = user;
      user = $profile;
      console.log(user);
    } catch (error) {
      if (error) {
        console.log(error.response.data.response);
      }
    }
  };

  const fetchUsers = async () => {
    console.log("fetching all users");
    try {
      let response = await axios.get("http://localhost/users");
      let data = response.data.data;

      $users = data;
      console.log($users);
    } catch (error) {
      if (error) {
        console.log(error.response.data.response);
      }
    }
  };

  const fetchContacts = async () => {
    console.log("fetching contacts");
    try {
      let response = await axios.get("http://localhost/contacts");
      let data = response.data.data;

      console.log(data);

      $contacts = data;
      console.log($contacts);
    } catch (error) {
      if (error) {
        console.log(error.response.data.response);
      }
    }
  };

  const fetchNotifications = async () => {
    console.log("fetching notifications");
    try {
      let response = await axios.get("http://localhost/notifications");
      let data = response.data.data;

      $profile.notifications = data;
      console.log($profile.notifications);
    } catch (error) {
      if (error) {
        console.log(error.response.data.response);
      }
    }
  };

  const handleLogOut = async () => {
    console.log("logging out");
    try {
      let response = await axios.get("http://localhost/logout");
      let data = response.data;
      console.log(data);
      localStorage.clear();
      $isAuthorised.auth = localStorage.auth;
    } catch (error) {
      if (error) {
        console.log(error.response.data.response);
      }
    }
  };

  if (localStorage.getItem("auth")) {
    let authenticated = localStorage.getItem("auth");
    setTimeout(() => {
      auth = localStorage.getItem("auth");
    }, 100);
  }
  if (localStorage.getItem("token")) {
    let token = localStorage.getItem("token");
    $isAuthorised.token = token;
    axios.defaults.headers.common = { Authorization: `Bearer ${token}` };
    fetchUsers();
    fetchUser();
    fetchContacts();
    fetchNotifications();

    setTimeout(() => {
      handleLogOut();
    }, 86400000);
  }
</script>

<style>

</style>

<main>

  {#if auth && token && user}
    <Nav />
    <!-- <Main {user} /> -->
    <!-- <Chats /> -->
  {:else}
    <NavPublic />
    <Public />
  {/if}
</main>
