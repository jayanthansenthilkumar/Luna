/**
 * Error Boundary
 * 
 * Rendered when an error occurs in a page or layout.
 */
module.exports = function ErrorPage({ error }) {
  return {
    tag: 'div',
    props: { className: 'page-section', style: 'text-align:center;padding:6rem 2rem' },
    children: [
      { tag: 'div', props: { style: 'font-size:4rem;margin-bottom:1rem;opacity:0.5' }, children: ['◐'] },
      { tag: 'h1', props: { style: 'margin-bottom:0.75rem' }, children: ['Something Went Wrong'] },
      {
        tag: 'p', props: { style: 'color:var(--text-muted);max-width:500px;margin:0 auto 2rem' }, children: [
          error ? error.message : 'An unexpected error occurred. The LUNA runtime encountered an issue processing this request.'
        ]
      },
      {
        tag: 'div',
        props: { style: 'display:flex;gap:1rem;justify-content:center' },
        children: [
          { tag: 'a', props: { href: '/', className: 'btn btn-primary' }, children: ['Go Home'] },
          { tag: 'a', props: { href: '/docs', className: 'btn btn-secondary' }, children: ['View Docs'] }
        ]
      }
    ]
  };
};
