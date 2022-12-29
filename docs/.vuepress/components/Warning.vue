<script>
  export default {
    props: ['title']
  }
</script>

<style type="text/css">
  .alert-warning {
    background-color: rgba(255,229,100,.3);
    color: #6b5900;
    border: 0;
    border-color: #e7c000;
    border-left-width: .5rem;
    border-left-style: solid;
    margin: 1rem 0;
    font-size: 16px;
  }
</style>

<template>
  <div class="alert alert-warning">
    {{ title }}
  </div>
</template>
