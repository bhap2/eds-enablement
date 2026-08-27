/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsParser from './parsers/columns.js';
import cardsGalleryParser from './parsers/cards-gallery.js';
import cardsTestimonialParser from './parsers/cards-testimonial.js';
import articleListParser from './parsers/article-list.js';
import bannerParser from './parsers/banner.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PARSER REGISTRY
const parsers = {
  columns: columnsParser,
  'cards-gallery': cardsGalleryParser,
  'cards-testimonial': cardsTestimonialParser,
  'article-list': articleListParser,
  banner: bannerParser,
};

const transformers = [cleanupTransformer, sectionsTransformer];

const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Landing layout with hero, feature sections, card grids and CTA',
  urls: ['https://wknd-trendsetters.site/'],
  blocks: [
    { name: 'columns', instances: ['header.secondary-section .grid-layout', 'section.secondary-section:nth-of-type(2) .grid-layout'] },
    { name: 'cards-gallery', instances: ['section.secondary-section:nth-of-type(2) .grid-layout.desktop-4-column'] },
    { name: 'cards-testimonial', instances: ['.tab-menu', '.grid-layout.desktop-4-column.tab-menu'] },
    { name: 'article-list', instances: ['.article-card-grid', 'section.secondary-section:nth-of-type(4) .grid-layout'] },
    { name: 'banner', instances: ['section.inverse-section'] },
  ],
};

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    if (!parsers[blockDef.name]) return;
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
