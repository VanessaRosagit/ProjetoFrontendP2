/* login.js — Página de login
 * buildPage() constrói 100% do DOM. Sem innerHTML.
 */

if (auth.isLoggedIn()) {
  window.location.href = getParam('redirect') ?? 'index.html';
} else {
  buildPage();
}

/* =============================================
   Construção da página
   ============================================= */

function buildPage() {
  document.title = 'Entrar — Encanto Íntimo';
  document.body.classList.add('auth-body');

  const layout = el('div', { classes: ['auth-layout'] });
  layout.appendChild(buildAuthPanel('"A lingerie certa não é só moda — é a sua segunda pele."'));
  layout.appendChild(buildAuthMain());
  document.body.appendChild(layout);

  bindPasswordToggle();
  bindForm();
}

function buildAuthPanel(quote) {
  const aside = el('aside', { classes: ['auth-panel'], attrs: { 'aria-hidden': 'true' } });
  const inner = el('div', { classes: ['auth-panel__inner'] });

  const logoLink = el('a', { classes: ['logo'], attrs: { href: 'index.html' } });
  logoLink.appendChild(buildLogoSvg());
  logoLink.appendChild(document.createTextNode('Encanto'));
  logoLink.appendChild(el('span', { text: 'Íntimo' }));

  const blockquote = el('blockquote', { classes: ['auth-panel__quote'], text: quote });

  inner.appendChild(logoLink);
  inner.appendChild(blockquote);
  aside.appendChild(inner);
  return aside;
}

function buildAuthMain() {
  const main = el('main', { classes: ['auth-main'], attrs: { id: 'main-content' } });
  const card = el('div', { classes: ['auth-card'] });

  // Cabeçalho
  const header = el('div', { classes: ['auth-card__header'] });
  header.appendChild(el('h1', { classes: ['auth-card__title'], text: 'Bem-vinda de volta' }));
  header.appendChild(el('p', { classes: ['auth-card__subtitle'], text: 'Entre com sua conta para continuar' }));

  // Alerta de erro
  const alertEl = el('div', { classes: ['alert', 'alert-error', 'hidden'], attrs: { id: 'form-alert', role: 'alert', 'aria-live': 'assertive' } });

  // Formulário
  const form = el('form', { classes: ['auth-form'], attrs: { id: 'login-form', novalidate: '' } });

  // Campo e-mail
  form.appendChild(buildFormGroup({
    id: 'email', name: 'email', type: 'email',
    label: 'E-mail', placeholder: 'seu@email.com', autocomplete: 'email',
  }));

  // Campo senha com link "esqueci"
  const senhaGroup = el('div', { classes: ['form-group'] });
  const senhaLabel = el('label', { classes: ['form-label'], text: 'Senha', attrs: { for: 'senha' } });
  const forgotLink = el('a', { classes: ['forgot-link'], text: 'Esqueci minha senha', attrs: { href: '#', tabindex: '0' } });
  senhaLabel.appendChild(forgotLink);

  const passWrap = el('div', { classes: ['input-password-wrap'] });
  passWrap.appendChild(el('input', {
    classes: ['form-input'],
    attrs: { id: 'senha', name: 'senha', type: 'password', placeholder: '••••••••', autocomplete: 'current-password', required: '' },
  }));
  passWrap.appendChild(buildPasswordToggleBtn('senha'));

  senhaGroup.appendChild(senhaLabel);
  senhaGroup.appendChild(passWrap);
  senhaGroup.appendChild(el('span', { classes: ['field-error'], attrs: { id: 'senha-error', 'aria-live': 'polite' } }));
  form.appendChild(senhaGroup);

  // Botão submit
  form.appendChild(el('button', {
    classes: ['btn', 'btn-primary', 'btn-lg', 'auth-submit'],
    text: 'Entrar',
    attrs: { type: 'submit', id: 'submit-btn' },
  }));

  // Rodapé
  const cardFooter = el('p', { classes: ['auth-card__footer'] });
  cardFooter.appendChild(document.createTextNode('Não tem conta? '));
  cardFooter.appendChild(el('a', { text: 'Criar conta grátis', attrs: { href: 'index.html?page=cadastro' } }));

  card.appendChild(header);
  card.appendChild(alertEl);
  card.appendChild(form);
  card.appendChild(cardFooter);
  main.appendChild(card);
  return main;
}

function buildFormGroup({ id, name, type, label, placeholder, autocomplete, required }) {
  const group = el('div', { classes: ['form-group'] });
  group.appendChild(el('label', { classes: ['form-label'], text: label, attrs: { for: id } }));
  group.appendChild(el('input', {
    classes: ['form-input'],
    attrs: { id, name, type, placeholder, autocomplete, ...(required ? { required: '' } : {}) },
  }));
  group.appendChild(el('span', { classes: ['field-error'], attrs: { id: `${name}-error`, 'aria-live': 'polite' } }));
  return group;
}

function buildPasswordToggleBtn(targetId) {
  const btn = el('button', {
    classes: ['toggle-password'],
    attrs: { type: 'button', 'aria-label': 'Mostrar senha', 'data-target': targetId },
  });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2');
  svg.setAttribute('width', '18'); svg.setAttribute('height', '18');
  svg.setAttribute('aria-hidden', 'true');
  const ep = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  ep.setAttribute('d', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z');
  const ec = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  ec.setAttribute('cx', '12'); ec.setAttribute('cy', '12'); ec.setAttribute('r', '3');
  svg.appendChild(ep); svg.appendChild(ec);
  btn.appendChild(svg);
  return btn;
}

/* =============================================
   Lógica do formulário
   ============================================= */

function bindPasswordToggle() {
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const hidden = input.type === 'password';
      input.type = hidden ? 'text' : 'password';
      btn.setAttribute('aria-label', hidden ? 'Ocultar senha' : 'Mostrar senha');
    });
  });
}

function bindForm() {
  const form      = document.getElementById('login-form');
  const submitBtn = document.getElementById('submit-btn');
  const alertEl   = document.getElementById('form-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors(form);
    alertEl.classList.add('hidden');
    clearChildren(alertEl);

    const data = serializeForm(form);
    let valid = true;
    if (!data.email) { showFieldError('email', 'Informe seu e-mail.'); valid = false; }
    if (!data.senha) { showFieldError('senha', 'Informe sua senha.'); valid = false; }
    if (!valid) return;

    submitBtn.disabled = true;
    clearChildren(submitBtn);
    submitBtn.appendChild(createSpinner());
    submitBtn.appendChild(el('span', { text: 'Entrando…' }));

    const { error } = await authApi.entrar({ email: data.email, senha: data.senha });

    submitBtn.disabled = false;
    clearChildren(submitBtn);
    submitBtn.textContent = 'Entrar';

    if (error) {
      alertEl.classList.remove('hidden');
      alertEl.appendChild(el('p', { text: error }));
      return;
    }

    showToast('Login realizado com sucesso!');
    const redirect = getParam('redirect') ?? 'index.html';
    setTimeout(() => { window.location.href = redirect; }, 600);
  });
}
