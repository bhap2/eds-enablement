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
 *
 * Key detail: the overlay lives in a 50%-wide clipping container
 * (overflow: hidden), so its image MUST be pinned to the full block
 * width — otherwise the browser shrinks it to fit the half-width
 * container instead of clipping it.
 */

export default function decorate(block) {
  const rows = [...block.children];
  const [rightRow, leftRow] = rows;
  if (!rightRow || !leftRow) return;

  rightRow.className = 'image-compare-right';
  leftRow.className = 'image-compare-left';

  const overlayImg = leftRow.querySelector('img');

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

  // Pin the overlay image to the full block width so the 50% clipping
  // container reveals half of a full-size image (not a shrunken one).
  const pinOverlayWidth = () => {
    const { width } = block.getBoundingClientRect();
    if (overlayImg && width) overlayImg.style.width = `${width}px`;
  };

  // Reveal position: the visible slice of the overlay tracks the range value.
  const update = () => {
    leftRow.style.width = `${range.value}%`;
  };

  pinOverlayWidth();
  update();
  range.addEventListener('input', update);

  // Keep the overlay width in sync on layout changes (responsive/resize).
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(pinOverlayWidth);
    ro.observe(block);
  } else {
    window.addEventListener('resize', pinOverlayWidth);
  }

  // Re-pin once the base image has loaded and the block has its final size.
  const baseImg = rightRow.querySelector('img');
  if (baseImg && !baseImg.complete) {
    baseImg.addEventListener('load', pinOverlayWidth, { once: true });
  }
}
