/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters site-wide cleanup.
 * Removes non-authorable site chrome so the import contains only the
 * page-level authorable content inside <main id="main-content">.
 *
 * Selectors verified against migration-work/cleaned.html:
 *  - a.skip-link            : "Skip to main content" accessibility link (line 1)
 *  - div.navbar             : top navigation bar + mega menu / mobile toggle (lines 1-47)
 *  - footer.footer          : site footer with logo, social icons, link columns (line 58+)
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome (from captured DOM).
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      'div.navbar',
      'footer.footer',
    ]);
  }
}
