/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: banner
 * Base block: banner
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-26
 *
 * Maps `section.inverse-section`: a full-bleed background image with an overlaid card body
 * (h1/h2 title, subheading paragraph, CTA button). Target model (blocks/banner/banner.js):
 *   row 1: the background image
 *   row 2: the overlay content (title + subheading + CTA)
 * banner.js reads the first picture and the first heading (falling back to the first
 * paragraph) for the title; the remaining content is preserved so no source text is dropped.
 */
export default function parse(element, { document }) {
  // Background/overlay image.
  const image = element.querySelector('img');

  // Overlay content lives in the card body; fall back to the section itself.
  const body = element.querySelector('.card-body') || element;

  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  const subheading = body.querySelector('p, .subheading');
  const cta = body.querySelector('a.button, a.inverse-button, .button-group a, a');

  // Empty-block guard: nothing meaningful to render.
  if (!image && !heading && !subheading) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (image) cells.push([image]);

  // Content row: title first (banner.js uses it), then subheading and CTA for completeness.
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  if (cta) contentCell.push(cta);
  if (contentCell.length === 0) contentCell.push(document.createElement('h2'));
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'banner', cells });
  element.replaceWith(block);
}
