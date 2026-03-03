/**
 * Not Found Page (404)
 * 
 * Rendered when no route matches the URL.
 */
module.exports = function NotFound() {
  return {
    tag: 'div',
    props: { className: 'page-section', style: 'text-align:center;padding:6rem 2rem' },
    children: [
      { tag: 'div', props: { style: 'font-size:8rem;font-weight:900;background:linear-gradient(135deg,var(--primary),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;margin-bottom:1rem' }, children: ['404'] },
      { tag: 'h1', props: { style: 'font-size:1.75rem;margin-bottom:0.75rem' }, children: ['Page Not Found'] },
      { tag: 'p', props: { style: 'font-size:1.1rem;color:var(--text-muted);max-width:450px;margin:0 auto 2rem' }, children: ['The page you\'re looking for doesn\'t exist or has been moved.'] },
      {
        tag: 'div',
        props: { style: 'display:flex;gap:1rem;justify-content:center' },
        children: [
          { tag: 'a', props: { href: '/', className: 'btn btn-primary' }, children: ['Go Home'] },
          { tag: 'a', props: { href: '/docs', className: 'btn btn-secondary' }, children: ['Read Docs'] }
        ]
      }
    ]
  };
};
