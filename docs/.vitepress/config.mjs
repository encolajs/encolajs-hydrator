import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "EncolaJS Hydrator",
  description: "Documentation for EncolaJS Hydrator",
  base: "/hydrator/",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Installation', link: '/guide/' },
          { text: 'Casting Manager', link: '/guide/casting-manager' },
          { text: 'Class builder', link: '/guide/class-builder' },
          { text: 'Base model class', link: '/guide/base-model' },
          { text: 'Base collection class' , link: '/guide/base-collection'},
        ]
      }
    ],
    footer: {
      message: 'MIT Licensed',
      copyright:
        'Copyright © 2025-present EncolaJS & Contributors',
    },
  }
}) 