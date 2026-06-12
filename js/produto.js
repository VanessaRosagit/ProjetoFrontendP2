/* produto.js — Página de detalhe do produto
 * buildPage() constrói 100% do DOM. Sem innerHTML.
 */

(() => {
  const id = getParam('id');
  if (!id) { window.location.href = 'index.html'; return; }

  buildPage();
  syncHeader();

  const content = document.getElementById('product-content');
  showLoadingState(content, 'Carregando produto…');

  const numId = isNaN(id) ? id : Number(id);
  const data  = produtosLocal.listar().find(p => p.id === numId || p.id === id);
  clearChildren(content);

  if (!data) {
    const alertEl = el('div', { classes: ['alert', 'alert-error'] });
    alertEl.appendChild(el('p', { text: 'Produto não encontrado.' }));
    content.appendChild(alertEl);
    content.appendChild(el('a', { classes: ['back-link'], text: '← Voltar ao catálogo', attrs: { href: 'index.html' } }));
    return;
  }

  document.title = `${data.nome} — Encanto Íntimo`;
  const crumb = document.getElementById('breadcrumb-name');
  if (crumb) crumb.textContent = data.nome;

  content.appendChild(buildProductDetail(data));
})();

/* =============================================
   Construção da página
   ============================================= */

function buildPage() {
  document.body.appendChild(buildHeader({ activePage: 'catalog' }));

  const pageBody = el('div', { classes: ['page-body'] });

  const main = el('main', {
    classes: ['page-main'],
    attrs: { id: 'product-detail', 'aria-live': 'polite' },
  });
  const container = el('div', { classes: ['container'] });

  // Breadcrumb
  const nav = el('nav', { classes: ['breadcrumb'], attrs: { 'aria-label': 'Caminho' } });
  const ol  = el('ol',  { classes: ['breadcrumb__list'] });
  ol.appendChild(el('li', { children: [el('a', { text: 'Catálogo', attrs: { href: 'index.html' } })] }));
  ol.appendChild(el('li', { text: '›', attrs: { 'aria-hidden': 'true' } }));
  ol.appendChild(el('li', { attrs: { id: 'breadcrumb-name', 'aria-current': 'page' }, text: 'Produto' }));
  nav.appendChild(ol);
  container.appendChild(nav);

  container.appendChild(el('div', { attrs: { id: 'product-content' } }));
  main.appendChild(container);
  pageBody.appendChild(main);
  pageBody.appendChild(buildFooter());
  document.body.appendChild(pageBody);
}

/* =============================================
   Detalhe do produto
   ============================================= */

function buildProductDetail(product) {
  const article = el('article', { classes: ['product-detail'] });

  // Imagem
  const imageWrap = el('div', { classes: ['product-detail__image-wrap'] });
  const placeholderSvg = () => svgIcon(
    'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 3H8L6 7h12l-2-4z',
    64
  );
  if (product.imagem || product.imagemUrl || product.image_url) {
    const rawUrl = product.imagem ?? product.imagemUrl ?? product.image_url;
    const img = el('img', { attrs: { src: cloudinaryBgWhite(rawUrl), alt: product.nome } });
    img.addEventListener('error', () => { imageWrap.removeChild(img); imageWrap.appendChild(placeholderSvg()); });
    imageWrap.appendChild(img);
  } else {
    imageWrap.appendChild(placeholderSvg());
  }

  // Informações
  const info = el('div', { classes: ['product-detail__info'] });

  if (product.categoria || product.categoriaId) {
    info.appendChild(el('p', { classes: ['product-detail__category'], text: product.categoria?.nome ?? product.categoria ?? '' }));
  }
  info.appendChild(el('h1', { classes: ['product-detail__name'], text: product.nome }));
  if (product.descricao) {
    info.appendChild(el('p', { classes: ['product-detail__description'], text: product.descricao }));
  }

  info.appendChild(el('hr', { classes: ['product-detail__divider'] }));

  const priceBlock = el('div', { classes: ['product-detail__price-block'] });
  priceBlock.appendChild(el('span', { classes: ['product-detail__price'], text: formatPrice(product.preco ?? product.price ?? 0) }));
  info.appendChild(priceBlock);

  // Meta
  const dl = el('dl', { classes: ['product-detail__meta'] });
  if (product.id) {
    const div = el('div');
    div.appendChild(el('dt', { text: 'Código:' }));
    div.appendChild(el('dd', { text: String(product.id) }));
    dl.appendChild(div);
  }
  if (product.estoque !== undefined) {
    const div = el('div');
    div.appendChild(el('dt', { text: 'Estoque:' }));
    div.appendChild(el('dd', { text: `${product.estoque} unidades` }));
    dl.appendChild(div);
  }
  if (dl.children.length > 0) info.appendChild(dl);

  info.appendChild(el('a', { classes: ['back-link'], text: '← Voltar ao catálogo', attrs: { href: 'index.html' } }));

  article.appendChild(imageWrap);
  article.appendChild(info);
  return article;
}
