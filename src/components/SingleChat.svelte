<script>
  import axios from "axios";
  import io from "socket.io-client";
  import { onMount } from "svelte";
  import UserThumbnail from "./UserThumbnail.svelte";
  import { profile } from "./../store.js";
  import { contacts } from "./../store.js";
  export let open;
  export let user;

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

  const calculateTimePast = timestamp => {
    timePast = timestamp < now ? now - timestamp : now - now;
    return convertTime(timePast);
  };

  let message = "";
  let sender = "";
  let chatTextarea;

  const socket = io.connect("http://localhost:80");

  $: chatMessages = [];

  $: isActive = $profile.chats.filter(
    activeChat => activeChat._id === user._id
  )[0];

  $: jCurrentContact = $profile.contacts.filter(
    currentContact => currentContact.contactID === user._id
  )[0];

  let reaction;
  let chatHistory;

  const handleGetMessages = async () => {
    console.log("fetching chat messages");

    try {
      let response = await axios.get(
        `http://localhost/messages/${jCurrentContact.contactID}`
      );

      let data = response.data;
      console.log(data);
      jCurrentContact.chat = data.messages;
      chatMessages = [];
      chatMessages = data.messages;

      // chatMessages.forEach(chatMessage => {
      //   timePast =
      //     chatMessage.timestamp < now ? now - chatMessage.timestamp : now - now;
      //   console.log(timePast);
      // });
      // chatHistory = chatMessages;
      chatHistory.scrollTop =
        chatHistory.scrollHeight + chatHistory.scrollHeight;
      console.log(data.messages);
      console.log(jCurrentContact.contactID);
      console.log(jCurrentContact.chat);
      console.log(chatHistory);
      socket.emit("chatRoom", $profile._id, jCurrentContact.contactID);
    } catch (err) {
      console.log(err.response.data);
      return;
    }
  };

  onMount(() => {
    console.log(user._id);
    console.log($profile.contacts);
    console.log(jCurrentContact);
    setTimeout(() => {
      handleGetMessages();
    }, 200);
  });

  const handleClose = () => {
    console.log("closing chats");
    let jUpdateChats = $profile.chats.filter(
      currentChat => currentChat._id !== user._id
    );
    $profile.chats = jUpdateChats;

    socket.emit("leaveRoom", $profile._id, jCurrentContact.contactID);
    console.log($profile.chats);
  };

  const handleToggle = () => {
    message = "";
    console.log("toggling");
    open = !open;
    isActive.open = open;
    console.log($profile.chats);
  };

  // SENDING A MESSAGE VIA SOCKET - EMITTING THE EVENT OF MESSAGE TO THE SOCKET
  const handleSendMessage = (e, message, sender) => {
    chatTextarea.value = "";
    let timestamp = Math.round(new Date().getTime() / 1000);

    console.log(sender);
    console.log(jCurrentContact);

    message = {
      sender: sender._id,
      message: message,
      timestamp: timestamp
    };

    chatHistory.scrollTop = chatHistory.scrollHeight + chatHistory.scrollHeight;

    console.log($profile._id);
    socket.emit("message", $profile._id, jCurrentContact.contactID, message);
  };

  // RECIEVING THE EVENT OF MESSAGE FROM THE SOCKET

  socket.on("message", data => {
    console.log("message", data);
    chatMessages = [...chatMessages, data.message];
    jCurrentContact.chat.messages = chatMessages;
    console.log(jCurrentContact);
  });
</script>

<style>
  .singleChat {
    width: 100%;
    height: 100%;
    height: 45vh;
    z-index: 1;
    background-color: #fff;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    padding: 0;
  }

  .fa-window-minimize {
    padding-bottom: 0.8vw;
  }

  .header {
    box-shadow: 0 3px 3px rgba(0, 0, 0, 0.1), 0 2px 3px rgba(0, 0, 0, 0.1);
    max-height: 15%;
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
    padding: 1vw;
    border-radius: 0.5vw;
    border: none;
    outline: none;
    font-size: calc(0.5rem + 50%);
  }

  .messageContainer {
    display: grid;
    height: 25%;
  }

  .body::placeholder {
    color: #a7adb4;
    font-weight: 100;
  }

  .fas,
  .far {
    font-size: 1.2vw;
  }

  .main {
    height: 85%;
    padding: 5% 5% 0 5%;
  }

  .chatHistory {
    max-height: 20vw;
  }
</style>

{#if open === true}
  <div
    class="singleChat justifySelfCenter alignSelfCenter containerWhiteShadow">
    <div
      class="header grid gridTwoThirds
      paddingHorizontalMediumpaddingVerticalSmall">
      <UserThumbnail context="chat" {user} />
      <div
        class="actions grid gridTwoColumn justifyItemsRight alignItemsCenter">
        <i on:click={handleToggle} class="far fa-window-minimize grid" />
        <i on:click={handleClose} class="fas fa-times grid" />
      </div>
    </div>
    <div class="main grid">
      <div bind:this={chatHistory} class="chatHistory grid scroll">
        {#each chatMessages as chatMessage}
          {#if chatMessage.sender === user._id}
            <div class="container">
              <div
                class="messageContainer gridOneHalfFourth gridGapMedium
                alignItemsCenter">
                <UserThumbnail context="form" {user} />
                {#if chatMessage.message === '<3'}
                  <i
                    class="fas fa-heart grid alignSelfCenter justifySelfStart" />
                {:else if chatMessage.message === ':like:'}
                  <i
                    class="fas fa-thumbs-up grid alignSelfCenter
                    justifySelfStart" />
                {:else}
                  <p class="message recieved justifySelfStart">
                    {chatMessage.message}
                  </p>
                {/if}
                <div />
              </div>
              <span class="grid time textRight paddingVerticalSmall">
                {calculateTimePast(chatMessage.timestamp)}
              </span>
            </div>
          {:else if chatMessage.sender === $profile._id}
            <div class="container">
              <div
                class="messageContainer gridGapMedium gridThreeHalfFourths
                alignItemsCenter">
                {#if chatMessage.message === '<3'}
                  <i class="fas fa-heart grid alignSelfCenter justifySelfEnd" />
                {:else if chatMessage.message === ':like:'}
                  <i
                    class="fas fa-thumbs-up grid alignSelfCenter justifySelfEnd" />
                {:else}
                  <p class="message bgBlue colorWhite justifySelfEnd">
                    {chatMessage.message}
                  </p>
                {/if}
                <UserThumbnail context="form" user={$profile} />
              </div>
              <div />
              <span class="grid time textLeft paddingVerticalSmall">
                {calculateTimePast(chatMessage.timestamp)}
              </span>
            </div>
          {/if}
        {/each}
      </div>
      <form class="form grid gridThreeFourth gridGapSmall alignSelfEnd">
        <textarea
          bind:value={message}
          bind:this={chatTextarea}
          name="body"
          class="body paddingSmall bgGrey"
          placeholder="What would you like to say to {user.firstName}?"
          on:keyup={e => (e.keyCode == 13 ? handleSendMessage(e, message, (sender = $profile)) : console.log(e.target.value))} />
        <div
          class="actions grid gridTwoColumn gridGapSmall justifyItemsCenter
          alignItemsCenter">
          <i
            on:click={(e, message) => handleSendMessage(e, (message = ':like:'), (sender = $profile))}
            class="fas fa-thumbs-up" />
          <i
            on:click={(e, message) => handleSendMessage(e, (message = '<3'), (sender = $profile))}
            class="fas fa-heart" />
        </div>
      </form>
    </div>
  </div>
{/if}
