export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'nuxt-ssg-starter',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', type: 'text/css', href: '/css/bootstrap/css/bootstrap.min.css' },
      { rel: 'stylesheet', type: 'text/css', media: 'all', href: '/css/star-rating.min.css' },
    ],
    script: [
      { src: "/scripts/lib/jquery-2.1.4.min.js" },
      { src: "/scripts/lib/jquery.mCustomScrollbar.js" },
      { src: "/scripts/config.js?v=20210923" },
      { src: "https://s9.cnzz.com/z_stat.php?id=1278903868&web_id=1278903868" },
      { src: "/scripts/lib/amazeui.min.js" },
      { src: "/css/bootstrap/js/bootstrap-pager.js" },
      { src: "/scripts/lib/reconnecting-websocket.min.js" },
      { src: "/scripts/lib/star-rating.min.js" },
      { src: "/scripts/lib/jscolor.min.js" },
      { src: "/scripts/require.js", class: "current", 'data-page':"yy", 'data-link':"T",' data-main':"/scripts/main" },
      { src: "/scripts/midPage.js" },
      { src: "https://browser.sentry-cdn.com/6.19.6/bundle.tracing.min.js", crossorigin: "anonymous", type:"application/javascript", charset:"UTF-8" },
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  router: {
    middleware: 'i18n'
  },
  plugins: ['~/plugins/i18n.js'],
  generate: {
    routes: ['/', '/about', '/fr', '/fr/about']
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
