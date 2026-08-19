/*
 * Image-Compare Block
 * Adapted from the AEM Block Party entry by dave-fink:
 * https://github.com/dave-fink/franklin-demo/tree/main/blocks/image-compare
 *
 * Compares two images with a draggable slider that reveals/hides the
 * overlaid (left) image over the base (right) image.
 *
 * Content model (two rows, one image each):
 *   row 1: base image (shown on the right)
 *   row 2: overlay image (revealed on the left by the slider)
 */

export default function decorate(block) {
  const rows = [...block.children];
  const [rightRow, leftRow] = rows;
  if (!rightRow || !leftRow) return;

  rightRow.className = 'image-compare-right';
  leftRow.className = 'image-compare-left';

  // slider control
  const slider = document.createElement('div');
  slider.className = 'image-compare-slider';

  const range = document.createElement('input');
  range.type = 'range';
  range.min = '0';
  range.max = '100';
  range.value = '50';
  range.setAttribute('aria-label', 'Reveal comparison image');
  slider.append(range);
  leftRow.after(slider);

  // initial position and updates
  const update = () => {
    leftRow.style.width = `${range.value}%`;
  };
  update();
  range.addEventListener('input', update);
}
