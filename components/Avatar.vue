<template>
  <div v-if="$themeConfig.authors">
    <span v-for="author in $themeConfig.authors" :key="author.name">
      <div class="d-flex align-items-center">
        <a class="profile-avatar">
          <span class="avatar-image"><GithubIcon class="github-icon" /></span>
          <!--<img v-if="author.name === $frontmatter.author" :src="($withBase)(author.avatar)" class="avatar-image" :alt="author.name">-->
        </a>
        <div v-if="author.name === $frontmatter.author">
          <span>{{ author.name }}</span> &nbsp;
          <NavLink
            v-if="author.name === $frontmatter.author"
            :link="author.link"
            class="btn btn-sm btn-outline-dark"
            ><TwitterIcon /> {{ author.linktext }}</NavLink
          >
        </div>
      </div>
    </span>
  </div>
</template>

<script>
import { TwitterIcon, GithubIcon } from 'vue-feather-icons'

export default {
  components: { TwitterIcon, GithubIcon },
}
</script>
