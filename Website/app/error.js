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
      { tag: 'h1', props: {}, children: ['Something went wrong'] },
      { tag: 'p', props: { style: 'color:var(--text-muted)' }, children: [
        error ? error.message : 'An unexpected error occurred.'
      ]},
      { tag: 'a', props: { href: '/', className: 'btn btn-primary', style: 'margin-top:2rem;display:inline-block' }, children: ['Go Home'] }
    ]
  };
};
