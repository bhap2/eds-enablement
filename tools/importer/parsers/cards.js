/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards
 * Base block: cards
 * Source: https://wknd-trendsetters.site/fashion-trends-young-adults-casual-sport
 * Generated: 2026-08-26
 *
 * Structure (from library-description.txt): 2-column block. First row is the block name.
 * Each subsequent row is one card: cell 1 = image (mandatory), cell 2 = text content
 * (tag/heading/description/CTA).
 *
 * Source: the matched `.grid-layout` contains N `<a class="trend-card">` items, each with
 * a `.trend-card-image` (img) and a `.trend-card-body` (span.tag, h3, p).
 */
export default function parse(element, { document }) {
  // Card items are the anchors/divs carrying the trend-card class.
  // Prefer direct children, but fall back to any descendant .trend-card
  // (some hydrated/wrapped DOMs nest the cards one level deeper).
  let cardEls = Array.from(element.querySelectorAll(':scope > .trend-card'));
  if (cardEls.length <= 1) {
    const descendants = Array.from(element.querySelectorAll('.trend-card'));
    if (descendants.length > cardEls.length) cardEls = descendants;
  }

  // Fallback for DOM variations: any direct child that contains a trend-card body/image.
  if (cardEls.length === 0) {
    cardEls = Array.from(element.children).filter((el) =>
      el.querySelector('.trend-card-body, .trend-card-image, img'));
  }

  const cells = [];

  cardEls.forEach((card) => {
    // Image cell (first cell).
    const image = card.querySelector('.trend-card-image img, img');

    // Text cell (second cell): tag, heading, description, and any CTA that isn't the
    // card wrapper itself. Prefer the dedicated body container when present.
    const bodyEl = card.querySelector('.trend-card-body');
    const textContent = [];

    if (bodyEl) {
      Array.from(bodyEl.children).forEach((child) => textContent.push(child));
    } else {
      const tag = card.querySelector('.tag');
      const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
      const desc = card.querySelector('p');
      if (tag) textContent.push(tag);
      if (heading) textContent.push(heading);
      if (desc) textContent.push(desc);
    }

    // Skip empty cards (no image and no text).
    if (!image && textContent.length === 0) return;

    cells.push([image || '', textContent]);
  });

  // Empty-block guard: no cards found.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
