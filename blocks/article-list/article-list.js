/*
 * Article List Block
 * Fetches a query-index JSON feed and renders it as a dynamic list of
 * article cards. Because it reads the published index at render time,
 * publishing a new page makes it appear here automatically — no code change.
 *
 * Content model (all optional):
 *   row 1: link to the index JSON (defaults to /query-index.json)
 *   row 2: path prefix filter, e.g. /blog/ (only list pages under it)
 *   row 3: max number of items to show (defaults to 4, matching the source
 *          "Latest Articles" row)
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

const DEFAULT_INDEX = '/query-index.json';
// The source "Latest Articles" section shows a single four-up row.
const DEFAULT_LIMIT = 4;

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
  const limitText = limitRow ? limitRow.textContent.trim() : '';
  const parsedLimit = parseInt(limitText, 10);

  return {
    indexPath,
    prefix,
    // default to a single four-up row unless the author overrides it
    limit: Number.isNaN(parsedLimit) ? DEFAULT_LIMIT : parsedLimit,
  };
}

/**
 * Cleans a raw index title: strips the "| Site Name" / "— Site Name" suffix
 * that the document title template appends, so cards show just the headline.
 * @param {string} raw the indexed title
 */
function cleanTitle(raw) {
  if (!raw) return '';
  return raw.replace(/\s*[|–—-]\s*Fashion Blog\s*$/i, '').trim();
}

/**
 * Builds one article card element.
 * @param {object} item an index row
 */
function renderArticle(item) {
  const li = document.createElement('li');
  li.className = 'article-list-item';
  const title = cleanTitle(item.title) || item.path;

  if (item.image) {
    const picWrap = document.createElement('div');
    picWrap.className = 'article-list-image';
    const link = document.createElement('a');
    link.href = item.path;
    link.append(createOptimizedPicture(item.image, title, false, [{ width: '750' }]));
    picWrap.append(link);
    li.append(picWrap);
  }

  const body = document.createElement('div');
  body.className = 'article-list-body';

  // meta row: category pill + date, when the index provides them
  const dateLabel = item.publicationdate || item.date || '';
  if (item.category || dateLabel) {
    const meta = document.createElement('div');
    meta.className = 'article-list-meta';
    if (item.category) {
      const cat = document.createElement('span');
      cat.className = 'article-list-category';
      cat.textContent = item.category;
      meta.append(cat);
    }
    if (dateLabel) {
      const date = document.createElement('span');
      date.className = 'article-list-date';
      date.textContent = dateLabel;
      meta.append(date);
    }
    body.append(meta);
  }

  const titleEl = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = item.path;
  titleLink.textContent = title;
  titleEl.append(titleLink);
  body.append(titleEl);

  // Note: the source "Latest Articles" cards show only the category, date, and
  // title — no description — so the description is intentionally omitted here.

  li.append(body);
  return li;
}

/**
 * Parses a card date into a sortable timestamp. Supports the index's
 * publication-date ("May 12" / "May 12, 2024") and ISO-ish values.
 * @param {object} item an index row
 */
function dateValue(item) {
  const raw = item.publicationdate || item.date || '';
  const t = Date.parse(raw);
  return Number.isNaN(t) ? 0 : t;
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

  // newest first, so "Latest Articles" shows the most recent posts
  if (items.some(dateValue)) items.sort((a, b) => dateValue(b) - dateValue(a));

  if (limit > 0) items = items.slice(0, limit);

  const list = document.createElement('ul');
  list.className = 'article-list-items';
  items.forEach((item) => list.append(renderArticle(item)));

  block.replaceChildren(list);
}
