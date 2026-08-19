/*
 * Breadcrumbs Block
 * Copied from the AEM Block Collection (breadcrumb code shipped inside the
 * header block): https://www.aem.live/developer/block-collection/breadcrumbs
 *
 * Builds a breadcrumb trail from the site nav tree, matching the current URL,
 * so it reflects the location of the current page in the navigation hierarchy.
 */

import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function getDirectTextContent(menuItem) {
  const menuLink = menuItem.querySelector(':scope > a');
  if (menuLink) {
    return menuLink.textContent.trim();
  }
  return Array.from(menuItem.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
}

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = [];

  const brandLink = document.querySelector('.nav-brand a');
  const homeUrl = brandLink ? brandLink.href : new URL('/', window.location).href;

  let menuItem = nav
    ? Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl)
    : null;
  if (menuItem) {
    do {
      const link = menuItem.querySelector(':scope > a');
      crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
      menuItem = menuItem.closest('ul')?.closest('li');
    } while (menuItem);
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
  }

  const homeLabel = 'Home';

  crumbs.unshift({ title: homeLabel, url: homeUrl });

  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs[crumbs.length - 1].url = null;
  }
  crumbs[crumbs.length - 1]['aria-current'] = 'page';
  return crumbs;
}

async function buildBreadcrumbs() {
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';
  breadcrumbs.setAttribute('aria-label', 'Breadcrumb');

  // ensure the nav sections exist before reading the tree
  let navSections = document.querySelector('.nav-sections');
  if (!navSections) {
    const navMeta = getMetadata('nav');
    const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
    const fragment = await loadFragment(navPath);
    navSections = fragment ? fragment.querySelector(':scope > div:nth-child(2)') : null;
  }

  const crumbs = await buildBreadcrumbsFromNavTree(navSections, document.location.href);

  const ol = document.createElement('ol');
  ol.append(...crumbs.map((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.textContent = item.title;
    }
    return li;
  }));

  breadcrumbs.append(ol);
  return breadcrumbs;
}

/**
 * loads and decorates the breadcrumbs block
 * @param {Element} block The breadcrumbs block element
 */
export default async function decorate(block) {
  const breadcrumbs = await buildBreadcrumbs();
  block.replaceChildren(breadcrumbs);
}
