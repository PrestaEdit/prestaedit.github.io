<template>
  <div id="vuepress-theme-blog__post-layout">
    <article
      class="vuepress-blog-theme-content"
      itemscope
      itemtype="https://schema.org/BlogPosting"
    >
      <div class="row justify-content-center">
        <div class="col-md-8">
          <header>
            <span class="text-muted">
              <PostMeta :date="$frontmatter.date" />
            </span>
            <h1 class="article-head mt-3" itemprop="name headline">
              {{ $frontmatter.title }}
            </h1>
            <p class="lead">{{ $frontmatter.description }}</p>

            <PostMeta :tags="$frontmatter.tags" />
          </header>
        </div>
      </div>

      <div class="row justify-content-center text-center mt-2 mb-2"></div>

      <div class="row justify-content-center">
        <div class="col-md-8">
          <Content itemprop="articleBody" />

          <!--<Avatar />-->
        </div>
      </div>
    </article>

    <div class="row justify-content-center">
      <div class="col-md-9">
        <Newsletter v-if="$service.email.enabled" />
        <Comment />
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-md-9">
        <Book />
      </div>
    </div>

    <Toc />
  </div>
</template>

<script>
import Toc from '@theme/components/Toc.vue'
import PostMeta from '@theme/components/PostMeta.vue'
import Avatar from '@theme/components/Avatar.vue'
import { Comment } from '@vuepress/plugin-blog/lib/client/components'
import Book from '@theme/components/Book.vue'

export default {
  components: {
    Toc,
    PostMeta,
    Book,
    //Avatar,
    Comment,
    Newsletter: () => import('@theme/components/Newsletter.vue'),
  },
}
</script>

<style lang="stylus" scoped>
@import url('https://fonts.googleapis.com/css?family=Proxima+Nova:400,400i,700&display=swap')
</style>
