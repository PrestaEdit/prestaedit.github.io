<template>
  <router-link class="blog-tag" :to="tag.path">
    <button
      class="relative bg-white text-gray-500 border border-gray-800 p-3 rounded-lg text-sm uppercase font-semibold tracking-tight overflow-visible"
    >
      {{ tag.name }}
      <div
        class="absolute -top-3 -right-3 px-2.5 py-0.5 bg-yellow-200 rounded-full text-xs"
      >
        {{ tag.pages.length }}
      </div>
    </button>
  </router-link>
</template>

<script>
export default {
  props: ['tag'],
}
</script>
