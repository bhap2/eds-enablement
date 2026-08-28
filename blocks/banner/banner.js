/**
 * loads and decorates the banner block
 *
 * Content model (rows, all optional except title):
 *   row 1: an image
 *   row 2: title text
 *   row 3: (optional) a background colour — a CSS colour value or a named
 *          token like "blue" / "dark". Defaults to blue when not provided.
 *
 * Renders the image and title on a solid background. Defaults to the blue
 * style; the `dark` variant (authored as the block option `banner (dark)`)
 * renders a dark background instead.
 *
 * @param {Element} block The banner block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // image (first picture found anywhere in the block)
  const picture = block.querySelector('picture');

  // title = first cell of text content that isn't the image
  let titleText = '';
  let bgValue = '';
  rows.forEach((row) => {
    const cell = row.querySelector(':scope > div') || row;
    if (cell.querySelector('picture')) return;
    const text = cell.textContent.trim();
    if (!text) return;
    if (!titleText) titleText = text; // first non-image text is the title
    else if (!bgValue) bgValue = text; // next non-image text is the bg colour
  });

  // build the image element
  const image = document.createElement('div');
  image.className = 'banner-image';
  if (picture) image.append(picture);

  // build the content (title)
  const content = document.createElement('div');
  content.className = 'banner-content';
  const title = document.createElement('h2');
  title.className = 'banner-title';
  title.textContent = titleText;
  content.append(title);

  // apply an authored background colour when provided (skip the named tokens
  // that map to CSS variants). Default styling (blue) comes from CSS.
  if (bgValue && !['blue', 'dark'].includes(bgValue.toLowerCase())) {
    block.style.backgroundColor = bgValue;
  }

  block.replaceChildren(image, content);
}
