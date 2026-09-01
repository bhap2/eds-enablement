/*
 * Article List Block
 *
 * Two authoring modes:
 *
 * 1. Static cards (matches the source's curated "Latest Articles"): author one
 *    row per card, each with cells:
 *      [ image ] [ category ] [ date ] [ title (usually a link) ]
 *    The category/date/title are authored content — no index lookup — so the
 *    yellow category pills always render.
 *
 * 2. Dynamic index (all rows optional): when no card has an image, the block
 *    reads a query-index JSON feed instead:
 *      row 1: link to the index JSON (defaults to /query-index.json)
 *      row 2: path prefix filter, e.g. /blog/ (only list pages under it)
 *      row 3: page size — how many to show at once (defaults to 4)
 *      row 4: "Load more" button label — when present, the list paginates:
 *             it shows one page, then reveals the next page-size batch on each
 *             click until the whole feed is shown.
 *    Because it reads the published index at render time, publishing a new page
 *    makes it appear automatically — no code change. Category/date show when
 *    the index is configured to surface them.
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
  const [, prefixRow, limitRow, loadMoreRow] = rows;

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
  // A "Load more" label in row 4 opts into pagination (limit = page size).
  const loadMoreLabel = loadMoreRow ? loadMoreRow.textContent.trim() : '';

  return {
    indexPath,
    prefix,
    // default to a single four-up row unless the author overrides it
    limit: Number.isNaN(parsedLimit) ? DEFAULT_LIMIT : parsedLimit,
    loadMoreLabel,
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
    link.append(createOptimizedPicture(item.image, item.imageAlt || title, false, [{ width: '750' }]));
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
 * Parses authored rows into static card items. A card row has an image plus
 * text cells; the block is in static mode if any row contains an image.
 * Cell order: [ image ][ category ][ date ][ title (link) ].
 * @param {Element} block the article-list block
 * @returns {Array|null} card items, or null when no static cards are authored
 */
function parseStaticCards(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const cardRows = rows.filter((row) => row.querySelector('picture, img'));
  if (!cardRows.length) return null;

  return cardRows.map((row) => {
    const cells = [...row.children];
    const picCell = cells.find((c) => c.querySelector('picture, img'));
    const textCells = cells.filter((c) => c !== picCell);

    const img = picCell?.querySelector('img');
    // the title is the cell that carries a link (or the last text cell)
    const titleCell = textCells.find((c) => c.querySelector('a')) || textCells[textCells.length - 1];
    const titleLink = titleCell?.querySelector('a');
    const title = (titleLink || titleCell)?.textContent.trim() || '';
    const path = titleLink?.getAttribute('href')
      || picCell?.querySelector('a')?.getAttribute('href')
      || '#';

    // remaining text cells (before the title) are category then date
    const meta = textCells
      .filter((c) => c !== titleCell)
      .map((c) => c.textContent.trim())
      .filter(Boolean);

    return {
      path,
      title,
      image: img?.src || '',
      imageAlt: img?.alt || title,
      category: meta[0] || '',
      publicationdate: meta[1] || '',
    };
  });
}

/**
 * loads and decorates the article-list block
 * @param {Element} block The article-list block element
 */
export default async function decorate(block) {
  // Static card mode — authored cards with their own category/date/title.
  const staticCards = parseStaticCards(block);
  if (staticCards) {
    const list = document.createElement('ul');
    list.className = 'article-list-items';
    staticCards.forEach((item) => list.append(renderArticle(item)));
    block.replaceChildren(list);
    return;
  }

  const {
    indexPath, prefix, limit, loadMoreLabel,
  } = readConfig(block);

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

  const list = document.createElement('ul');
  list.className = 'article-list-items';

  // Pagination: when a "Load more" label is authored, the limit is the page
  // size and a button reveals the next batch on each click. Otherwise the
  // limit is a hard cap (or show all when 0).
  const paginate = !!loadMoreLabel && limit > 0;
  let shown = 0;

  const renderNextPage = () => {
    const next = paginate ? items.slice(shown, shown + limit)
      : items.slice(0, limit > 0 ? limit : items.length);
    next.forEach((item) => list.append(renderArticle(item)));
    shown += next.length;
  };

  renderNextPage();
  block.replaceChildren(list);

  if (paginate && shown < items.length) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'article-list-load-more';
    button.textContent = loadMoreLabel;
    button.addEventListener('click', () => {
      renderNextPage();
      // update the count and hide the button once everything is shown
      button.setAttribute('aria-label', `${loadMoreLabel} (${items.length - shown} remaining)`);
      if (shown >= items.length) button.remove();
    });
    block.append(button);
  }
}
