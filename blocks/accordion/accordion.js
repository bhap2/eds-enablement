/*
 * Accordion Block
 * Renders label/body rows as collapsible items using native <details>/<summary>
 * for built-in keyboard accessibility.
 *
 * Content model: each row has two cells — cell 1 = the question/label,
 * cell 2 = the answer/body.
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const label = cells[0];
    const body = cells[1];
    if (!label) return;

    const details = document.createElement('details');
    details.className = 'accordion-item';

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    while (label.firstChild) summary.append(label.firstChild);
    details.append(summary);

    if (body) {
      body.className = 'accordion-item-body';
      details.append(body);
    }

    row.replaceWith(details);
  });
}
