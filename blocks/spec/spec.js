/*
 * Spec Block
 * Renders a two-column key/value specification table. Each authored row is a
 * spec: the first cell is the label, the second the value.
 */

/**
 * loads and decorates the spec block
 * @param {Element} block The spec block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('spec-row');
    const cells = [...row.children];
    if (cells[0]) cells[0].classList.add('spec-label');
    if (cells[1]) cells[1].classList.add('spec-value');
  });
}
