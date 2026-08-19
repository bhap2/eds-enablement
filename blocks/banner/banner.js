/**
 * loads and decorates the banner block
 *
 * Expected content model (two rows):
 *   row 1: an image
 *   row 2: the title text
 *
 * @param {Element} block The banner block element
 */
export default async function decorate(block) {
  const picture = block.querySelector('picture');

  // find the title text: the first heading, or the first non-empty paragraph
  let titleSource = block.querySelector('h1, h2, h3, h4, h5, h6');
  if (!titleSource) {
    titleSource = [...block.querySelectorAll('p')]
      .find((p) => p.textContent.trim() && !p.querySelector('picture'));
  }
  const titleText = titleSource ? titleSource.textContent.trim() : '';

  const content = document.createElement('div');
  content.className = 'banner-content';

  if (picture) {
    const imageWrap = document.createElement('div');
    imageWrap.className = 'banner-image';
    imageWrap.append(picture);
    content.append(imageWrap);
  }

  const title = document.createElement('h2');
  title.className = 'banner-title';
  title.textContent = titleText;
  content.append(title);

  block.replaceChildren(content);
}
