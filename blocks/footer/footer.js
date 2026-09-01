import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// WKND star/sparkle logo mark (same as the header brand), inlined so the
// footer brand shows the icon before the "Fashion Blog" wordmark.
const LOGO_SVG = '<svg viewBox="0 0 33 33" aria-hidden="true"><path d="M28,0H5C2.24,0,0,2.24,0,5v23c0,2.76,2.24,5,5,5h23c2.76,0,5-2.24,5-5V5c0-2.76-2.24-5-5-5ZM29,17c-6.63,0-12,5.37-12,12h-1c0-6.63-5.37-12-12-12v-1c6.63,0,12-5.37,12-12h1c0,6.63,5.37,12,12,12v1Z" fill="currentColor"></path></svg>';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Build a single row: brand column + the three link-group columns, matching
  // the source (Brand | Trends | Inspire | Explore, all equal width).
  const row = document.createElement('div');
  row.className = 'footer-row';

  // brand + social live in the first fragment section
  const brandSection = footer.querySelector(':scope > div');
  if (brandSection) {
    brandSection.classList.add('footer-brand');
    row.append(brandSection);
  }

  // the three link groups are the direct children of the columns block
  const columns = footer.querySelector('.columns');
  const groups = columns ? [...columns.querySelector(':scope > div').children] : [];
  groups.forEach((group) => {
    group.classList.add('footer-links');
    row.append(group);
  });
  // drop the now-empty columns section wrapper
  const columnsSection = columns ? columns.closest(':scope > div') : null;
  if (columnsSection) columnsSection.remove();

  footer.replaceChildren(row);

  // Prepend the star logo to the brand link.
  const brandLink = footer.querySelector('.footer-brand a[href="/"], .footer-brand a');
  if (brandLink && !brandLink.querySelector('.footer-logo-icon')) {
    const icon = document.createElement('span');
    icon.className = 'footer-logo-icon';
    icon.innerHTML = LOGO_SVG;
    brandLink.prepend(icon);
  }

  block.append(footer);
}
