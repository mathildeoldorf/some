<script>
  import axios from "axios";
  import SearchResultsNav from "./SearchResultsNav.svelte";
  let active = false;
  let txtSearch = "";

  let ajUsers = [];

  const showSearchContainer = () => {
    active = true;
  };

  const hideSearchContainer = () => {
    setTimeout(() => {
      active = false;
      txtSearch = "";
      ajUsers = [];
    }, 200);
  };

  //CONNECT TO API TO GET DATA FROM THE SERVER
  async function getUsers() {
    if (txtSearch.length === 0) {
      ajUsers = [];
      txtSearch = "";
      return;
    }

    // GET FRESH DATA FROM API
    let response = await axios.get("http://localhost/search?term=" + txtSearch);
    let data = response.data.response;
    console.log(response);
    ajUsers = data;
  }
</script>

<style>
  #search {
    z-index: 2;
  }
  .searchInput {
    width: 3vw;
    height: 3vw;
    z-index: 1;
    font-family: FontAwesome;
    border-radius: 2vw;
    color: #000;
  }

  .searchInput.active {
    width: 110%;
    font-family: system-ui, -apple-system, BlinkMacSystemFont,
      ".SFNSText-Regular", sans-serif;
    text-align: left;
    padding: 0 10%;
  }

  .searchInput.active::placeholder {
    opacity: 0;
  }
</style>

<form id="search">
  <label for="searchInput relative bgGrey textCenter">
    <input
      class={active ? 'searchInput active' : 'searchInput'}
      placeholder="&#xF002;"
      bind:value={txtSearch}
      on:focus={showSearchContainer}
      on:blur={hideSearchContainer}
      on:input={getUsers}
      type="text" />
  </label>
</form>

<SearchResultsNav {ajUsers} {txtSearch} {active} />
