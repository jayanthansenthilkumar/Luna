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
          { tag: 'title', props: {}, children: ['luna_site'] },
          { tag: 'link', props: { rel: 'stylesheet', href: '/__luna/globals.css' }, children: [] }
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
                props: { className: 'nav-brand' },
                children: [
                  { tag: 'a', props: { href: '/' }, children: ['🌙 luna_site'] }
                ]
              },
              {
                tag: 'div',
                props: { className: 'nav-links' },
                children: [
                  { tag: 'a', props: { href: '/' }, children: ['Home'] },
                  { tag: 'a', props: { href: '/about' }, children: ['About'] },
                  { tag: 'a', props: { href: '/blog' }, children: ['Blog'] }
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
              { tag: 'p', props: {}, children: ['Built with 🌙 LUNA'] }
            ]
          }
        ]
      }
    ]
  };
};
