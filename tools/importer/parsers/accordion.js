/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: accordion
 * Base block: accordion
 * Source: https://wknd-trendsetters.site/faq
 *
 * EDS accordion convention: 2-column table. Row 1 = block name (added by
 * createBlock). Each subsequent row is one accordion item with:
 *   cell 1 (title, mandatory)   = the clickable question/label
 *   cell 2 (content, mandatory) = the answer body revealed on expand
 *
 * Source DOM: the matched `.faq-list` holds N `.faq-item`s, each with a
 * `.faq-question` (title) and a `.faq-answer` (content).
 */
export default function parse(element, { document }) {
  let items = Array.from(element.querySelectorAll(':scope > .faq-item, .faq-item'));
  if (items.length === 0) {
    items = Array.from(element.children);
  }

  const cells = [];

  items.forEach((item) => {
    const q = item.querySelector('.faq-question')
      || item.querySelector('h2, h3, h4, summary, button');
    const a = item.querySelector('.faq-answer')
      || item.querySelector('p, div');

    // Title cell: question text without any toggle icon markup.
    let title = '';
    if (q) {
      const clone = q.cloneNode(true);
      clone.querySelectorAll('.faq-icon, svg, img, button').forEach((n) => n.remove());
      title = clone.textContent.trim();
    }

    if (!title && !a) return;

    // cell 1 = title (mandatory), cell 2 = content (mandatory)
    cells.push([title, a || '']);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
