<script>
  import { onMount } from "svelte";
  import axios from "axios";
  import UserThumbnail from "./UserThumbnail.svelte";
  import { jData } from "./../store.js";
  import { isAuthorised } from "./../store.js";
  import { profile } from "./../store.js";
  import { contacts } from "./../store.js";
  import { users } from "./../store.js";
  $: jUser = $profile;

  let now = Math.round(new Date().getTime() / 1000);
  $: timePast = "";
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
  let messages;
  let message = "";
  let messageText = "";

  $: jNotifications = $profile.notifications;
  $: activeAction = "";
  $: boxContent = [];
  let showActionsBox;
  let bindBoxActions;
  let showRequestActions = true;

  // NOTIFICATIONS
  $: newMessages = "";
  $: newNotifications = "";
  $: jNotificationUser = {};
  $: jChatUser = {};

  $: chats = $profile.chats;

  const checkNotifications = async () => {
    try {
      let response = await axios.get("http://localhost/notifications");
      let data = response.data.data;

      console.log(data);

      if (data.length > $profile.notifications.length) {
        newNotifications = data.length - $profile.notifications.length;
      }

      // newNotifications++;
      console.log(newNotifications);
      console.log(jNotifications);
    } catch (error) {
      console.log(error.response.data);
      // newNotifications++;
      return;
    }
  };

  const handleShowNotifications = async type => {
    try {
      let response = await axios.get("http://localhost/notifications");
      let data = response.data.data;
      if (type === notifications) {
        activeAction = "notifications";
      } else {
        activeAction = "messages";
      }

      console.log($contacts);
      console.log($profile.notifications);

      $profile.notifications = data;

      newNotifications = "";

      let reducedNotifications = $profile.notifications.reduce(
        (accumulator, item) => {
          if (item.type === "request") {
            let findNotification = accumulator.find(
              notif => notif.type === "request" && notif.userID === item.userID
            );
            if (!findNotification) {
              accumulator = [...accumulator, item];
            }
          }
          // else if (item.type === "request") {
          //   let findNotification = accumulator.find(
          //     notif => notif.type === "message" && notif.userID === item.userID
          //   );
          //   if (!findNotification) {
          //     accumulator = [...accumulator, item];
          //   }
          // }
          else {
            accumulator = [...accumulator, item];
          }

          jNotificationUser = $users.filter(
            currentUser => currentUser._id === item.userID
          )[0];

          timePast = item.timestamp < now ? now - item.timestamp : now - now;
          return accumulator;
        },
        []
      );

      console.log(jNotificationUser);
      boxContent = reducedNotifications;
      console.log(boxContent);

      showActionsBox = true;

      setTimeout(() => {
        bindBoxActions.focus();
      }, 200);
    } catch (error) {
      console.log(error.response.data);
      showActionsBox = true;
      activeAction = "notifications";
      messageText = error.response.data.response;
      console.log(message);
      console.log(messageText);
      console.log(!boxContent.length);
      return;
    }
  };

  const handleShowMessages = async () => {
    activeAction = "messages";

    newMessages = "";
    boxContent = messages.contacts;
    console.log(boxContent);
    showActionsBox = true;
    setTimeout(() => {
      bindBoxActions.focus();
    }, 200);
  };

  const checkMessages = async () => {
    try {
      let response = await axios.get("http://localhost/profile");
      let data = response.data.response;
      let accumulator = 0;

      messages = data;

      console.log(data);

      for (let i = 0; i < $profile.contacts.length; i++) {
        console.log("here");
        for (let j = 0; j < data.contacts.length; j++) {
          console.log($profile.contacts[i].chat.length);
          console.log(data.contacts[j].chat.length);
          if (
            $profile.contacts[i].chat.length < data.contacts[j].chat.length &&
            $profile.contacts[i].contactID === data.contacts[j].contactID
          ) {
            console.log("here");
            accumulator +=
              data.contacts[j].chat.length - $profile.contacts[i].chat.length;
          }
        }
      }

      console.log(accumulator);
      newMessages = accumulator;
      console.log(newMessages);
    } catch (error) {
      console.log(error.response.data);
      showActionsBox = true;
      activeAction = "notifications";
      messageText = "No messages";
      console.log(message);
      console.log(messageText);
      console.log(!boxContent.length);
      return;
    }
  };

  onMount(() => {
    if ($isAuthorised.auth) {
      setInterval(() => {
        checkNotifications();
        checkMessages();
      }, 10000);
      console.log($profile.notifications);
    }
  });

  const handleAcceptRequest = async item => {
    console.log("accepting", item);
    console.log(message);

    try {
      let response = await axios.get(
        `http://localhost/contact/accept/${item.userID}/${item._id}`
      );
      console.log(response);
      let data = response.data;

      message.innerText = data.response;
      console.log(message);

      showRequestActions = false;

      boxContent = boxContent.filter(
        currentNotification => currentNotification._id === item._id
      )[0];

      if (!boxContent.length) {
        message.innerText = "no notifications";
      }

      $contacts = [...$contacts, jNotificationUser];
    } catch (error) {
      console.log(error.response.data);
      return;
    }
  };

  const handleDeclineRequest = async item => {
    console.log("declining", item);

    console.log(message);

    let type = "declined";

    try {
      let response = await axios.delete(
        `http://localhost/contact/${item.userID}/${item._id}`
      );
      console.log(response);
      let data = response.data;

      message.innerText = data.response;
      console.log(message);

      boxContent = boxContent.filter(
        currentNotification => currentNotification._id === item._id
      )[0];

      if (!boxContent.length) {
        message.innerText = "no notifications";
      }
    } catch (error) {
      console.log(error.response.data);
      return;
    }

    showRequestActions = false;
  };

  const handleLogOut = async () => {
    console.log("logging out");
    try {
      let response = await axios.get("http://localhost/logout");
      let data = response.data;
      console.log(data);
      localStorage.clear();
      $isAuthorised.auth = localStorage.auth;
      // window.location.href = "/";
      $profile = "";
    } catch (error) {
      if (error) {
        console.log(error.response.data.response);
      }
    }
  };

  const handleDeleteProfile = async () => {
    console.log("delete profile");
    try {
      let response = await axios.delete("http://localhost/profile");
      let data = response.data;
      console.log(data);
      localStorage.clear();
      $isAuthorised.auth = localStorage.auth;
      $profile = "";
    } catch (error) {
      if (error) {
        console.log(error.response.data.response);
      }
    }
  };
</script>

<style>
  .fas,
  .fab {
    color: #000;
    font-size: 1.2vw;
    cursor: pointer;
  }
  .right {
    grid-template-columns: 3fr 1fr 1fr 1fr 1fr;
  }

  .right li {
    width: 2.5vw;
    height: 2.5vw;
    padding: 0.7vw;
    border-radius: 50%;
  }

  .counter {
    cursor: pointer;
    top: -14%;
    right: -19%;
    border-radius: 50%;
    width: 1.2rem;
    height: 1.2rem;
    font-size: 0.5vw;
    /* z-index: 1; */
  }

  .counter.messages {
    top: 18%;
    right: 11%;
  }

  .actionsBox {
    top: 0;
    width: 20%;
    background: white;
    max-height: 45vh;
    overflow: scroll;
    right: 1rem;
    outline: none;
  }
  .contentBoxItem {
    min-height: 4rem;
    transition: 0.3s ease all;
  }
  .contentBoxItem:hover {
    background: #f0f2f5;
  }

  .contentBoxItem.noContent:hover {
    background-color: transparent;
  }

  .requestButton {
    background: #e4e6eb;
    transition: 0.3s ease all;
  }

  .requestButtonAccept {
    background: #4891f0;
    color: #fff;
  }

  .requestButtonAccept:hover {
    background: #4891f0;
    color: #fff;
  }

  .requestButtonDecline:hover {
    background: #f1f2f5;
    color: #000;
  }
</style>

<ul class="right grid alignContentCenter justifyContentCenter">
  <UserThumbnail context="nav" user={jUser} />
  <li
    class="grid alignContentCenter justifyContentCenter bgGrey alignSelfCenter">
    <i class="fab fa-facebook-messenger" />
    {#if newMessages}
      <span
        on:click={handleShowMessages}
        class="absolute grid bgBlue colorWhite justifyContentCenter
        alignContentCenter counter messages">
        <p>{newMessages}</p>
      </span>
    {/if}
  </li>
  <li
    class="grid alignContentCenter justifyContentCenter bgGrey alignSelfCenter
    relative">
    <i class="fas fa-bell" on:click={handleShowNotifications} />
    {#if newNotifications}
      <span
        on:click={handleShowNotifications}
        class="absolute grid bgBlue colorWhite justifyContentCenter
        alignContentCenter counter">
        <p>{newNotifications}</p>
      </span>
    {/if}
  </li>
  <li
    class="grid alignContentCenter justifyContentCenter bgGrey alignSelfCenter">
    <i on:click={handleLogOut} class="fas fa-sign-out-alt" />
  </li>
  <li
    class="grid alignContentCenter justifyContentCenter bgGrey alignSelfCenter">
    <i on:click={handleDeleteProfile} class="fas fa-trash-alt" />
  </li>
</ul>
{#if showActionsBox}
  <div
    bind:this={bindBoxActions}
    class="actionsBox grid absolute containerWhiteShadow"
    tabindex="0"
    on:blur={setTimeout(() => {
      showActionsBox = false;
      activeAction = undefined;
    }, 200)}>
    {#if !newNotifications && !boxContent.length}
      <div
        class="contentBoxItem noContent paddingMedium textCenter grid
        alignContentCenter">
        <p bind:this={message}>You have no notifications</p>
      </div>
    {/if}
    {#if boxContent.length}
      {#each boxContent as item}
        {#if activeAction === 'notifications'}
          <div class="contentBoxItem paddingMedium">
            <div class="notificationItem ">
              {#if item.type === 'request'}
                <span class="grid time textRight paddingHorizontalSmall">
                  {convertTime(timePast)}
                </span>
                <UserThumbnail
                  context="notification"
                  user={jNotificationUser} />
                <p bind:this={message} class="font-normal">{item.body}</p>
                {#if showRequestActions && !$profile.contacts.find(contact => contact.contactID === item.userID && contact.status !== 'pending')}
                  <div
                    class="grid gridTwoColumn gridGapSmall paddingVerticalSmall">
                    <button
                      class="requestButton requestButtonAccept colorWhite"
                      on:click={handleAcceptRequest(item)}>
                      <p>Accept</p>
                    </button>
                    <button
                      class="requestButton requestButtonDecline"
                      on:click={handleDeclineRequest(item)}>
                      <p>Decline</p>
                    </button>
                  </div>
                {/if}
              {/if}
            </div>
          </div>
        {/if}
        {#if activeAction === 'messages'}
          <div class="contentBoxItem paddingMedium">
            <div class="notificationItem ">
              {#if item.type === 'message'}
                <span class="grid time textRight paddingHorizontalSmall">
                  {convertTime(timePast)}
                </span>
                <UserThumbnail
                  context="notification"
                  user={jNotificationUser} />
                <p bind:this={message} class="font-normal">{item.body}</p>
              {/if}
            </div>
          </div>
        {/if}
      {/each}
    {/if}
  </div>
{/if}
