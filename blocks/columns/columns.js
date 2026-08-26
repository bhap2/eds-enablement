export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // article-header variant: a text column that begins with a breadcrumb
  // paragraph (two or more links) followed by an <h1>. Enhance the flat
  // meta paragraphs into grouped rows + a category pill.
  const textCol = [...block.querySelectorAll(':scope > div > div')].find((col) => {
    const first = col.firstElementChild;
    return (
      first
      && first.tagName === 'P'
      && first.querySelectorAll('a').length >= 2
      && col.querySelector('h1')
    );
  });

  if (textCol) {
    block.classList.add('columns-article-header');

    const breadcrumb = textCol.firstElementChild;
    breadcrumb.classList.add('columns-breadcrumb');

    const h1 = textCol.querySelector('h1');
    // meta = all paragraphs that appear after the heading
    let afterHeading = false;
    const meta = [...textCol.children].filter((el) => {
      if (el === h1) {
        afterHeading = true;
        return false;
      }
      return afterHeading && el.tagName === 'P';
    });

    if (meta.length) {
      // last meta paragraph is the category label -> pill
      const category = meta.pop();
      category.classList.add('columns-category');

      // group remaining meta paragraphs into rows:
      // author row = "By" + author name, date row = the rest
      const wrap = document.createElement('div');
      wrap.className = 'columns-meta';
      h1.after(wrap);

      const authorRow = document.createElement('div');
      authorRow.className = 'columns-meta-row columns-meta-author';
      const dateRow = document.createElement('div');
      dateRow.className = 'columns-meta-row columns-meta-date';

      meta.forEach((p, i) => {
        p.classList.add('columns-meta-item');
        (i < 2 ? authorRow : dateRow).append(p);
      });

      if (authorRow.children.length) wrap.append(authorRow);
      if (dateRow.children.length) wrap.append(dateRow);
      wrap.after(category);
    }
  }
}
