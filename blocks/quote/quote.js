/*
 * Quote Block
 *
 * A blockquote with an attribution line, styled to the site's design tokens.
 *
 * Content model (two rows):
 *   row 1: the quotation text
 *   row 2: the attribution (e.g. "Jane Doe, Designer") — optional
 *
 * Variants:
 *   (default) simple — compact quote for inline use
 *   medium         — larger, more prominent quote for feature sections
 */
export default function decorate(block) {
  const rows = [...block.children];
  const quoteCell = rows[0]?.querySelector(':scope > div') || rows[0];
  const attrCell = rows[1]?.querySelector(':scope > div') || rows[1];

  const figure = document.createElement('figure');
  figure.className = 'quote-figure';

  const blockquote = document.createElement('blockquote');
  blockquote.className = 'quote-text';
  // preserve authored inline markup (emphasis, links) rather than plain text
  if (quoteCell) blockquote.append(...quoteCell.childNodes);
  figure.append(blockquote);

  // attribution is optional
  const attrText = attrCell ? attrCell.textContent.trim() : '';
  if (attrText) {
    const caption = document.createElement('figcaption');
    caption.className = 'quote-attribution';
    if (attrCell.childNodes.length) caption.append(...attrCell.childNodes);
    else caption.textContent = attrText;
    figure.append(caption);
  }

  block.replaceChildren(figure);
}
