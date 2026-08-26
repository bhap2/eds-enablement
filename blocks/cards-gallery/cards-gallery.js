import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Cards (gallery variant)
 * Image-only, borderless photo grid. Each row is one image cell.
 * Used for the "Style in every snapshot" gallery.
 */
export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-gallery-card-image';
      else div.className = 'cards-gallery-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(
        img.src,
        img.alt,
        false,
        [
          { media: '(min-width: 900px)', width: '750' },
          { media: '(min-width: 600px)', width: '600' },
          { width: '480' },
        ],
      ),
    );
  });

  block.replaceChildren(ul);
}
