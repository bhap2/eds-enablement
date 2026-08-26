import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Cards (testimonial variant)
 * Each card = a person photo + name/role + quote. Simplifies the source
 * tab-switcher testimonials into a static, author-friendly card grid.
 */
export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-testimonial-card-image';
      else div.className = 'cards-testimonial-card-body';
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
