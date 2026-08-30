import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Cards (testimonial variant) — tabbed carousel.
 * Source layout: one large featured panel (photo + name/role/quote) with a
 * strip of tabs below (name/role). Clicking a tab swaps the featured panel.
 * Each authored row = a testimonial: [ picture ][ h3 name, p role, p quote ].
 */
export default function decorate(block) {
  // Parse authored rows into testimonial records.
  const items = [...block.children].map((row) => {
    const cells = [...row.children];
    const picCell = cells.find((c) => c.querySelector('picture'));
    const bodyCell = cells.find((c) => c !== picCell) || cells[cells.length - 1];
    const name = bodyCell.querySelector('h3')?.textContent.trim() || '';
    const paras = [...bodyCell.querySelectorAll('p')];
    const role = paras[0]?.textContent.trim() || '';
    const quote = paras[paras.length - 1]?.textContent.trim() || '';
    const img = picCell?.querySelector('img');
    return {
      name, role, quote, img,
    };
  }).filter((it) => it.name);

  if (!items.length) return;

  const panel = document.createElement('div');
  panel.className = 'cards-testimonial-panel';

  const tablist = document.createElement('div');
  tablist.className = 'cards-testimonial-tablist';
  tablist.setAttribute('role', 'tablist');

  function renderPanel(item) {
    panel.replaceChildren();
    if (item.img) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'cards-testimonial-panel-image';
      imgWrap.append(createOptimizedPicture(item.img.src, item.name, false, [
        { media: '(min-width: 900px)', width: '750' },
        { width: '600' },
      ]));
      panel.append(imgWrap);
    }
    const body = document.createElement('div');
    body.className = 'cards-testimonial-panel-body';
    const nameEl = document.createElement('p');
    nameEl.className = 'cards-testimonial-panel-name';
    const nameStrong = document.createElement('strong');
    nameStrong.textContent = item.name;
    nameEl.append(nameStrong);
    const roleEl = document.createElement('p');
    roleEl.className = 'cards-testimonial-panel-role';
    roleEl.textContent = item.role;
    const quoteEl = document.createElement('p');
    quoteEl.className = 'cards-testimonial-panel-quote';
    quoteEl.textContent = item.quote;
    body.append(nameEl, roleEl, quoteEl);
    panel.append(body);
  }

  function select(index) {
    renderPanel(items[index]);
    [...tablist.children].forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  items.forEach((item, i) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'cards-testimonial-tab';
    tab.setAttribute('role', 'tab');

    // avatar thumbnail (source shows a small round photo in each tab)
    if (item.img) {
      const avatar = document.createElement('span');
      avatar.className = 'cards-testimonial-tab-avatar';
      avatar.append(createOptimizedPicture(item.img.src, item.name, false, [{ width: '96' }]));
      tab.append(avatar);
    }

    const text = document.createElement('span');
    text.className = 'cards-testimonial-tab-text';
    const tabName = document.createElement('strong');
    tabName.textContent = item.name;
    const tabRole = document.createElement('span');
    tabRole.textContent = item.role;
    text.append(tabName, tabRole);
    tab.append(text);

    tab.addEventListener('click', () => select(i));
    tablist.append(tab);
  });

  select(0);
  block.replaceChildren(panel, tablist);

  // Cleanup: the import leaves stray name-only paragraphs (the source tab
  // labels) in a sibling default-content-wrapper within the same section. They
  // duplicate the tab strip, so remove any <p> in this section whose text
  // matches one of the testimonial names. Drop an emptied wrapper too.
  const names = new Set(items.map((it) => it.name));
  const section = block.closest('.section') || block.parentElement;
  if (section) {
    section.querySelectorAll('p').forEach((p) => {
      if (block.contains(p)) return;
      if (names.has(p.textContent.trim())) {
        const dcw = p.closest('.default-content-wrapper');
        p.remove();
        if (dcw && dcw.children.length === 0) dcw.remove();
      }
    });
  }
}
