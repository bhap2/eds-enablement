/* eslint-disable */
/* global WebImporter */
import columnsParser from "./parsers/columns.js";
import cleanupTransformer from "./transformers/wknd-trendsetters-cleanup.js";
import sectionsTransformer from "./transformers/wknd-trendsetters-sections.js";
const parsers = { columns: columnsParser };
const transformers = [cleanupTransformer, sectionsTransformer];
const PAGE_TEMPLATE = {
  "name": "blog-post",
  "urls": [
    "https://wknd-trendsetters.site/blog/ace-pro-court-polo"
  ],
  "blocks": [
    {
      "name": "columns",
      "instances": [
        "section.section:nth-of-type(1) .grid-layout"
      ]
    }
  ]
};
function executeTransformers(h,el,p){const e={...p,template:PAGE_TEMPLATE};transformers.forEach(f=>{try{f.call(null,h,el,e);}catch(x){console.error(x);}});}
function findBlocksOnPage(d,t){const b=[];t.blocks.forEach(bd=>{if(!parsers[bd.name])return;bd.instances.forEach(s=>{d.querySelectorAll(s).forEach(el=>b.push({name:bd.name,selector:s,element:el}));});});return b;}
export default { transform: (payload) => {
  const { document, url, html, params } = payload;
  const main = document.body;
  executeTransformers("beforeTransform", main, payload);
  const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
  pageBlocks.forEach(bl=>{ if(!bl.element.parentNode) return; const pr=parsers[bl.name]; if(pr){try{pr(bl.element,{document,url,params});}catch(e){console.error("parse fail",bl.name,e);}} });
  executeTransformers("afterTransform", main, payload);
  const hr=document.createElement("hr"); main.appendChild(hr);
  WebImporter.rules.createMetadata(main, document);
  WebImporter.rules.transformBackgroundImages(main, document);
  WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
  const rawPath=new URL(params.originalURL).pathname.replace(/\/$/,"").replace(/\.html?$/,"");
  const path=WebImporter.FileUtils.sanitizePath(rawPath===""?"/index":rawPath);
  return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map(b=>b.name) } }];
} };
