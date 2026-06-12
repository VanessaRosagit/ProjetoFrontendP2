/* catalog.js — Página inicial (index.html)
 * buildPage() constrói 100% do DOM. Sem innerHTML.
 */

let allProducts   = [];
let allCategories = [];
let activeCategory = '';
let searchQuery    = '';

/* =============================================
   Construção da página
   ============================================= */

function buildPage() {
  document.title = 'Encanto Íntimo — Lingerie & Moda Íntima';

  document.body.appendChild(buildHeader({ activePage: 'catalog' }));

  const pageBody = el('div', { classes: ['page-body'] });

  // Hero
  pageBody.appendChild(buildHero());

  // Catálogo principal
  const main = el('main', {
    classes: ['page-main'],
    attrs: { id: 'catalogo', 'aria-label': 'Catálogo de produtos' },
  });
  const container = el('div', { classes: ['container'] });

  // Cabeçalho da seção
  const sectionHeader = el('div', { classes: ['section-header'] });
  sectionHeader.appendChild(el('h2', { classes: ['section-title'], text: 'Nossa Coleção' }));
  sectionHeader.appendChild(el('div', { classes: ['section-divider'] }));
  sectionHeader.appendChild(el('p', { classes: ['section-subtitle'], text: 'Lingerie e moda íntima para todos os momentos' }));
  container.appendChild(sectionHeader);

  // Toolbar de busca + filtro
  const toolbar = el('section', { classes: ['catalog-toolbar'], attrs: { 'aria-label': 'Filtros de busca' } });

  const searchWrap = el('div', { classes: ['search-wrap'] });
  searchWrap.appendChild(el('label', { classes: ['visually-hidden'], text: 'Buscar produto', attrs: { for: 'search-input' } }));
  searchWrap.appendChild(el('input', {
    classes: ['form-input', 'search-input'],
    attrs: { id: 'search-input', type: 'search', placeholder: 'Buscar produto…', autocomplete: 'off', 'aria-controls': 'product-grid' },
  }));
  const searchIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  searchIcon.setAttribute('viewBox', '0 0 24 24'); searchIcon.setAttribute('fill', 'none');
  searchIcon.setAttribute('stroke', 'currentColor'); searchIcon.setAttribute('stroke-width', '2');
  searchIcon.setAttribute('aria-hidden', 'true'); searchIcon.classList.add('search-icon');
  const sc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  sc.setAttribute('cx', '11'); sc.setAttribute('cy', '11'); sc.setAttribute('r', '8');
  const sp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  sp.setAttribute('d', 'M21 21l-4.35-4.35');
  searchIcon.appendChild(sc); searchIcon.appendChild(sp);
  searchWrap.appendChild(searchIcon);

  const filterWrap = el('div', { classes: ['filter-wrap'] });
  filterWrap.appendChild(el('label', { classes: ['visually-hidden'], text: 'Filtrar por categoria', attrs: { for: 'category-filter' } }));
  const categorySelect = el('select', {
    classes: ['form-select', 'category-select'],
    attrs: { id: 'category-filter', 'aria-controls': 'product-grid' },
  });
  categorySelect.appendChild(el('option', { text: 'Todas as categorias', attrs: { value: '' } }));
  filterWrap.appendChild(categorySelect);

  toolbar.appendChild(searchWrap);
  toolbar.appendChild(filterWrap);
  container.appendChild(toolbar);

  // Chips de categorias
  container.appendChild(el('nav', {
    classes: ['category-chips'],
    attrs: { id: 'category-chips', 'aria-label': 'Filtro rápido por categoria' },
  }));

  // Contagem de resultados
  container.appendChild(el('p', {
    classes: ['results-count'],
    attrs: { id: 'results-count', 'aria-live': 'polite', 'aria-atomic': 'true' },
  }));

  // Grid de produtos
  container.appendChild(el('section', {
    classes: ['product-grid'],
    attrs: { id: 'product-grid', 'aria-label': 'Produtos', 'aria-live': 'polite' },
  }));

  main.appendChild(container);
  pageBody.appendChild(main);
  pageBody.appendChild(buildFooter());
  document.body.appendChild(pageBody);
}

function buildHero() {
  const hero = el('section', { classes: ['hero'], attrs: { 'aria-labelledby': 'hero-heading' } });
  const inner = el('div', { classes: ['container', 'hero__inner'] });

  // Conteúdo textual
  const content = el('div', { classes: ['hero__content'] });
  content.appendChild(el('span', { classes: ['hero__badge'], text: 'Nova Coleção 2025' }));
  content.appendChild(el('p', { classes: ['hero__eyebrow'], text: 'Elegância em cada detalhe' }));

  const h1 = el('h1', { classes: ['hero__title'], attrs: { id: 'hero-heading' } });
  h1.appendChild(document.createTextNode('Lingerie que valoriza\ncada '));
  h1.appendChild(el('em', { text: 'curva' }));
  content.appendChild(h1);

  content.appendChild(el('p', {
    classes: ['hero__subtitle'],
    text: 'Da calcinha delicada ao body sofisticado — encontre a peça perfeita para cada momento.',
  }));
  const ctaRow = el('div', { classes: ['hero__cta'] });
  ctaRow.appendChild(el('a', { classes: ['btn', 'btn-primary', 'btn-lg'], text: 'Ver catálogo', attrs: { href: '#catalogo' } }));
  content.appendChild(ctaRow);

  const illu = el('div', { classes: ['hero__illustration'], attrs: { 'aria-hidden': 'true' } });
  const logoWrap = el('div', { classes: ['hero__logo-wrap'] });
  logoWrap.appendChild(el('img', { classes: ['hero__logo-img'], attrs: { src: 'img/logo.jfif', alt: '' } }));
  const logoOverlay = el('div', { classes: ['hero__logo-overlay'] });
  logoOverlay.appendChild(el('span', { classes: ['hero__logo-name'], text: 'Encanto' }));
  logoOverlay.appendChild(el('span', { classes: ['hero__logo-name', 'hero__logo-name--accent'], text: 'Íntimo' }));
  logoWrap.appendChild(logoOverlay);
  illu.appendChild(logoWrap);

  inner.appendChild(content);
  inner.appendChild(illu);
  hero.appendChild(inner);
  return hero;
}

/* =============================================
   Lógica do catálogo
   ============================================= */

buildPage();
initCatalog();

async function initCatalog() {
  syncHeader();
  await loadProducts();
  bindSearch();
  bindCategorySelect();
}

function loadCategories(produtos) {
  const cats = [...new Set(produtos.map(p => p.categoria?.nome ?? p.categoria ?? '').filter(Boolean))];
  const list = cats.map(nome => ({ id: nome, nome }));
  allCategories = list;
  populateCategorySelect(list);
  populateCategoryChips(list);
}

async function loadProducts() {
  const grid = document.getElementById('product-grid');
  showLoadingState(grid, 'Buscando produtos…');
  const local = produtosLocal.listar();
  if (local.length > 0) {
    allProducts = local;
    loadCategories(local);
    renderProducts(local);
    return;
  }
  const { data, error } = await catalogoApi.listarProdutos();
  const fromApi = !error ? (Array.isArray(data) ? data : (data?.produtos ?? data?.data ?? [])) : [];
  const list = fromApi.length > 0 ? fromApi : PRODUTOS_FIXOS;
  allProducts = list;
  loadCategories(list);
  renderProducts(list);
}

function renderProducts(products) {
  const grid    = document.getElementById('product-grid');
  const counter = document.getElementById('results-count');
  clearChildren(grid);
  counter.textContent = products.length > 0
    ? `${products.length} produto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`
    : '';
  if (products.length === 0) {
    showEmptyState(grid, 'Nenhum produto encontrado', 'Tente ajustar o filtro ou o termo de busca.');
    return;
  }
  const fragment = document.createDocumentFragment();
  products.forEach(product => fragment.appendChild(createProductCard(product)));
  grid.appendChild(fragment);
}

function createProductCard(product) {
  const categoryName = getCategoryName(product.categoriaId ?? product.categoria_id ?? product.categoria);
  const card = el('article', { classes: ['product-card'] });
  const link = el('a', { attrs: { href: `index.html?page=produto&id=${product.id}`, 'aria-label': `Ver detalhes de ${product.nome}` } });

  // Imagem
  const imageWrap = el('div', { classes: ['product-card__image-wrap'] });
  if (product.imagem || product.imagemUrl || product.image_url) {
    const rawUrl = product.imagem ?? product.imagemUrl ?? product.image_url;
    const img = el('img', { attrs: { src: cloudinaryBgWhite(rawUrl), alt: product.nome, loading: 'lazy' } });
    img.addEventListener('error', () => { imageWrap.removeChild(img); imageWrap.appendChild(createProductPlaceholder()); });
    imageWrap.appendChild(img);
  } else {
    imageWrap.appendChild(createProductPlaceholder());
  }

  // Corpo
  const body = el('div', { classes: ['product-card__body'] });
  if (categoryName) body.appendChild(el('p', { classes: ['product-card__category'], text: categoryName }));
  body.appendChild(el('h2', { classes: ['product-card__name'], text: product.nome }));
  if (product.descricao) body.appendChild(el('p', { classes: ['product-card__description'], text: product.descricao }));

  // Rodapé
  const footer = el('div', { classes: ['product-card__footer'] });
  footer.appendChild(el('span', { classes: ['product-card__price'], text: formatPrice(product.preco ?? product.price ?? 0) }));
  footer.appendChild(el('span', { classes: ['btn', 'btn-primary', 'btn-sm'], text: 'Ver detalhes', attrs: { 'aria-hidden': 'true' } }));

  link.appendChild(imageWrap);
  link.appendChild(body);
  link.appendChild(footer);
  card.appendChild(link);
  return card;
}

function createProductPlaceholder() {
  return svgIcon(
    'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 3H8L6 7h12l-2-4z',
    48, { classes: ['product-card__placeholder-icon'] }
  );
}

/* =============================================
   Categorias
   ============================================= */

function populateCategorySelect(categories) {
  const select = document.getElementById('category-filter');
  categories.forEach(cat => {
    select.appendChild(el('option', { attrs: { value: cat.id ?? cat.nome }, text: cat.nome }));
  });
}

function populateCategoryChips(categories) {
  const container = document.getElementById('category-chips');
  container.appendChild(createChip('Todas', '', true));
  categories.forEach(cat => container.appendChild(createChip(cat.nome, cat.id ?? cat.nome, false)));
}

function createChip(label, value, isActive) {
  const chip = el('button', {
    classes: isActive ? ['chip', 'active'] : ['chip'],
    text: label,
    attrs: { type: 'button', 'data-value': value, 'aria-pressed': isActive ? 'true' : 'false' },
  });
  chip.addEventListener('click', () => selectChip(chip, value));
  return chip;
}

function selectChip(selectedChip, value) {
  document.querySelectorAll('.chip').forEach(c => { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
  selectedChip.classList.add('active');
  selectedChip.setAttribute('aria-pressed', 'true');
  document.getElementById('category-filter').value = value;
  activeCategory = value;
  applyFilters();
}

function getCategoryName(catIdOrName) {
  if (!catIdOrName) return '';
  const found = allCategories.find(c => c.id === catIdOrName || c.nome === catIdOrName);
  return found ? found.nome : String(catIdOrName);
}

/* =============================================
   Filtros
   ============================================= */

function bindSearch() {
  const input = document.getElementById('search-input');
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { searchQuery = input.value.trim().toLowerCase(); applyFilters(); }, 300);
  });
}

function bindCategorySelect() {
  const select = document.getElementById('category-filter');
  select.addEventListener('change', () => {
    activeCategory = select.value;
    document.querySelectorAll('.chip').forEach(chip => {
      const match = chip.dataset.value === activeCategory || (activeCategory === '' && chip.dataset.value === '');
      chip.classList.toggle('active', match);
      chip.setAttribute('aria-pressed', match ? 'true' : 'false');
    });
    applyFilters();
  });
}

function applyFilters() {
  let filtered = allProducts;
  if (activeCategory) {
    filtered = filtered.filter(p => String(p.categoriaId ?? p.categoria_id ?? p.categoria) === String(activeCategory));
  }
  if (searchQuery) {
    filtered = filtered.filter(p => {
      const cat = (p.categoria?.nome ?? p.categoria ?? '').toLowerCase();
      return p.nome?.toLowerCase().includes(searchQuery) ||
             p.descricao?.toLowerCase().includes(searchQuery) ||
             cat.includes(searchQuery);
    });
  }
  renderProducts(filtered);
}
