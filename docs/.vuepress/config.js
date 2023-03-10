module.exports = {
  title: 'Blog',
  base: '/',
  description: 'PrestaEdit | Blog',
  logo: './assets/img/logo.png',
  theme: require.resolve('../../'),
  themeConfig: {
    authors: [
      {
      name: 'PrestaEdit',
      avatar: '/assets/img/avatar.png',
      link: 'https://twitter.com/PrestaEdit',
      linktext: 'Suivre',
      },
    ],
    globalPagination: {
      lengthPerPage: 6,
      prevText: 'Précédent',
      nextText: 'Suivant'
    },
    dateFormat: 'LL',
    smoothScroll: true,
    comment: {
      // Which service you'd like to use
      service: 'vssue',
      // The owner's name of repository to store the issues and comments.
      owner: 'PrestaEdit',
      // The name of repository to store the issues and comments.
      repo: 'prestaedit.github.io',
      // The clientId & clientSecret introduced in OAuth2 spec.
      clientId: '43fe6e41a3fa438c8387',
      clientSecret: '61e5fbaa4e0c7bff568363dfa061cc35ee5c7a89',
    },
    feed: {
      canonical_base: 'https://prestaedit.github.io/',
    },
  },
  plugins: [
    '@vuepress/last-updated',
    '@vuepress/medium-zoom',
    "@kawarimidoll/tailwind",
  ],
}
