/* admin.js — Painel administrativo
 * buildPage() constrói 100% do DOM incluindo modais. Sem innerHTML.
 */

if (!requireAuth(window.location.href)) {
  // requireAuth já redireciona
} else {
  buildPage();
  syncHeader();
  bindTabs();
  bindModalCloseButtons();
  loadProdutos();

  document.getElementById('btn-novo-produto').addEventListener('click', () => openProdutoModal(null));
  document.getElementById('btn-novo-usuario').addEventListener('click', () => openUsuarioModal(null));

  const user = auth.getUser();
  if (user?.papel !== 'administrador') {
    const tabUsuarios = document.getElementById('tab-usuarios');
    if (tabUsuarios) tabUsuarios.style.display = 'none';
  }
}

/* =============================================
   Construção da página
   ============================================= */

function buildPage() {
  document.title = 'Painel Admin — Encanto Íntimo';

  document.body.appendChild(buildHeader({ activePage: 'admin', isPages: true }));

  const pageBody = el('div', { classes: ['page-body'] });
  const main = el('main', { classes: ['page-main'] });
  const container = el('div', { classes: ['container'] });

  // Título
  const adminHeader = el('div', { classes: ['admin-header'] });
  adminHeader.appendChild(el('h1', { classes: ['admin-title'], text: 'Painel Administrativo' }));
  container.appendChild(adminHeader);

  // Tabs
  const tabs = el('div', { classes: ['admin-tabs'], attrs: { role: 'tablist', 'aria-label': 'Seções do painel' } });
  tabs.appendChild(el('button', {
    classes: ['tab', 'active'],
    text: 'Produtos',
    attrs: { role: 'tab', id: 'tab-produtos', 'aria-selected': 'true', 'aria-controls': 'panel-produtos', 'data-tab': 'produtos', type: 'button' },
  }));
  tabs.appendChild(el('button', {
    classes: ['tab'],
    text: 'Usuários',
    attrs: { role: 'tab', id: 'tab-usuarios', 'aria-selected': 'false', 'aria-controls': 'panel-usuarios', 'data-tab': 'usuarios', type: 'button' },
  }));
  tabs.appendChild(el('button', {
    classes: ['tab'],
    text: 'Candidatos a Vendedor',
    attrs: { role: 'tab', id: 'tab-candidatos', 'aria-selected': 'false', 'aria-controls': 'panel-candidatos', 'data-tab': 'candidatos', type: 'button' },
  }));
  container.appendChild(tabs);

  // Painel Produtos
  const panelProdutos = el('section', {
    classes: ['admin-panel'],
    attrs: { id: 'panel-produtos', role: 'tabpanel', 'aria-labelledby': 'tab-produtos' },
  });
  const toolbarProdutos = el('div', { classes: ['panel-toolbar'] });
  toolbarProdutos.appendChild(el('h2', { classes: ['panel-title'], text: 'Produtos' }));
  toolbarProdutos.appendChild(el('button', { classes: ['btn', 'btn-primary'], text: '+ Novo produto', attrs: { id: 'btn-novo-produto', type: 'button' } }));
  panelProdutos.appendChild(toolbarProdutos);
  panelProdutos.appendChild(el('div', { attrs: { id: 'produtos-table-wrap' } }));
  container.appendChild(panelProdutos);

  // Painel Usuários
  const panelUsuarios = el('section', {
    classes: ['admin-panel', 'hidden'],
    attrs: { id: 'panel-usuarios', role: 'tabpanel', 'aria-labelledby': 'tab-usuarios' },
  });
  const toolbarUsuarios = el('div', { classes: ['panel-toolbar'] });
  toolbarUsuarios.appendChild(el('h2', { classes: ['panel-title'], text: 'Usuários' }));
  toolbarUsuarios.appendChild(el('button', { classes: ['btn', 'btn-primary'], text: '+ Novo usuário', attrs: { id: 'btn-novo-usuario', type: 'button' } }));
  panelUsuarios.appendChild(toolbarUsuarios);
  panelUsuarios.appendChild(el('div', { attrs: { id: 'usuarios-table-wrap' } }));
  container.appendChild(panelUsuarios);

  // Painel Candidatos
  const panelCandidatos = el('section', {
    classes: ['admin-panel', 'hidden'],
    attrs: { id: 'panel-candidatos', role: 'tabpanel', 'aria-labelledby': 'tab-candidatos' },
  });
  const toolbarCandidatos = el('div', { classes: ['panel-toolbar'] });
  toolbarCandidatos.appendChild(el('h2', { classes: ['panel-title'], text: 'Candidatos a Vendedor' }));
  panelCandidatos.appendChild(toolbarCandidatos);
  panelCandidatos.appendChild(el('div', { attrs: { id: 'candidatos-table-wrap' } }));
  container.appendChild(panelCandidatos);

  main.appendChild(container);
  pageBody.appendChild(main);
  pageBody.appendChild(buildFooter());
  document.body.appendChild(pageBody);

  // Modais
  document.body.appendChild(buildModalProduto());
  document.body.appendChild(buildModalUsuario());
  document.body.appendChild(buildModalConfirm());
}

/* =============================================
   Builders de modais
   ============================================= */

function buildModalBase(id, titleId, titleText, saveId, saveBtnText) {
  const backdrop = el('div', {
    classes: ['modal-backdrop', 'hidden'],
    attrs: { id, 'aria-modal': 'true', role: 'dialog', 'aria-labelledby': titleId, 'aria-hidden': 'true' },
  });
  const modal = el('div', { classes: ['modal'] });

  const header = el('div', { classes: ['modal__header'] });
  header.appendChild(el('h2', { classes: ['modal__title'], text: titleText, attrs: { id: titleId } }));
  const closeBtn = el('button', { classes: ['modal__close'], attrs: { 'aria-label': 'Fechar', 'data-close': id, type: 'button' } });
  closeBtn.appendChild(buildCloseIcon());
  header.appendChild(closeBtn);

  const body   = el('div', { classes: ['modal__body'], attrs: { id: `${id}-body` } });
  const footer = el('div', { classes: ['modal__footer'] });
  const cancelBtn = el('button', { classes: ['btn', 'btn-secondary'], text: 'Cancelar', attrs: { 'data-close': id, type: 'button' } });
  footer.appendChild(cancelBtn);
  if (saveId) {
    footer.appendChild(el('button', { classes: ['btn', 'btn-primary'], text: saveBtnText, attrs: { id: saveId, type: 'button' } }));
  }

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  backdrop.appendChild(modal);
  return backdrop;
}

function buildModalProduto() {
  return buildModalBase('modal-produto', 'modal-produto-title', 'Produto', 'btn-salvar-produto', 'Salvar');
}

function buildModalUsuario() {
  return buildModalBase('modal-usuario', 'modal-usuario-title', 'Usuário', 'btn-salvar-usuario', 'Salvar');
}

function buildModalConfirm() {
  const backdrop = el('div', {
    classes: ['modal-backdrop', 'hidden'],
    attrs: { id: 'modal-confirm', 'aria-modal': 'true', role: 'dialog', 'aria-labelledby': 'modal-confirm-title', 'aria-hidden': 'true' },
  });
  const modal = el('div', { classes: ['modal'], style: { maxWidth: '400px' } });

  const header = el('div', { classes: ['modal__header'] });
  header.appendChild(el('h2', { classes: ['modal__title'], text: 'Confirmar exclusão', attrs: { id: 'modal-confirm-title' } }));
  const closeBtn = el('button', { classes: ['modal__close'], attrs: { 'aria-label': 'Fechar', 'data-close': 'modal-confirm', type: 'button' } });
  closeBtn.appendChild(buildCloseIcon());
  header.appendChild(closeBtn);

  const body = el('div', { classes: ['modal__body'] });
  body.appendChild(el('p', { text: 'Tem certeza que deseja excluir este item?', attrs: { id: 'confirm-message' } }));

  const footer = el('div', { classes: ['modal__footer'] });
  footer.appendChild(el('button', { classes: ['btn', 'btn-secondary'], text: 'Cancelar', attrs: { 'data-close': 'modal-confirm', type: 'button' } }));
  footer.appendChild(el('button', { classes: ['btn', 'btn-danger'], text: 'Excluir', attrs: { id: 'btn-confirm-delete', type: 'button' } }));

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  backdrop.appendChild(modal);
  return backdrop;
}

function buildCloseIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2');
  svg.setAttribute('width', '18'); svg.setAttribute('height', '18');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', 'M18 6L6 18M6 6l12 12');
  svg.appendChild(p);
  return svg;
}

/* =============================================
   Tabs
   ============================================= */

function bindTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const name = tab.dataset.tab;
      document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
      document.querySelectorAll('.admin-panel').forEach(panel => {
        panel.classList.toggle('hidden', panel.id !== `panel-${name}`);
      });
      if (name === 'produtos')   loadProdutos();
      if (name === 'usuarios')   loadUsuarios();
      if (name === 'candidatos') loadCandidatos();
    });
  });
}

/* =============================================
   Modal helpers
   ============================================= */

function bindModalCloseButtons() {
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => modalManager.close(btn.dataset.close));
  });
}

/* =============================================
   PRODUTOS
   ============================================= */

function loadProdutos() {
  const wrap = document.getElementById('produtos-table-wrap');
  clearChildren(wrap);
  const list = produtosLocal.listar();
  if (list.length === 0) { showEmptyState(wrap, 'Nenhum produto cadastrado', 'Clique em "+ Novo produto" para começar.'); return; }
  wrap.appendChild(buildProdutosTable(list));
}

function buildProdutosTable(produtos) {
  const container = el('div', { classes: ['admin-table-container'] });
  const table = el('table', { classes: ['admin-table'], attrs: { 'aria-label': 'Lista de produtos' } });
  const thead = el('thead');
  const headerRow = el('tr');
  ['ID', 'Nome', 'Preço', 'Categoria', 'Ações'].forEach((text, i) => {
    const th = el('th', { text, attrs: { scope: 'col' } });
    if (i === 4) th.style.textAlign = 'right';
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  const tbody = el('tbody');
  produtos.forEach(p => tbody.appendChild(buildProdutoRow(p)));
  table.appendChild(tbody);
  container.appendChild(table);
  return container;
}

function buildProdutoRow(produto) {
  const tr = el('tr', { attrs: { 'data-id': produto.id } });
  tr.appendChild(el('td', { classes: ['table-id'],    text: String(produto.id) }));
  tr.appendChild(el('td', { classes: ['table-name'],  text: produto.nome }));
  tr.appendChild(el('td', { classes: ['table-price'], text: formatPrice(produto.preco ?? 0) }));
  tr.appendChild(el('td', { text: produto.categoria?.nome ?? produto.categoria ?? '—' }));

  const actions = el('td');
  const wrap = el('div', { classes: ['table-actions'] });
  const editBtn = el('button', { classes: ['btn', 'btn-secondary', 'btn-sm'], text: 'Editar', attrs: { type: 'button', 'aria-label': `Editar ${produto.nome}` } });
  editBtn.addEventListener('click', () => openProdutoModal(produto));
  const deleteBtn = el('button', { classes: ['btn', 'btn-danger', 'btn-sm'], text: 'Excluir', attrs: { type: 'button', 'aria-label': `Excluir ${produto.nome}` } });
  deleteBtn.addEventListener('click', () => confirmDelete(`Excluir "${produto.nome}"?`, async () => {
    const { error } = await produtosAdminApi.excluir(produto.id);
    if (error) { showToast(error, 'error'); return; }
    produtosLocal.excluir(produto.id);
    showToast('Produto excluído.');
    loadProdutos();
  }));
  wrap.appendChild(editBtn); wrap.appendChild(deleteBtn);
  actions.appendChild(wrap);
  tr.appendChild(actions);
  return tr;
}

function openProdutoModal(produto) {
  const body    = document.getElementById('modal-produto-body');
  const title   = document.getElementById('modal-produto-title');
  let   saveBtn = document.getElementById('btn-salvar-produto');

  title.textContent = produto ? 'Editar produto' : 'Novo produto';
  clearChildren(body);
  const form = buildProdutoForm(produto);
  body.appendChild(form);

  const newSaveBtn = saveBtn.cloneNode(true);
  saveBtn.replaceWith(newSaveBtn);

  newSaveBtn.addEventListener('click', async () => {
    clearFormErrors(form);
    const data = serializeForm(form);
    if (!data.nome)  { showFieldError('p-nome',  'Nome obrigatório.'); return; }
    if (!data.preco) { showFieldError('p-preco', 'Preço obrigatório.'); return; }
    const payload = { nome: data.nome, descricao: data.descricao || undefined, preco: parseFloat(data.preco), categoria: data.categoria || undefined, imagem: data.imagem || undefined };
    newSaveBtn.disabled = true;
    const { error } = produto ? await produtosAdminApi.atualizar(produto.id, payload) : await produtosAdminApi.criar(payload);
    newSaveBtn.disabled = false;
    if (produto) { produtosLocal.atualizar(produto.id, payload); }
    else         { produtosLocal.adicionar(payload); }
    if (error) { showToast('Salvo localmente.'); }
    else       { showToast(produto ? 'Produto atualizado.' : 'Produto criado.'); }
    modalManager.close('modal-produto');
    loadProdutos();
  });

  modalManager.open('modal-produto');
}

function buildProdutoForm(produto) {
  const form = el('div', { classes: ['modal-form'] });
  form.appendChild(buildField('p-nome',      'Nome',         'text',   produto?.nome ?? '',       'nome',      'Nome do produto'));
  form.appendChild(buildField('p-descricao', 'Descrição',    'text',   produto?.descricao ?? '',  'descricao', 'Descrição curta'));
  const row = el('div', { classes: ['modal-form-row'] });
  row.appendChild(buildField('p-preco',    'Preço (R$)', 'number', produto?.preco ?? '',    'preco',    '0.00', { min: '0', step: '0.01' }));
  row.appendChild(buildField('p-categoria','Categoria',  'text',   produto?.categoria ?? '', 'categoria','Ex: Calcinhas'));
  form.appendChild(row);
  form.appendChild(buildImageUploadField(produto?.imagem ?? produto?.imagemUrl ?? ''));
  return form;
}

function buildImageUploadField(currentUrl) {
  const group = el('div', { classes: ['form-group'] });
  group.appendChild(el('label', { classes: ['form-label'], text: 'Imagem do produto' }));

  // Preview
  const preview = el('div', { attrs: { id: 'img-preview' }, style: { display: currentUrl ? 'block' : 'none', marginBottom: '8px' } });
  const previewImg = el('img', { attrs: { id: 'img-preview-src', src: currentUrl, alt: 'Preview' }, style: { width: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #F0C4D4' } });
  preview.appendChild(previewImg);
  group.appendChild(preview);

  // Botão de upload
  const uploadRow = el('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } });
  const fileInput = el('input', { attrs: { type: 'file', id: 'img-file-input', accept: 'image/*' }, style: { display: 'none' } });
  const uploadBtn = el('button', { classes: ['btn', 'btn-secondary', 'btn-sm'], text: 'Escolher imagem', attrs: { type: 'button' } });
  const uploadStatus = el('span', { attrs: { id: 'upload-status' }, style: { fontSize: '0.8125rem', color: '#9E6B7E' } });

  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    uploadBtn.disabled = true;
    uploadStatus.textContent = 'Enviando…';
    const url = await uploadToCloudinary(file);
    uploadBtn.disabled = false;
    if (url) {
      document.getElementById('p-imagem').value = url;
      previewImg.src = url;
      preview.style.display = 'block';
      uploadStatus.textContent = '✓ Imagem enviada';
    } else {
      uploadStatus.textContent = 'Erro no upload. Tente novamente.';
    }
  });

  uploadRow.appendChild(fileInput);
  uploadRow.appendChild(uploadBtn);
  uploadRow.appendChild(uploadStatus);
  group.appendChild(uploadRow);

  // Campo URL (preenchido automaticamente ou manual)
  const urlField = el('input', {
    classes: ['form-input'],
    attrs: { id: 'p-imagem', name: 'imagem', type: 'url', placeholder: 'URL preenchida após upload', value: currentUrl },
    style: { marginTop: '8px' },
  });
  group.appendChild(urlField);

  return group;
}


/* =============================================
   USUÁRIOS
   ============================================= */

async function loadUsuarios() {
  const wrap = document.getElementById('usuarios-table-wrap');
  clearChildren(wrap);
  const { data, error } = await usuariosAdminApi.listar();
  const fromApi = !error ? (Array.isArray(data) ? data : (data?.usuarios ?? data?.data ?? [])) : [];
  const list = fromApi.length > 0 ? fromApi : usuariosLocal.listar();
  if (list.length === 0) { showEmptyState(wrap, 'Nenhum usuário encontrado', ''); return; }
  wrap.appendChild(buildUsuariosTable(list));
}

function buildUsuariosTable(usuarios) {
  const container = el('div', { classes: ['admin-table-container'] });
  const table = el('table', { classes: ['admin-table'], attrs: { 'aria-label': 'Lista de usuários' } });
  const thead = el('thead');
  const headerRow = el('tr');
  ['ID', 'Nome', 'E-mail', 'Ações'].forEach((text, i) => {
    const th = el('th', { text, attrs: { scope: 'col' } });
    if (i === 3) th.style.textAlign = 'right';
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  const tbody = el('tbody');
  usuarios.forEach(u => tbody.appendChild(buildUsuarioRow(u)));
  table.appendChild(tbody);
  container.appendChild(table);
  return container;
}

function buildUsuarioRow(usuario) {
  const tr = el('tr', { attrs: { 'data-id': usuario.id } });
  tr.appendChild(el('td', { classes: ['table-id'],   text: String(usuario.id) }));
  tr.appendChild(el('td', { classes: ['table-name'], text: usuario.nome ?? usuario.name ?? '—' }));
  tr.appendChild(el('td', { text: usuario.email ?? '—' }));

  const actions = el('td');
  const wrap = el('div', { classes: ['table-actions'] });
  const editBtn = el('button', { classes: ['btn', 'btn-secondary', 'btn-sm'], text: 'Editar', attrs: { type: 'button' } });
  editBtn.addEventListener('click', () => openUsuarioModal(usuario));
  const deleteBtn = el('button', { classes: ['btn', 'btn-danger', 'btn-sm'], text: 'Excluir', attrs: { type: 'button' } });
  deleteBtn.addEventListener('click', () => confirmDelete(`Excluir usuário "${usuario.nome ?? usuario.email}"?`, async () => {
    const { error } = await usuariosAdminApi.excluir(usuario.id);
    if (error) { showToast(error, 'error'); return; }
    showToast('Usuário excluído.');
    loadUsuarios();
  }));
  wrap.appendChild(editBtn); wrap.appendChild(deleteBtn);
  actions.appendChild(wrap);
  tr.appendChild(actions);
  return tr;
}

function openUsuarioModal(usuario) {
  const body    = document.getElementById('modal-usuario-body');
  const title   = document.getElementById('modal-usuario-title');
  let   saveBtn = document.getElementById('btn-salvar-usuario');

  title.textContent = usuario ? 'Editar usuário' : 'Novo usuário';
  clearChildren(body);
  const form = buildUsuarioForm(usuario);
  body.appendChild(form);

  const newSaveBtn = saveBtn.cloneNode(true);
  saveBtn.replaceWith(newSaveBtn);

  newSaveBtn.addEventListener('click', async () => {
    clearFormErrors(form);
    const data = serializeForm(form);
    if (!data.nome)  { showFieldError('u-nome',  'Nome obrigatório.'); return; }
    if (!data.email) { showFieldError('u-email', 'E-mail obrigatório.'); return; }
    const payload = { nome: data.nome, email: data.email };
    if (data.senha) payload.senha = data.senha;
    newSaveBtn.disabled = true;
    const { error } = usuario ? await usuariosAdminApi.atualizar(usuario.id, payload) : await usuariosAdminApi.criar(payload);
    newSaveBtn.disabled = false;
    if (error) { showToast(error, 'error'); return; }
    showToast(usuario ? 'Usuário atualizado.' : 'Usuário criado.');
    modalManager.close('modal-usuario');
    loadUsuarios();
  });

  modalManager.open('modal-usuario');
}

function buildUsuarioForm(usuario) {
  const form = el('div', { classes: ['modal-form'] });
  form.appendChild(buildField('u-nome',  'Nome completo', 'text',     usuario?.nome ?? usuario?.name ?? '', 'nome',  'Nome'));
  form.appendChild(buildField('u-email', 'E-mail',        'email',    usuario?.email ?? '',                  'email', 'email@exemplo.com'));
  form.appendChild(buildField('u-senha', usuario ? 'Nova senha (deixe em branco para manter)' : 'Senha', 'password', '', 'senha', '••••••••'));
  return form;
}

/* =============================================
   Helpers compartilhados
   ============================================= */

function buildField(id, label, type, value, name, placeholder, extraAttrs = {}) {
  const group = el('div', { classes: ['form-group'] });
  group.appendChild(el('label', { classes: ['form-label'], text: label, attrs: { for: id } }));
  group.appendChild(el('input', { classes: ['form-input'], attrs: { id, name, type, placeholder, value, ...extraAttrs } }));
  group.appendChild(el('span', { classes: ['field-error'], attrs: { id: `${id}-error`, 'aria-live': 'polite' } }));
  return group;
}

/* =============================================
   CANDIDATOS A VENDEDOR
   ============================================= */

function loadCandidatos() {
  const wrap = document.getElementById('candidatos-table-wrap');
  clearChildren(wrap);
  try {
    const lista = JSON.parse(localStorage.getItem('encanto_candidatos') || '[]');
    if (!lista.length) { showEmptyState(wrap, 'Nenhum candidato ainda', 'As inscrições aparecerão aqui.'); return; }
    wrap.appendChild(buildCandidatosTable(lista));
  } catch {
    showEmptyState(wrap, 'Erro ao carregar', 'Não foi possível ler os candidatos.');
  }
}

function buildCandidatosTable(lista) {
  const container = el('div', { classes: ['admin-table-container'] });
  const table = el('table', { classes: ['admin-table'], attrs: { 'aria-label': 'Candidatos a vendedor' } });
  const thead = el('thead');
  const headerRow = el('tr');
  ['Nome', 'E-mail', 'WhatsApp', 'Cidade', 'O que vende'].forEach(text => {
    headerRow.appendChild(el('th', { text, attrs: { scope: 'col' } }));
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  const tbody = el('tbody');
  lista.forEach(c => {
    const tr = el('tr');
    tr.appendChild(el('td', { classes: ['table-name'], text: c.nome || '—' }));
    tr.appendChild(el('td', { text: c.email   || '—' }));
    tr.appendChild(el('td', { text: c.celular || '—' }));
    tr.appendChild(el('td', { text: c.cidade  || '—' }));
    tr.appendChild(el('td', { text: c.endereco || '—' }));
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
  return container;
}

function confirmDelete(message, onConfirm) {
  const msgEl = document.getElementById('confirm-message');
  if (msgEl) msgEl.textContent = message;
  const btn = document.getElementById('btn-confirm-delete');
  const newBtn = btn.cloneNode(true);
  btn.replaceWith(newBtn);
  newBtn.addEventListener('click', async () => { modalManager.close('modal-confirm'); await onConfirm(); });
  modalManager.open('modal-confirm');
}
