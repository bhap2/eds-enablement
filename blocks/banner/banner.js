/**
 * Solid variant — image + title on a solid background (blue by default).
 *
 * Content model:
 *   row 1: an image
 *   row 2: title text (heading)
 *   row 3 (optional): a background color value (e.g. "#0057ff", "teal").
 *     When omitted, the block uses the default blue. The `dark` variant
 *     (Banner "solid, dark") overrides any color with a dark background.
 *
 * @param {Element} block The banner block element
 */
function decorateSolid(block) {
  const picture = block.querySelector('picture');

  // Gather non-image cells. A cell that is ONLY a valid CSS color value is
  // treated as the optional background color; everything else is content.
  let bgColor = '';
  const contentNodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    if (cell.querySelector('picture')) return;
    const text = cell.textContent.trim();
    const hasRichContent = cell.querySelector('a, h1, h2, h3, h4, h5, h6');
    if (!bgColor && text && !hasRichContent && CSS.supports('background-color', text)) {
      bgColor = text;
      return;
    }
    [...cell.childNodes].forEach((node) => contentNodes.push(node));
  });

  const content = document.createElement('div');
  content.className = 'banner-content';
  contentNodes.forEach((node) => content.append(node));

  // promote the title text to a heading if the author used plain text
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
  content.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    h.classList.add('banner-title');
  });

  const image = document.createElement('div');
  image.className = 'banner-image';
  if (picture) image.append(picture);

  // Apply an authored background color unless this is the dark variant, which
  // owns its background in CSS. Default blue comes from the stylesheet.
  if (bgColor && !block.classList.contains('dark')) {
    block.style.backgroundColor = bgColor;
  }

  block.replaceChildren(image, content);
}

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
 * The `solid` variant (Banner "solid" / "solid, dark") renders instead as an
 * image + title on a solid colored card — see decorateSolid.
 *
 * @param {Element} block The banner block element
 */
export default async function decorate(block) {
  if (block.classList.contains('solid')) {
    decorateSolid(block);
    return;
  }

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
