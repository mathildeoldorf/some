<script>
  import FormPublic from "./../components/FormPublic.svelte";
  import Greeting from "./../sections/Greeting.svelte";
</script>

<style>
  .public {
    grid-gap: 4%;
    min-height: 100vh;
    height: 100vh;
    align-content: center;
    padding: 0 10%;
    /* margin: 2vh 0; */
  }

  @media screen and (max-width: 1000px) {
    .public {
      grid-template-columns: 1fr;
      justify-items: center;
      height: auto;
      margin: 2vh 0;
    }
  }
</style>

<section class="public grid gridTwoColumn">
  <Greeting />
  <FormPublic />
</section>
