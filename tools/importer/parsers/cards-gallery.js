/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-gallery
 * Base block: cards
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-26
 *
 * Image-only square photo grid ("Style in every snapshot"). The matched element is
 * `section.secondary-section:nth-of-type(2) .grid-layout.desktop-4-column`, whose direct
 * children are `.utility-aspect-1x1` wrappers each holding a single `<img class="cover-image">`.
 *
 * Convention (library-description.txt): base "Cards" is a 2-column image+text block. This
 * gallery variant has NO text — every card is image-only — so it follows the single-cell
 * image layout expected by blocks/cards-gallery.js: first row is the block name, then one
 * row per image (a single cell holding just that image). Text cells are intentionally omitted
 * because there is no per-card text content in the source.
 */
export default function parse(element, { document }) {
  // Each direct child wrapper holds one gallery image. Fall back to any descendant
  // image wrapper, then to bare images, to tolerate DOM variation across pages.
  let itemEls = Array.from(element.querySelectorAll(':scope > div'));
  if (itemEls.length === 0) {
    itemEls = Array.from(element.querySelectorAll('[class*="aspect"]'));
  }

  const cells = [];
  itemEls.forEach((item) => {
    const image = item.querySelector('img') || (item.matches('img') ? item : null);
    if (!image) return;
    // Image-only card: one cell per row holding just the image.
    cells.push([image]);
  });

  // Empty-block guard: no images found.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-gallery', cells });
  element.replaceWith(block);
}
