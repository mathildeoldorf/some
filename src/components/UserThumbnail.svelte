<script>
  import { Link } from "svelte-routing";
  export let context;
  import { users } from "./../store.js";
  export let user;
  export let timestamp;

  let privacy = false;

  $: jUser = $users.filter(currentUser => currentUser._id === user._id)[0];
</script>

<style>
  .thumbnail {
    cursor: pointer;
    display: grid;
    padding: 2% 0;
    align-items: center;
    grid-gap: 1vw;
  }

  .img {
    position: relative;
    width: 2.5vw;
    height: 2.5vw;
    border-radius: 50%;
    border: solid 0.06vw #606770;
  }

  .thumbnail span {
    position: absolute;
    left: 70%;
    top: 60%;
    justify-content: center;
    align-content: center;
    width: 1.5vw;
    height: 1.5vw;
    border-radius: 50%;
  }

  .timestamp {
    font-size: 1vw;
  }

  .dropdown {
    position: relative;
    display: grid;
    background-color: #f1f2f5;
    padding: 1%;
    width: 15%;
    justify-items: center;
    align-items: center;
  }

  select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    -o-appearance: none;
    overflow: auto;
    outline: none;
    background-color: transparent;
    border: none;
    -moz-border: none;
    width: 100%;
  }

  .fa-sort-down {
    position: absolute;
    top: -20%;
    right: 5%;
    pointer-events: none;
    padding-right: 5px;
  }
</style>

{#if jUser}
  <!-- {jUser.firstName} -->
  {#if context !== 'contact'}
    <Link to="/profile/{jUser._id}">
      <div
        class="thumbnail"
        style={context === 'profile' || context === 'form' ? 'grid-template-columns: 1fr;' : 'grid-template-columns: 1fr 10fr;'}
        key={jUser._id}>
        {#if context === 'profile' || context === 'form' || context === 'modal' || context === 'nav' || context === 'notification'}
          <div
            class="img profileImage"
            style="background-image: url(/images/profile/{jUser.img})" />
          {#if context === 'profile' || context === 'modal' || context === 'nav' || context === 'notification'}
            <div class="name">
              <h3>
                {jUser.firstName} {context === 'nav' ? '' : jUser.lastName}
              </h3>
              {#if context === 'modal'}
                <div class="dropdown">
                  <select on:change={e => (privacy = e.target.value)}>
                    <option value={false}>Public</option>
                    <option value={true}>Friends</option>
                  </select>
                  <i class="fas fa-sort-down" />
                </div>
              {/if}
            </div>
          {/if}
        {:else}
          <div
            class="img"
            style="background-image: url(/images/profile/{jUser.img})">
            <span
              style={jUser.status == 1 ? 'background-color:#86DF81; border: solid 0.2vw #fff;' : 'background-color:transparent; border: none;'} />
          </div>
          <div class="name">
            <h3>{jUser.firstName} {jUser.lastName}</h3>
            {#if context === 'post'}
              <div class="timestamp">{timestamp}</div>
            {/if}
          </div>
        {/if}
      </div>
    </Link>
  {:else}
    <div
      class="thumbnail"
      style={context === 'profile' || context === 'form' ? 'grid-template-columns: 1fr;' : 'grid-template-columns: 1fr 10fr;'}
      key={jUser._id}>
      {#if context === 'profile' || context === 'form' || context === 'modal' || context === 'nav' || context === 'notification'}
        <div
          class="img profileImage"
          style="background-image: url(/images/profile/{jUser.img})" />
        {#if context === 'profile' || context === 'modal' || context === 'nav' || context === 'notification'}
          <div class="name">
            <h3>{jUser.firstName} {context === 'nav' ? '' : jUser.lastName}</h3>
            {#if context === 'modal'}
              <div class="dropdown">
                <select on:change={e => (privacy = e.target.value)}>
                  <option value={false}>Public</option>
                  <option value={true}>Friends</option>
                </select>
                <i class="fas fa-sort-down" />
              </div>
            {/if}
          </div>
        {/if}
      {:else}
        <div
          class="img"
          style="background-image: url(/images/profile/{jUser.img})">
          <span
            style={jUser.status == 1 ? 'background-color:#86DF81; border: solid 0.2vw #fff;' : 'background-color:transparent; border: none;'} />
        </div>
        <div class="name">
          <h3>{jUser.firstName} {jUser.lastName}</h3>
          {#if context === 'post'}
            <div class="timestamp">{timestamp}</div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
{/if}
