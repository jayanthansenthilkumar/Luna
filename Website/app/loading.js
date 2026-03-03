/**
 * Loading State
 * 
 * Shown while the page is loading / streaming.
 */
module.exports = function Loading() {
  return {
    tag: 'div',
    props: { className: 'loading' },
    children: [
      { tag: 'div', props: { className: 'loading-spinner' }, children: [] }
    ]
  };
};
