/**
 * Utility Functions
 */

/**
 * Format a date string.
 */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Truncate text to a maximum length.
 */
function truncate(str, maxLen = 100) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + '...';
}

/**
 * Simple className merger.
 */
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

module.exports = { formatDate, truncate, cn };
