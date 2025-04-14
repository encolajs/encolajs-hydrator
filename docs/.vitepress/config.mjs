import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "EncolaJS Hydrator",
  description: "Documentation for EncolaJS Hydrator",
  base: "/hydrator/",
  themeConfig: {
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' }
          ]
        },
        {
          text: 'Type Casting',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/guide/type-casting/' },
            { text: 'CastingManager', link: '/guide/type-casting/casting-manager' },
            { text: 'Built-in Casters', link: '/guide/type-casting/built-in-casters' },
            { text: 'Custom Casters', link: '/guide/type-casting/custom-casters' }
          ]
        },
        {
          text: 'Models',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/guide/models/' },
            { text: 'BaseModel', link: '/guide/models/base-model' },
            { text: 'Best practices', link: '/guide/models/best-practices' }
          ]
        },
        {
          text: 'Collections',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/guide/collections/' },
            { text: 'BaseCollection', link: '/guide/collections/base-collection' },
          ]
        },
        {
          text: 'Advanced',
          collapsed: false,
          items: [
            { text: 'ClassBuilder', link: '/guide/advanced/class-builder' },
            { text: 'Mixins', link: '/guide/advanced/mixins' },
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