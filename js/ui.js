/* ui.js — Utilitários de DOM e builders compartilhados entre páginas
 
 */

/* =============================================
   createElement helper
   ============================================= */

function el(tag, opts = {}) {
  const node = document.createElement(tag);
  if (opts.classes)   node.classList.add(...opts.classes);
  if (opts.attrs)     for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
  if (opts.style)     Object.assign(node.style, opts.style);
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.children)  for (const child of opts.children) { if (child) node.appendChild(child); }
  return node;
}

function clearChildren(parent) {
  while (parent.firstChild) parent.removeChild(parent.firstChild);
}

/* =============================================
   SVG helpers
   ============================================= */

function svgIcon(pathD, size = 20, opts = {}) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  if (opts.classes) svg.classList.add(...opts.classes);

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathD);
  svg.appendChild(path);
  return svg;
}

function buildLogoSvg() {
  return el('img', {
    classes: ['logo-icon'],
    attrs: { src: 'img/logo.jfif', alt: 'Encanto Íntimo' },
  });
}

/* =============================================
   Toast
   ============================================= */

function showToast(message, type = 'success', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = el('div', { attrs: { id: 'toast-container', 'aria-live': 'polite' } });
    document.body.appendChild(container);
  }
  const toast = el('div', {
    classes: ['toast', type === 'error' ? 'toast-error' : 'toast-success'],
    text: message,
    attrs: { role: 'status' },
  });
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

/* =============================================
   Modal
   ============================================= */

const modalManager = {
  _stack: [],
  open(modalId) {
    const backdrop = document.getElementById(modalId);
    if (!backdrop) return;
    backdrop.classList.remove('hidden');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this._stack.push(modalId);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.close(modalId);
    }, { once: true });
  },
  close(modalId) {
    const backdrop = document.getElementById(modalId);
    if (!backdrop) return;
    backdrop.classList.add('hidden');
    backdrop.setAttribute('aria-hidden', 'true');
    this._stack = this._stack.filter(id => id !== modalId);
    if (this._stack.length === 0) document.body.style.overflow = '';
  },
  closeAll() { [...this._stack].forEach(id => this.close(id)); },
};

/* =============================================
   Spinner / Loading states
   ============================================= */

function createSpinner(large = false) {
  return el('span', {
    classes: large ? ['spinner', 'spinner-lg'] : ['spinner'],
    attrs: { 'aria-hidden': 'true' },
  });
}

function showLoadingState(container, message = 'Carregando...') {
  clearChildren(container);
  const wrapper = el('div', { classes: ['loading-state'] });
  wrapper.appendChild(createSpinner(true));
  wrapper.appendChild(el('p', { text: message }));
  container.appendChild(wrapper);
}

function showEmptyState(container, title, message) {
  clearChildren(container);
  const wrapper = el('div', { classes: ['empty-state'] });
  const icon = svgIcon(
    'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 3H8L6 7h12l-2-4z',
    48, { classes: ['empty-state__icon'] }
  );
  wrapper.appendChild(icon);
  wrapper.appendChild(el('p', { classes: ['empty-state__title'], text: title }));
  if (message) wrapper.appendChild(el('p', { text: message }));
  container.appendChild(wrapper);
}

/* =============================================
   Formulário helpers
   ============================================= */

function serializeForm(form) {
  const data = {};
  form.querySelectorAll('[name]').forEach(input => {
    data[input.name] = input.type === 'checkbox' ? input.checked : input.value.trim();
  });
  return data;
}

function showFieldError(fieldName, message) {
  const input = document.querySelector(`[name="${fieldName}"]`);
  const errEl = document.getElementById(`${fieldName}-error`);
  if (input)  input.classList.add('is-invalid');
  if (errEl) { errEl.textContent = message; errEl.classList.add('visible'); }
}

function clearFormErrors(wrapper) {
  wrapper.querySelectorAll('.is-invalid').forEach(i => i.classList.remove('is-invalid'));
  wrapper.querySelectorAll('.field-error').forEach(e => { e.textContent = ''; e.classList.remove('visible'); });
}

/* =============================================
   Builders compartilhados: Header e Footer
   ============================================= */

function buildHeader(opts = {}) {
  const header = el('header', { classes: ['site-header'], attrs: { role: 'banner' } });
  const container = el('div', { classes: ['container'] });

  // Logo
  const logoLink = el('a', {
    classes: ['logo'],
    attrs: { href: 'index.html', 'aria-label': 'Encanto Íntimo — Página inicial' },
  });
  logoLink.appendChild(buildLogoSvg());
  logoLink.appendChild(document.createTextNode('Encanto'));
  logoLink.appendChild(el('span', { text: 'Íntimo' }));

  // Nav
  const nav = el('nav', { classes: ['site-nav'], attrs: { 'aria-label': 'Navegação principal' } });

  const navItems = [
    { text: 'Catálogo', href: 'index.html', active: opts.activePage === 'catalog' },
    { text: 'Seja Vendedor', href: 'index.html?page=contatos', active: opts.activePage === 'contatos' },
  ];
  if (opts.activePage === 'admin') {
    navItems.push({ text: 'Admin', href: 'index.html?page=admin', active: true });
  }
  navItems.forEach(({ text, href, active }) => {
    const a = el('a', { text, attrs: active ? { href, 'aria-current': 'page' } : { href } });
    nav.appendChild(a);
  });

  // Área do usuário (populada por syncHeader)
  const navUser = el('div', { classes: ['nav-user'], attrs: { 'aria-label': 'Área do usuário' } });

  container.appendChild(logoLink);
  container.appendChild(nav);
  container.appendChild(navUser);
  header.appendChild(container);
  return header;
}

function buildFooter() {
  const footer = el('footer', { classes: ['site-footer'], attrs: { role: 'contentinfo' } });
  const p = el('p');
  p.appendChild(document.createTextNode('© 2025 '));
  p.appendChild(el('strong', { text: 'Encanto Íntimo' }));
  p.appendChild(document.createTextNode('. Projeto acadêmico FATEC São Roque — P2 Frontend. Desenvolvido por '));
  p.appendChild(el('strong', { text: 'Vanessa AP Rosa da Silva' }));
  p.appendChild(document.createTextNode('.'));
  footer.appendChild(p);
  return footer;
}

/* =============================================
   Navegação / Auth guard
   ============================================= */

function requireAuth(redirectBack) {
  if (!auth.isLoggedIn()) {
    const back = redirectBack ?? window.location.href;
    window.location.href = `index.html?page=login&redirect=${encodeURIComponent(back)}`;
    return false;
  }
  return true;
}

function syncHeader() {
  const navUser = document.querySelector('.nav-user');
  if (!navUser) return;
  clearChildren(navUser);

  if (auth.isLoggedIn()) {
    const user = auth.getUser();
    const name = user?.nome ?? user?.name ?? 'Admin';

    navUser.appendChild(el('span', {
      classes: ['nav-greeting'],
      text: `Olá, ${name.split(' ')[0]}`,
    }));

    navUser.appendChild(el('a', {
      classes: ['nav-admin-link'],
      text: 'Painel Admin',
      attrs: { href: 'index.html?page=admin' },
    }));
    buildAdminFab();

    const logoutBtn = el('button', { classes: ['btn', 'btn-ghost', 'btn-sm'], text: 'Sair' });
    logoutBtn.addEventListener('click', () => { authApi.sair(); window.location.reload(); });
    navUser.appendChild(logoutBtn);
  } else {
    navUser.appendChild(el('a', {
      classes: ['btn', 'btn-primary', 'btn-sm'],
      text: 'Entrar',
      attrs: { href: 'index.html?page=login' },
    }));
  }
}

function buildAdminFab() {
  if (document.getElementById('admin-fab')) return;
  const fab = el('a', {
    attrs: { id: 'admin-fab', href: 'index.html?page=admin', title: 'Painel Administrativo' },
  });
  const icon = svgIcon('M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z', 22);
  fab.appendChild(icon);
  fab.appendChild(el('span', { text: 'Admin' }));
  document.body.appendChild(fab);
}

/* =============================================
   Utilitários
   ============================================= */

function cloudinaryBgWhite(url) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/b_white,c_pad/');
}

function formatPrice(value) {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return 'R$ —';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
