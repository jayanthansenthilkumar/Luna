/**
 * Root Layout
 * 
 * This layout wraps every page in your application.
 * Use it for shared UI like headers, footers, and navigation.
 */
module.exports = function RootLayout({ children }) {
  return {
    tag: 'html',
    props: { lang: 'en' },
    children: [
      {
        tag: 'head',
        props: {},
        children: [
          { tag: 'meta', props: { charset: 'UTF-8' }, children: [] },
          { tag: 'meta', props: { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }, children: [] },
          { tag: 'title', props: {}, children: ['LUNA - Universal JavaScript Operating Runtime'] },
          { tag: 'meta', props: { name: 'description', content: 'One Language. One Runtime. Every Platform. LUNA is a unified JavaScript runtime for backend, frontend, mobile, desktop, and edge.' }, children: [] },
          { tag: 'link', props: { rel: 'stylesheet', href: '/__luna/globals.css' }, children: [] },
          { tag: 'link', props: { rel: 'preconnect', href: 'https://fonts.googleapis.com' }, children: [] },
          { tag: 'link', props: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap' }, children: [] }
        ]
      },
      {
        tag: 'body',
        props: {},
        children: [
          {
            tag: 'nav',
            props: { className: 'navbar' },
            children: [
              {
                tag: 'div',
                props: { className: 'nav-inner' },
                children: [
                  {
                    tag: 'div',
                    props: { className: 'nav-brand' },
                    children: [
                      {
                        tag: 'a', props: { href: '/' }, children: [
                          { tag: 'span', props: { className: 'luna-logo' }, children: ['◐'] },
                          { tag: 'span', props: { className: 'luna-wordmark' }, children: [' LUNA'] }
                        ]
                      }
                    ]
                  },
                  {
                    tag: 'div',
                    props: { className: 'nav-links' },
                    children: [
                      { tag: 'a', props: { href: '/docs' }, children: ['Docs'] },
                      { tag: 'a', props: { href: '/blog' }, children: ['Blog'] },
                      { tag: 'a', props: { href: '/about' }, children: ['About'] },
                      { tag: 'a', props: { href: 'https://github.com/jayanthansenthilkumar/Luna', className: 'nav-github' }, children: ['GitHub ↗'] }
                    ]
                  }
                ]
              }
            ]
          },
          {
            tag: 'main',
            props: { className: 'main-content' },
            children: [typeof children === 'string' ? children : children]
          },
          {
            tag: 'footer',
            props: { className: 'footer' },
            children: [
              {
                tag: 'div',
                props: { className: 'footer-inner' },
                children: [
                  {
                    tag: 'div',
                    props: { className: 'footer-grid' },
                    children: [
                      {
                        tag: 'div',
                        props: { className: 'footer-col' },
                        children: [
                          { tag: 'h4', props: {}, children: ['LUNA'] },
                          { tag: 'p', props: { className: 'footer-desc' }, children: ['One Language. One Runtime. Every Platform. Build anything with JavaScript.'] }
                        ]
                      },
                      {
                        tag: 'div',
                        props: { className: 'footer-col' },
                        children: [
                          { tag: 'h4', props: {}, children: ['Documentation'] },
                          { tag: 'a', props: { href: '/docs' }, children: ['Getting Started'] },
                          { tag: 'a', props: { href: '/docs/core' }, children: ['Core Runtime'] },
                          { tag: 'a', props: { href: '/docs/networking' }, children: ['Networking'] },
                          { tag: 'a', props: { href: '/docs/ui' }, children: ['UI & Rendering'] }
                        ]
                      },
                      {
                        tag: 'div',
                        props: { className: 'footer-col' },
                        children: [
                          { tag: 'h4', props: {}, children: ['Platforms'] },
                          { tag: 'a', props: { href: '/docs/platforms' }, children: ['Backend'] },
                          { tag: 'a', props: { href: '/docs/platforms' }, children: ['Mobile'] },
                          { tag: 'a', props: { href: '/docs/platforms' }, children: ['Desktop'] },
                          { tag: 'a', props: { href: '/docs/platforms' }, children: ['Edge'] }
                        ]
                      },
                      {
                        tag: 'div',
                        props: { className: 'footer-col' },
                        children: [
                          { tag: 'h4', props: {}, children: ['Community'] },
                          { tag: 'a', props: { href: 'https://github.com/jayanthansenthilkumar/Luna' }, children: ['GitHub'] },
                          { tag: 'a', props: { href: 'https://github.com/jayanthansenthilkumar/Luna/issues' }, children: ['Issues'] },
                          { tag: 'a', props: { href: '/blog' }, children: ['Blog'] }
                        ]
                      }
                    ]
                  },
                  {
                    tag: 'div',
                    props: { className: 'footer-bottom' },
                    children: [
                      { tag: 'p', props: {}, children: ['MIT License © 2026 LUNA Contributors'] }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };
};
