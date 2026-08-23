/*
 * Employee List Block
 * Renders a published employees sheet (JSON) 10 rows at a time, with a
 * "Load more" button (label sourced from the placeholders sheet) that
 * appends the next 10.
 *
 * Content model: the block contains a link to the employees JSON path,
 * e.g. /employees. Defaults to /employees.json if none is authored.
 */

const PAGE_SIZE = 10;

/**
 * Fetches the placeholders sheet and returns it as a key/value object.
 * Falls back to an empty object on any error.
 * @param {string} prefix optional language/root prefix (e.g. '' or '/en')
 */
async function fetchPlaceholders(prefix = '') {
  try {
    const resp = await fetch(`${prefix}/placeholders.json`);
    if (!resp.ok) return {};
    const json = await resp.json();
    return (json.data || []).reduce((acc, row) => {
      const key = row.Key || row.key;
      const value = row.Text ?? row.Value ?? row.text ?? row.value;
      if (key) acc[key] = value;
      return acc;
    }, {});
  } catch (e) {
    return {};
  }
}

/**
 * Builds a single employee row element.
 * @param {object} emp employee record
 */
function renderEmployee(emp) {
  const li = document.createElement('li');
  li.className = 'employee-list-item';
  li.innerHTML = `
    <span class="employee-list-name">${emp.Name || ''}</span>
    <span class="employee-list-department">${emp.Department || ''}</span>
    <span class="employee-list-experience">${emp.Experience || ''} yrs</span>
    <span class="employee-list-city">${emp.City || ''}</span>`;
  return li;
}

/**
 * loads and decorates the employee-list block
 * @param {Element} block The employee-list block element
 */
export default async function decorate(block) {
  const link = block.querySelector('a');
  let dataPath = link ? link.getAttribute('href') : block.textContent.trim();
  if (!dataPath) dataPath = '/employees';
  // normalise to the .json resource
  const jsonPath = dataPath.endsWith('.json') ? dataPath : `${dataPath}.json`;

  block.textContent = '';

  let employees = [];
  try {
    const resp = await fetch(jsonPath);
    if (resp.ok) {
      const json = await resp.json();
      employees = json.data || [];
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to load employees data:', e);
  }

  const placeholders = await fetchPlaceholders();
  const loadMoreLabel = placeholders.loadMore || 'Load more';

  const list = document.createElement('ul');
  list.className = 'employee-list-items';
  block.append(list);

  let shown = 0;
  const renderNext = () => {
    const next = employees.slice(shown, shown + PAGE_SIZE);
    next.forEach((emp) => list.append(renderEmployee(emp)));
    shown += next.length;
  };

  renderNext();

  // "Load more" button — only when there are more rows to show
  if (employees.length > PAGE_SIZE) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'employee-list-load-more';
    button.textContent = loadMoreLabel;
    block.append(button);

    button.addEventListener('click', () => {
      renderNext();
      if (shown >= employees.length) button.remove();
    });
  }
}
