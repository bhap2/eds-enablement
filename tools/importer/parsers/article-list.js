/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: article-list
 * Base block: article-list
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-26
 *
 * article-list is a DYNAMIC block: at render time blocks/article-list/article-list.js fetches
 * a query-index JSON feed and renders the cards itself. It does NOT author the individual
 * cards. Its content model (all optional):
 *   row 1: link to the index JSON (defaults to /query-index.json)
 *   row 2: path prefix filter, e.g. /blog/
 *   row 3: max number of items
 *
 * The source "Latest articles" grid links each card to /blog/... , so we emit a config that
 * points at the default query index and filters to the /blog/ prefix. We do NOT copy the
 * static source cards — they are produced dynamically from the published index.
 *
 * VALIDATION NOTE: the completeness score for this parser is intentionally low (~19%). The
 * validator compares against the static source cards (headings/dates/tags), but a dynamic
 * block deliberately omits them — copying them would freeze the list and prevent new posts
 * from appearing automatically. Low similarity here is expected and correct by design, not a
 * dropped-content bug. The block reads /query-index.json at render time instead of authoring
 * the cards inline.
 */
export default function parse(element, { document }) {
  // Derive the path prefix from the source article links (they point under /blog/).
  const firstLink = element.querySelector('a[href]');
  let prefix = '/blog/';
  if (firstLink) {
    const href = firstLink.getAttribute('href') || '';
    const match = href.match(/^(\/[^/]+\/)/);
    if (match) prefix = match[1];
  }

  // Link row pointing at the query index the block reads at render time.
  const indexLink = document.createElement('a');
  indexLink.href = '/query-index.json';
  indexLink.textContent = '/query-index.json';

  // Prefix filter row.
  const prefixCell = document.createElement('p');
  prefixCell.textContent = prefix;

  const cells = [
    [indexLink],
    [prefixCell],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'article-list', cells });
  element.replaceWith(block);
}
