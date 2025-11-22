import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Relation Explorer',
  description: 'Obsidian plugin for visualizing parent-child note relationships',
  base: '/relations-obsidian/',


  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Guide', link: '/guide/usage' },
      { text: 'API Reference', link: '/reference/api' },
      { text: '❤️ Sponsor', link: '/support' },
      { text: 'GitHub', link: 'https://github.com/bright-fakl/relations-obsidian' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Features', link: '/features' }
        ]
      },
      {
        text: 'User Guide',
        items: [
          { text: 'Basic Usage', link: '/guide/usage' },
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'Using the Sidebar', link: '/guide/sidebar' },
          { text: 'Embedding Trees', link: '/guide/codeblocks' },
          { text: 'Navigation Commands', link: '/guide/navigation' },
          { text: 'Context Menu', link: '/guide/context-menu' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'API Reference', link: '/reference/api' }
        ]
      },
      {
        text: 'Support',
        items: [
          { text: '❤️ Support This Project', link: '/support' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/bright-fakl/relations-obsidian' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Fabian Kloosterman'
    },

    search: {
      provider: 'local'
    }
  }
})