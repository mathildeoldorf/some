<script>
  import axios from "axios";
  import { isAuthorised } from "./../store.js";
  import Message from "./Message.svelte";

  let email;
  let password;
  let frm;
  let isFormValid;
  let isMessage = false;
  let messageText = "";
  let messageType = "";

  const validateForm = () => {
    isFormValid = compValidator.validateForm(frm);
    isFormValid ? console.log("valid") : console.log("not valid");
    console.log(isFormValid);
  };

  const handleShowMessage = (type, message) => {
    isMessage = true;
    messageType = type;
    messageText = message;
    // setTimeout(() => {
    //   isMessage = false;
    // }, 4000);
  };

  const login = async () => {
    try {
      let response = await axios.post("http://localhost/login", {
        email,
        password
      });

      let data = response.data;
      console.log(data);

      localStorage.setItem("token", data.token);
      localStorage.setItem("auth", data.auth);
      $isAuthorised.auth = localStorage.auth;
    } catch (error) {
      if (error) {
        console.log(error.response.data.response);
        handleShowMessage("error", error.response.data.response);
      }
    }
  };
</script>

<style>
  form {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 2%;
  }
</style>

{#if isMessage}
  <Message {isMessage} {messageType} {messageText} />
{/if}

<form
  id="frmNav"
  bind:this={frm}
  on:submit|preventDefault={login}
  on:input={email && password ? validateForm : null}>
  <div>
    <span class="errorMessage" id="emailNavError" />
    <input
      type="email"
      name="email"
      id="emailNav"
      placeholder="Email"
      data-validate="email"
      data-min="6"
      data-max="50"
      data-error="Please provide a valid e-mail"
      bind:value={email} />
  </div>
  <div>
    <span class="errorMessage" id="passwordNavError" />
    <input
      type="password"
      name="password"
      id="passwordNav"
      placeholder="Password"
      data-validate="password"
      data-min="8"
      data-max="20"
      data-error="Your password must be between 8 and 20 characters"
      bind:value={password} />
  </div>
  <button class="active" type="submit">Log in</button>
</form>
