/*
 * Article List Block
 * Fetches a query-index JSON feed and renders it as a dynamic list of
 * article cards. Because it reads the published index at render time,
 * publishing a new page makes it appear here automatically — no code change.
 *
 * Content model (all optional):
 *   row 1: link to the index JSON (defaults to /query-index.json)
 *   row 2: path prefix filter, e.g. /blog/ (only list pages under it)
 *   row 3: max number of items to show
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

const DEFAULT_INDEX = '/query-index.json';

/**
 * Reads the block's authored rows into a simple config object.
 * @param {Element} block the article-list block
 */
function readConfig(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const link = block.querySelector('a');
  const [, prefixRow, limitRow] = rows;

  // Prefer the link text over its href: authoring/publishing can mangle a
  // path-like href (e.g. "/query-index.json" → "/query-index-json"), but the
  // visible text keeps the intended value. Fall back to href, then the default.
  const rawText = link ? link.textContent.trim() : (rows[0]?.textContent.trim() || '');
  const rawHref = link ? (link.getAttribute('href') || '') : '';
  let indexPath = rawText || rawHref || DEFAULT_INDEX;

  // Guard against a mangled path: a valid index path must end in .json.
  if (!/\.json$/i.test(indexPath)) indexPath = DEFAULT_INDEX;

  const prefix = prefixRow ? prefixRow.textContent.trim() : '';
  const limit = limitRow ? parseInt(limitRow.textContent.trim(), 10) : 0;

  return {
    indexPath,
    prefix,
    limit: Number.isNaN(limit) ? 0 : limit,
  };
}

/**
 * Builds one article card element.
 * @param {object} item an index row
 */
function renderArticle(item) {
  const li = document.createElement('li');
  li.className = 'article-list-item';

  if (item.image) {
    const picWrap = document.createElement('div');
    picWrap.className = 'article-list-image';
    const link = document.createElement('a');
    link.href = item.path;
    link.append(createOptimizedPicture(item.image, item.title || '', false, [{ width: '750' }]));
    picWrap.append(link);
    li.append(picWrap);
  }

  const body = document.createElement('div');
  body.className = 'article-list-body';

  const title = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = item.path;
  titleLink.textContent = item.title || item.path;
  title.append(titleLink);
  body.append(title);

  if (item.description) {
    const desc = document.createElement('p');
    desc.textContent = item.description;
    body.append(desc);
  }

  li.append(body);
  return li;
}

/**
 * loads and decorates the article-list block
 * @param {Element} block The article-list block element
 */
export default async function decorate(block) {
  const { indexPath, prefix, limit } = readConfig(block);

  let items = [];
  try {
    const resp = await fetch(indexPath);
    if (resp.ok) {
      const json = await resp.json();
      items = json.data || [];
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to load index:', e);
  }

  // filter by path prefix, and never list the current page or the index itself
  const here = window.location.pathname;
  items = items.filter((item) => item.path
    && item.path !== here
    && (!prefix || item.path.startsWith(prefix)));

  if (limit > 0) items = items.slice(0, limit);

  const list = document.createElement('ul');
  list.className = 'article-list-items';
  items.forEach((item) => list.append(renderArticle(item)));

  block.replaceChildren(list);
}
