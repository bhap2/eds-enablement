/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters section styling.
 *
 * The source wraps page content in top-level <section>/<header> elements whose
 * class encodes a background band:
 *   .secondary-section → light grey (#f5f5f5)  → Style: light
 *   .accent-section    → yellow      (#f4fe8b) → Style: highlight
 *   .inverse-section   → black       (#000)    → Style: dark
 *   (plain .section)   → white                  → no metadata
 *
 * EDS represents sections as sibling groups separated by <hr>, with an optional
 * "Section Metadata" block carrying a Style value. This transformer runs in the
 * afterTransform hook (blocks already parsed): it walks the original top-level
 * sections, and for each one inserts an <hr> divider before it (except the first)
 * and appends a Section Metadata table when the section maps to a styled band.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// source section class → EDS section style value
const STYLE_MAP = [
  { selector: 'accent-section', style: 'highlight' },
  { selector: 'inverse-section', style: 'dark' },
  { selector: 'secondary-section', style: 'light' },
];

function styleForSection(el) {
  const match = STYLE_MAP.find(({ selector }) => el.classList.contains(selector));
  return match ? match.style : null;
}

function buildSectionMetadata(document, style) {
  return WebImporter.Blocks.createBlock(document, {
    name: 'Section Metadata',
    cells: [['Style', style]],
  });
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const main = element.querySelector('#main-content') || element;
  const sections = [...main.children].filter(
    (child) => child.tagName === 'SECTION' || child.tagName === 'HEADER',
  );
  if (sections.length <= 1) return;

  sections.forEach((section, index) => {
    const style = styleForSection(section);

    // Append a Section Metadata block inside this section when it maps to a band.
    if (style) {
      section.appendChild(buildSectionMetadata(document, style));
    }

    // Insert a divider between sections (not before the first).
    if (index > 0) {
      const hr = document.createElement('hr');
      section.parentNode.insertBefore(hr, section);
    }
  });
}
