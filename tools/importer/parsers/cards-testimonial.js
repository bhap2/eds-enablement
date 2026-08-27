/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-testimonial
 * Base block: cards
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-26
 *
 * Testimonial cards. In the source this is a tab switcher: the matched element
 * `.grid-layout.desktop-4-column.tab-menu` holds one `<button class="tab-menu-link">` per
 * person (avatar + name + role only). The full testimonial photo + quote live in the sibling
 * `.tabs-content .tab-pane` panes (paired by index). We flatten the switcher into a static
 * card grid, pairing each pane's large photo + quote with the tab button's name/role.
 *
 * Convention (library-description.txt): "Cards" is a 2-column block. First row is the block
 * name; each subsequent row is one card: cell 1 = image (mandatory), cell 2 = text content
 * (name/role/quote). Matches blocks/cards-testimonial.js (image cell + body cell).
 */
export default function parse(element, { document }) {
  // The matched element is the tab-menu; its testimonial panes are siblings within a
  // shared wrapper. Climb to the wrapper that contains both, then read the panes.
  const wrapper = element.closest('.tabs-wrapper')
    || element.parentElement
    || element;

  const panes = Array.from(wrapper.querySelectorAll('.tab-pane'));
  const buttons = Array.from(element.querySelectorAll(':scope > .tab-menu-link, :scope > button, .tab-menu-link'));

  const cells = [];

  // Prefer the panes as the source of truth (they carry the large photo + full quote),
  // falling back to the tab buttons for the name/role when a pane lacks them.
  const count = Math.max(panes.length, buttons.length);
  for (let i = 0; i < count; i += 1) {
    const pane = panes[i];
    const button = buttons[i];

    // Image: prefer the pane's large cover image; fall back to the button avatar.
    const image = (pane && pane.querySelector('img'))
      || (button && button.querySelector('img'))
      || null;

    // Text content: name (strong), role, and quote.
    const textContent = [];
    const name = (pane && pane.querySelector('strong'))
      || (button && button.querySelector('strong'));
    // Role sits in a leaf <div> (no child elements) near the name.
    let role = null;
    if (pane) {
      const roleCandidates = Array.from(pane.querySelectorAll('div'))
        .filter((d) => d.children.length === 0 && d.textContent.trim());
      role = roleCandidates[0] || null;
    }
    if (!role && button) {
      const roleEls = Array.from(button.querySelectorAll('div'))
        .filter((d) => d.children.length === 0 && d.textContent.trim());
      role = roleEls[roleEls.length - 1] || null;
    }
    const quote = pane && pane.querySelector('p');

    if (name) {
      // Wrap the name in a heading so it renders as the card title.
      const heading = document.createElement('h3');
      heading.textContent = name.textContent.trim();
      textContent.push(heading);
    }
    if (role) textContent.push(role);
    if (quote) textContent.push(quote);

    // Skip empty entries (no image and no text).
    if (!image && textContent.length === 0) continue;

    cells.push([image || '', textContent]);
  }

  // Empty-block guard: no testimonials found.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-testimonial', cells });
  element.replaceWith(block);
}
