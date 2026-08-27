/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns
 * Base block: columns
 * Source: https://wknd-trendsetters.site/fashion-trends-young-adults-casual-sport
 * Generated: 2026-08-26
 *
 * Structure (from library-description.txt): flexible columns block. First row is the
 * block name; the second (content) row has as many cells as there are visual columns.
 * In this source, the matched element is a `.grid-layout` whose direct children are the
 * columns (e.g. a text column + an image column, in either order across instances).
 */
export default function parse(element, { document }) {
  // Guard against nested grids: the masthead's outer `.grid-layout` contains an inner
  // `.grid-layout` holding the images. The descendant selector matches both, so skip
  // any grid nested inside another grid-layout — its content is already captured as a
  // cell of the outer columns block. Unwrap it rather than emitting a stray block.
  //
  // The outer grid is parsed first and, via createBlock, MOVES the inner grid node into
  // a generated <table> cell. By the time the inner grid is parsed its parent grid no
  // longer exists, so `parentElement.closest('.grid-layout')` misses it — but it now
  // lives inside that generated table. Detecting either state unwraps the inner grid to
  // its children (the images render inline in the cell) instead of a stray nested block.
  if (element.closest('table')
    || (element.parentElement && element.parentElement.closest('.grid-layout'))) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Each direct child of the grid is one visual column.
  let columnEls = Array.from(element.querySelectorAll(':scope > div'));

  // Fallback: if the grid has no direct-child divs, treat all direct children as columns.
  if (columnEls.length === 0) {
    columnEls = Array.from(element.children);
  }

  // Empty-block guard: nothing to lay out.
  if (columnEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single content row: one cell per column, each cell holds that column's element.
  const cells = [columnEls];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
