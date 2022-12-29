<script>
  export default {
    props: ['title']
  }
</script>

<style type="text/css">
  .alert-info {
    color: #0c5460;
    background-color: #d1ecf1;
    border: 0;
    border-color: #bee5eb;
    border-left-width: .5rem;
    border-left-style: solid;
    margin: 1rem 0;
    font-size: 16px;
  }
</style>

<template>
  <div class="alert alert-info">
    {{ title }}
  </div>
</template>
