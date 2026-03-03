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
      { tag: 'h1', props: { style: 'font-size:6rem;margin-bottom:0.5rem' }, children: ['404'] },
      { tag: 'p', props: { style: 'font-size:1.25rem;color:var(--text-muted)' }, children: ['This page could not be found.'] },
      { tag: 'a', props: { href: '/', className: 'btn btn-primary', style: 'margin-top:2rem;display:inline-block' }, children: ['Go Home'] }
    ]
  };
};
