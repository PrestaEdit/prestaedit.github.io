module.exports = {
  title: '| Blog',
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
    smoothScroll: true
  },
  plugins: [
    "@kawarimidoll/tailwind",
  ],
}
