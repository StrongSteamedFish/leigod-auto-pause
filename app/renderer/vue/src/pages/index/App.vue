<template>
  <LeigodAutoPause/>
</template>

<script>
import LeigodAutoPause from '../../components/LeigodAutoPause.vue'

export default {
  name: 'App',
  components: {
    LeigodAutoPause
  }
}
</script>

<style>
*{
  margin: 0;
  padding: 0;
}
#app {
  background-color: #F1F3F5;
  user-select: none;
  /* width: 100vw; */
}
</style>
