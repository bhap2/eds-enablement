import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// WKND star/sparkle logo mark (same as the header brand), inlined so the
// footer brand shows the icon before the "Fashion Blog" wordmark.
const LOGO_SVG = '<svg viewBox="0 0 33 33" aria-hidden="true"><path d="M28,0H5C2.24,0,0,2.24,0,5v23c0,2.76,2.24,5,5,5h23c2.76,0,5-2.24,5-5V5c0-2.76-2.24-5-5-5ZM29,17c-6.63,0-12,5.37-12,12h-1c0-6.63-5.37-12-12-12v-1c6.63,0,12-5.37,12-12h1c0,6.63,5.37,12,12,12v1Z" fill="currentColor"></path></svg>';

// Social glyphs (source footer shows circular icon buttons, not text links).
// Keyed by the authored link text; simple brand marks on currentColor.
const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3 0-1.3-.1-2.45-.1-2.4 0-4.05 1.47-4.05 4.17v2.33H7.8V13h2.7v8h3z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.42 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.17-.26 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.42-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.06-1.8-.26-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.42-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.06-1.17.26-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.42C8.42 2.17 8.8 2.16 12 2.16zm0 3.68A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.53 3H20l-5.9 6.74L21 21h-5.4l-4.23-5.53L6.5 21H4l6.3-7.2L3 3h5.53l3.82 5.05zm-.95 16.13h1.37L7.5 4.8H6.03z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.94 5A1.94 1.94 0 1 1 5 3.06 1.94 1.94 0 0 1 6.94 5zM5.06 8.48h3.75V21H5.06zM10.9 8.48h3.6v1.71h.05a3.95 3.95 0 0 1 3.55-1.95c3.8 0 4.5 2.5 4.5 5.76V21h-3.75v-5.55c0-1.32-.02-3.02-1.84-3.02-1.84 0-2.12 1.44-2.12 2.92V21H10.9z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23 12s0-3.2-.4-4.73a2.5 2.5 0 0 0-1.76-1.76C19.28 5.1 12 5.1 12 5.1s-7.28 0-8.84.41A2.5 2.5 0 0 0 1.4 7.27C1 8.8 1 12 1 12s0 3.2.4 4.73a2.5 2.5 0 0 0 1.76 1.76C4.72 18.9 12 18.9 12 18.9s7.28 0 8.84-.41a2.5 2.5 0 0 0 1.76-1.76C23 15.2 23 12 23 12zM9.75 15.02V8.98L15 12z"/></svg>',
};

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

  // Turn the social links into circular icon buttons (source uses icons, not
  // text). Keep the label as accessible text for screen readers.
  const socialList = footer.querySelector('.footer-brand ul');
  if (socialList) {
    socialList.classList.add('footer-social');
    socialList.querySelectorAll('a').forEach((a) => {
      const key = a.textContent.trim().toLowerCase();
      const svg = SOCIAL_ICONS[key];
      if (!svg) return;
      a.setAttribute('aria-label', a.textContent.trim());
      const iconSpan = document.createElement('span');
      iconSpan.className = 'footer-social-icon';
      iconSpan.innerHTML = svg;
      const label = document.createElement('span');
      label.className = 'footer-social-label';
      label.textContent = a.textContent.trim();
      a.replaceChildren(iconSpan, label);
    });
  }

  block.append(footer);
}
