module.exports = {
  title: 'PrestaEdit | Blog',
  base: 'https://prestaedit.github.io/',
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
    sitemap: {
      hostname: 'https://prestaedit.github.io/'
    },
    globalPagination: {
      lengthPerPage: 6,
      prevText: 'Précédent',
      nextText: 'Suivant'
    },
    dateFormat: 'LL',
    smoothScroll: true
  },
}
