import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "EncolaJS Hydrator",
  description: "Documentation for EncolaJS Hydrator",
  base: "/hydrator/",
  head: [
    ['link', { rel: 'icon', href: '/hydrator/favicon.ico' }],
    [
      'script',
      {
        async: true,
        src: 'https://www.googletagmanager.com/gtag/js?id=G-4CP1E3Z3Q0',
      },
    ],
    [
      'script',
      {},
      "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);};gtag('js', new Date());gtag('config', 'G-4CP1E3Z3Q0');",
    ],
  ],
  themeConfig: {
    search: {
      provider: 'local'
    },
    editLink: {
      pattern: 'https://github.com/encolajs/encolajs-hydrator/tree/main/docs/:path'
    },
    logo: '/logo.png',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/encolajs/encolajs-hydrator' },
    ],
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/introduction.md' },
      { text: 'API', link: '/api/' },
      { text: 'More...',
        items: [
          {text: 'EncolaJS Enforma', link: 'https://encolajs.com/enforma/'},
          {text: 'EncolaJS Validator', link: 'https://encolajs.com/validator/'},
        ]
      },
    ],
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/introduction' }
          ]
        },
        {
          text: 'Type Casting',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/type-casting/' },
            { text: 'CastingManager', link: '/type-casting/casting-manager' },
            { text: 'Built-in Casters', link: '/type-casting/built-in-casters' },
            { text: 'Custom Casters', link: '/type-casting/custom-casters' }
          ]
        },
        {
          text: 'Models',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/models/' },
            { text: 'BaseModel', link: '/models/base-model' },
            { text: 'Best practices', link: '/models/best-practices' }
          ]
        },
        {
          text: 'Collections',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/collections/' },
            { text: 'BaseCollection', link: '/collections/base-collection' },
          ]
        },
        {
          text: 'Advanced',
          collapsed: false,
          items: [
            { text: 'ClassBuilder', link: '/advanced/class-builder' },
            { text: 'Mixins', link: '/advanced/mixins' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'CastingManager', link: '/api/casting-manager' },
            { text: 'BaseModel', link: '/api/base-model' },
            { text: 'BaseCollection', link: '/api/base-collection' },
            { text: 'ClassBuilder', link: '/api/class-builder' }
          ]
        }
      ]
    },
    footer: {
      message: 'MIT Licensed',
      copyright:
        'Copyright © 2025-present EncolaJS & Contributors',
    },
  }
}) 