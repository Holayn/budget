<template>
  <div>
    <header>
      <div class="flex justify-center py-2">
        <h1 class="text-4xl text-bold">Finances</h1>
      </div>
    </header>
    <Main/>
    <footer class="py-8">
      <div class="flex justify-center">
        <p class="text-xs">Made by Kai</p>
      </div>
    </footer>
  </div>
</template>

<script>
  import Main from './components/views/Main.vue';
  export default {
    name: 'App',
    components: {
      Main,
    },
  }
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
