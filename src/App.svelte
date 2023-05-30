<script lang="ts">
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'
</script>

<main>
  <div class="card">
    <Counter />
  </div>

  <div>
    <canvas id="renderArea"></canvas>
  </div>
  
  <div id="modal" class="overlay" style="background: red; bottom: 64px; right: 64px; width: 512px; height: 512px;">
    <canvas id="renderAreaModal"></canvas>
  </div> 

</main>

<style>

</style>
