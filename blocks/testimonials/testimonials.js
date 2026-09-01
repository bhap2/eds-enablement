import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Testimonials Block
 *
 * Repeats a set of testimonials, each with an avatar, quote, and name.
 * Renders a responsive grid of testimonial cards.
 *
 * Content model — one row per testimonial, cells in order:
 *   [ avatar image ] [ quote text ] [ name (optionally + role) ]
 * The quote and name cells accept plain text or authored markup.
 */
export default function decorate(block) {
  const cards = [...block.children].map((row) => {
    const cells = [...row.children];
    const picCell = cells.find((c) => c.querySelector('picture, img'));
    const rest = cells.filter((c) => c !== picCell);
    const img = picCell?.querySelector('img');
    // remaining cells: first with the most text is the quote, last is the name
    const quoteCell = rest[0];
    const nameCell = rest.length > 1 ? rest[rest.length - 1] : null;
    return { img, quoteCell, nameCell };
  }).filter((c) => c.quoteCell || c.img);

  const list = document.createElement('ul');
  list.className = 'testimonials-list';

  cards.forEach((card) => {
    const item = document.createElement('li');
    item.className = 'testimonials-item';

    if (card.img) {
      const avatar = document.createElement('span');
      avatar.className = 'testimonials-avatar';
      avatar.append(createOptimizedPicture(card.img.src, card.img.alt || '', false, [{ width: '200' }]));
      item.append(avatar);
    }

    // If DA wrapped the cell text in a single <p>, unwrap it so we don't nest
    // paragraphs inside our blockquote/name elements.
    const unwrap = (cell) => {
      const only = cell.children.length === 1 && cell.firstElementChild.tagName === 'P'
        ? cell.firstElementChild : cell;
      return only.childNodes;
    };

    if (card.quoteCell) {
      const quote = document.createElement('blockquote');
      quote.className = 'testimonials-quote';
      quote.append(...unwrap(card.quoteCell));
      item.append(quote);
    }

    if (card.nameCell) {
      const name = document.createElement('p');
      name.className = 'testimonials-name';
      name.append(...unwrap(card.nameCell));
      item.append(name);
    }

    list.append(item);
  });

  block.replaceChildren(list);
}
