<script>
  import axios from "axios";
  import Message from "./Message.svelte";

  import { isAuthorised } from "./../store.js";

  // $: auth = $isAuthorised.auth;

  // let isAuthorised = localStorage.auth;
  let isMessage = false;
  let messageText = "";
  let messageType = "";

  let context = "signup";
  let firstName = "";
  let lastName = "";
  let email = "";
  let password = "";
  let repeatPassword = "";

  let frm;

  let isFormValid;

  const validateForm = () => {
    isFormValid = compValidator.validateForm(frm);
    isFormValid ? console.log("valid") : console.log("not valid");
  };

  const handleSubmit = () => {
    console.log(context);
    if (context === "signup") {
      signup();
      return;
    }
    login();
  };

  const handleShowMessage = (type, message) => {
    isMessage = true;
    messageType = type;
    messageText = message;
  };

  const signup = async () => {
    // console.log(auth, "here");
    try {
      let response = await axios.post("http://localhost/signup", {
        firstName,
        lastName,
        email,
        password,
        repeatPassword
      });

      let data = response.data;
      $isAuthorised.auth = localStorage.auth;
      console.log(data);
    } catch (error) {
      if (error) {
        console.log(error.response.data.response);
        handleShowMessage("error", error.response.data.response);
      }
    }
  };

  const login = async () => {
    try {
      let response = await axios.post("http://localhost/login", {
        email,
        password
      });

      let data = response.data;
      console.log(response);
      console.log(data);

      localStorage.setItem("token", data.token);
      localStorage.setItem("auth", data.auth);
      console.log(localStorage);
      $isAuthorised.auth = localStorage.auth;
      console.log($isAuthorised.auth);
    } catch (error) {
      if (error) {
        console.log(error.response.data.response);
        handleShowMessage("error", error.response.data.response);
      }
    }
  };

  const forgottenPassword = () => {
    console.log("forgotten password");
  };
</script>

<style>
  .formPublic {
    display: grid;
    height: 100vh;
    margin-top: 9vh;
  }

  form {
    height: 70%;
    background-color: #fff;
    padding: 7% 10%;
    border-radius: 1vw;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1), 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  #frmLogin {
    height: 60%;
  }

  @media screen and (max-width: 1000px) {
    .formPublic {
      margin-top: 0vh;
      height: 60vh;
    }

    form {
      align-self: flex-start;
    }
  }
</style>

{#if isMessage}
  <Message {isMessage} {messageType} {messageText} />
{/if}
{#if context === 'login'}
  <section class="formPublic login">
    <form
      bind:this={frm}
      id="frmLogin"
      class="grid alignItemsCenter alignSelfCenter gridGapSmall"
      on:submit|preventDefault={handleSubmit}
      on:input={email && password ? validateForm : null}>
      <h2>Login</h2>
      <span class="errorMessage" id="emailError" />
      <input
        type="email"
        name="email"
        id="email"
        placeholder="Email"
        data-validate="email"
        data-min="6"
        data-max="50"
        data-error="Please enter a valid e-mail"
        bind:value={email} />
      <span class="errorMessage" id="passwordError" />
      <input
        type="password"
        name="password"
        id="password"
        placeholder="Password"
        data-validate="password"
        data-min="8"
        data-max="20"
        data-error="Your password must be between 8 and 20 characters"
        bind:value={password} />
      <button
        type="submit"
        class={isFormValid ? 'active' : ''}
        disabled={!isFormValid}>
        Log in
      </button>
      <button type="button" on:click={forgottenPassword}>
        Forgotten your password?
      </button>
      <button type="button" on:click={() => (context = 'signup')}>
        Not signed up?
      </button>
    </form>
  </section>
{:else}
  <section class="formPublic signup">
    <form
      bind:this={frm}
      id="frmSignup"
      class="grid alignItemsCenter alignSelfCenter gridGapSmall"
      on:submit|preventDefault={handleSubmit}
      on:input={firstName && lastName && email && password && repeatPassword ? validateForm : null}>
      <h2>Sign up</h2>
      <span class="errorMessage" id="firstNameError" />
      <input
        type="text"
        name="firstName"
        id="firstName"
        placeholder="First name"
        data-validate="string"
        data-min="2"
        data-max="50"
        data-error="Your first name must be between 2 and 50 characters"
        bind:value={firstName} />
      <span class="errorMessage" id="lastNameError" />
      <input
        type="text"
        name="lastName"
        id="lastName"
        placeholder="Last name"
        data-validate="string"
        data-min="2"
        data-max="50"
        data-error="Your last name must be between 2 and 50 characters"
        bind:value={lastName} />
      <span class="errorMessage" id="emailError" />
      <input
        type="email"
        name="email"
        id="email"
        placeholder="Email"
        data-validate="email"
        data-min="6"
        data-max="50"
        data-error="Please provide a valid e-mail"
        bind:value={email} />
      <span class="errorMessage" id="passwordError" />
      <input
        type="password"
        name="password"
        id="password"
        placeholder="Password"
        data-validate="password"
        data-min="8"
        data-max="20"
        data-error="Your password must be between 8 and 20 characters"
        bind:value={password} />
      <span class="errorMessage" id="repeatPasswordError" />
      <input
        type="password"
        name="repeatPassword"
        id="repeatPassword"
        placeholder="Repeat password"
        data-validate="repeatPassword"
        data-min="8"
        data-max="20"
        data-error="Your passwords must match"
        bind:value={repeatPassword} />
      <button
        type="submit"
        class={isFormValid ? 'active' : ''}
        disabled={!isFormValid}>
        Sign up
      </button>
      <button type="button" on:click={() => (context = 'login')}>
        Already a user?
      </button>
    </form>
  </section>
{/if}
