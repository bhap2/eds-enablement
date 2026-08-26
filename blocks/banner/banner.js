/**
 * loads and decorates the banner block
 *
 * Expected content model (two rows):
 *   row 1: an image (full-bleed background)
 *   row 2: heading + optional supporting text + optional CTA link
 *
 * Renders a full-bleed image card with a gradient overlay and the text
 * content laid over the bottom-left of the image.
 *
 * @param {Element} block The banner block element
 */
export default async function decorate(block) {
  const picture = block.querySelector('picture');

  // gather all non-image content nodes, in document order
  const contentNodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    if (cell.querySelector('picture')) return;
    [...cell.childNodes].forEach((node) => contentNodes.push(node));
  });

  const content = document.createElement('div');
  content.className = 'banner-content';

  contentNodes.forEach((node) => content.append(node));

  // if there is text but no heading, promote the first non-empty block to h2
  if (content.textContent.trim() && !content.querySelector('h1, h2, h3, h4, h5, h6')) {
    const firstText = [...content.children].find((el) => el.textContent.trim())
      || content.firstElementChild;
    const title = document.createElement('h2');
    if (firstText) {
      title.append(...firstText.childNodes);
      firstText.replaceWith(title);
    } else {
      title.textContent = content.textContent.trim();
      content.textContent = '';
      content.append(title);
    }
  }

  // ensure headings carry the banner-title hook for styling
  content.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    h.classList.add('banner-title');
  });

  // decorate a standalone CTA link as a button (block internals are not
  // auto-decorated by EDS decorateButtons)
  content.querySelectorAll('p').forEach((p) => {
    const link = p.querySelector('a');
    if (link && p.textContent.trim() === link.textContent.trim()) {
      link.classList.add('button');
      p.classList.add('button-container');
    }
  });

  const image = document.createElement('div');
  image.className = 'banner-image';
  if (picture) image.append(picture);

  const overlay = document.createElement('div');
  overlay.className = 'banner-overlay';

  block.replaceChildren(image, overlay, content);
}
