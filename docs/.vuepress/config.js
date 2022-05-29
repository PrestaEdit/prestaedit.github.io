module.exports = {
  title: 'PrestaEdit | Blog',
  base: '/',
  description: 'PrestaEdit | Blog',
  logo: './assets/img/logo.jpg',
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
