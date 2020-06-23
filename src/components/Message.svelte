<script>
  import { onMount } from "svelte";
  export let messageType;
  export let messageText;
  export let isMessage;

  onMount(() => {
    console.log("i'm mounted");
    document.querySelector(".message").classList.add("show");
    // setTimeout(() => {
    //   document.querySelector(".message").classList.remove("show");
    //   document.querySelector(".message").classList.add("hidden");
    // }, 2000);
  });
</script>

<style>
  .message {
    position: absolute;
    right: 1%;
    opacity: 0;
    border-radius: 1vw;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1), 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 1;
    width: 14vw;
    display: grid;
    align-content: center;
    height: 6vw;
    color: white;
    border: solid 3px #4891f0;
    transition: 5s ease-in-out;
    background-color: #4891f0;
    color: #fff;
  }

  .message.show {
    opacity: 1;
    transition: 5s ease-in-out;
    animation-name: example;
    animation-duration: 4s;
    animation-fill-mode: forwards;
  }

  @keyframes example {
    0% {
      top: -10vw;
    }
    20% {
      top: 10vh;
    }
    80% {
      top: 10vh;
    }
    100% {
      top: -10vw;
    }
  }

  .message.hidden {
    top: 0%;
  }

  /* .hidden {
    display: none;
    top: 0%;
  } */

  /* .error {
    background-color: red;
  } */

  /* .valid {
    background-color: green;
  } */
</style>

<div
  id="message"
  class={isMessage ? messageType + ' message paddingSmall show bgBlue' : 'message paddingSmall'}>
  {messageText}
</div>
