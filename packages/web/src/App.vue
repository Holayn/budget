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
    <div v-if="showScrollTop" class="fixed bottom-0 right-0 mr-4 mb-4 h-12 w-12 text-xl bg-orange-400 text-white flex items-center justify-center cursor-pointer rounded pt-2 font-bold" @click="scrollTop">
      ^
    </div>
  </div>
</template>

<script>
  import Main from './components/views/Main.vue';
  export default {
    name: 'App',
    components: {
      Main,
    },
    data() {
      return {
        showScrollTop: false,
      }
    },
    created() {
      window.document.addEventListener('scroll', () => {
        if (document.documentElement.scrollTop > 0) {
          this.showScrollTop = true;
        } else {
          this.showScrollTop = false;
        }
      });
    },
    methods: {
      scrollTop() {
        document.documentElement.scrollTop = 0;
        this.showScrollTop = false;
      }
    },
  }
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  scroll-behavior: smooth;
}
</style>
