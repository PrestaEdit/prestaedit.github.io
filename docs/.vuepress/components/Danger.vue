<script>
  export default {
    props: ['title']
  }
</script>

<style type="text/css">
  .alert-danger {
    background-color: rgba(255, 121, 100, 0.3);
    color: #6b1000;
    border: 0;
    border-color: #e74100;
    border-left-width: .5rem;
    border-left-style: solid;
    margin: 1rem 0;
    font-size: 16px;
  }
</style>

<template>
  <div class="alert alert-danger">
    {{ title }}
  </div>
</template>
