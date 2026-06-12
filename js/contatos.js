/* contatos.js — Página pública "Seja um Vendedor"
 * construirPagina() monta 100% do DOM. Sem innerHTML.
 */

const URL_API       = 'https://bakcend-fecaf-render.onrender.com/contatos';
const CHAVE_LOCAIS  = 'encanto_candidatos';

construirPagina();
syncHeader();
iniciarFormulario();

/* =============================================
   Construção da página
   ============================================= */

function construirPagina() {
  document.title = 'Seja um Vendedor — Encanto Íntimo';
  document.body.appendChild(buildHeader({ activePage: 'contatos' }));

  const corpoPagina  = el('div', { classes: ['page-body'] });
  const principal    = el('main', { classes: ['page-main'] });
  const recipiente   = el('div', { classes: ['container'] });

  // Cabeçalho da seção
  const cabecalho = el('div', { classes: ['section-header'] });
  cabecalho.appendChild(el('h1', { classes: ['section-title'], text: 'Seja um Vendedor' }));
  cabecalho.appendChild(el('div', { classes: ['section-divider'] }));
  cabecalho.appendChild(el('p', {
    classes: ['section-subtitle'],
    text: 'Quer expor seus produtos na Encanto Íntimo? Preencha o formulário e entraremos em contato.',
  }));
  recipiente.appendChild(cabecalho);

  // Card de benefícios
  recipiente.appendChild(construirBeneficios());

  // Formulário
  recipiente.appendChild(construirFormulario());

  // Mensagem de sucesso (oculta inicialmente)
  recipiente.appendChild(el('div', {
    classes: ['vendedor-sucesso', 'hidden'],
    attrs: { id: 'vendedor-sucesso' },
  }));

  principal.appendChild(recipiente);
  corpoPagina.appendChild(principal);
  corpoPagina.appendChild(buildFooter());
  document.body.appendChild(corpoPagina);
}

function construirBeneficios() {
  const cartao = el('div', { classes: ['vendedor-beneficios'] });

  const itens = [
    { icone: '✦', titulo: 'Vitrine online',    descricao: 'Seus produtos visíveis para todos os clientes da loja.' },
    { icone: '✦', titulo: 'Sem mensalidade',   descricao: 'Cadastro gratuito para vendedores parceiros.' },
    { icone: '✦', titulo: 'Suporte dedicado',  descricao: 'Nossa equipe te acompanha do cadastro à primeira venda.' },
  ];

  itens.forEach(({ icone, titulo, descricao }) => {
    const item = el('div', { classes: ['vendedor-beneficio-item'] });
    item.appendChild(el('span', { classes: ['vendedor-beneficio-icon'], text: icone }));
    item.appendChild(el('strong', { text: titulo }));
    item.appendChild(el('p', { text: descricao }));
    cartao.appendChild(item);
  });

  return cartao;
}

function construirFormulario() {
  const cartao = el('section', { classes: ['contato-form-card'] });
  cartao.appendChild(el('h2', {
    classes: ['contato-form-card__title'],
    text: 'Quero ser vendedor',
  }));

  const formulario = el('form', { attrs: { id: 'vendedor-form', novalidate: '' } });

  const linha1 = el('div', { classes: ['contato-form__row'] });
  linha1.appendChild(construirCampo('nome',    'text',  'Nome completo', true));
  linha1.appendChild(construirCampo('email',   'email', 'E-mail',        true));
  formulario.appendChild(linha1);

  const linha2 = el('div', { classes: ['contato-form__row'] });
  linha2.appendChild(construirCampo('celular', 'tel',  'WhatsApp (00) 00000-0000', true));
  linha2.appendChild(construirCampo('cidade',  'text', 'Cidade / Estado',          true));
  formulario.appendChild(linha2);

  const linha3 = el('div', { classes: ['contato-form__row'] });
  linha3.appendChild(construirCampo('endereco', 'text', 'O que você vende? Ex: Lingerie, Moda Praia…', true));

  const grupofoto = el('div', { classes: ['form-group'] });
  grupofoto.appendChild(el('label', { classes: ['form-label'], text: 'Foto do produto (opcional)', attrs: { for: 'vendedor-foto' } }));
  grupofoto.appendChild(el('input', {
    classes: ['form-input'],
    attrs: { id: 'vendedor-foto', type: 'file', accept: 'image/*' },
  }));
  grupofoto.appendChild(el('img', {
    classes: ['contato-foto-preview', 'hidden'],
    attrs: { id: 'foto-preview', alt: 'Preview' },
  }));
  linha3.appendChild(grupofoto);
  formulario.appendChild(linha3);

  const acoes = el('div', { classes: ['contato-form__actions'] });
  acoes.appendChild(el('button', {
    classes: ['btn', 'btn-primary', 'btn-lg'],
    text: 'Enviar candidatura',
    attrs: { type: 'submit', id: 'btn-enviar' },
  }));
  formulario.appendChild(acoes);

  cartao.appendChild(formulario);
  return cartao;
}

function construirCampo(nomeCampo, tipo, rotulo, obrigatorio = false) {
  const grupo = el('div', { classes: ['form-group'] });
  grupo.appendChild(el('label', {
    classes: ['form-label'],
    text: rotulo,
    attrs: { for: `vendedor-${nomeCampo}` },
  }));
  const atributos = { id: `vendedor-${nomeCampo}`, name: nomeCampo, type: tipo, placeholder: rotulo };
  if (obrigatorio) atributos.required = '';
  grupo.appendChild(el('input', { classes: ['form-input'], attrs: atributos }));
  return grupo;
}

/* =============================================
   Inicialização e submit
   ============================================= */

function iniciarFormulario() {
  document.getElementById('vendedor-form').addEventListener('submit', enviarCandidatura);

  document.getElementById('vendedor-foto').addEventListener('change', (evento) => {
    const previa   = document.getElementById('foto-preview');
    const arquivo  = evento.target.files[0];
    if (arquivo) { previa.src = URL.createObjectURL(arquivo); previa.classList.remove('hidden'); }
    else         { previa.classList.add('hidden'); }
  });
}

function candidatosLocal() {
  try { return JSON.parse(localStorage.getItem(CHAVE_LOCAIS) || '[]'); }
  catch { return []; }
}

function salvarCandidatoLocal(dados) {
  const lista = candidatosLocal();
  const novo  = { id: Date.now(), ...dados };
  localStorage.setItem(CHAVE_LOCAIS, JSON.stringify([...lista, novo]));
}

async function enviarCandidatura(evento) {
  evento.preventDefault();
  const botao = document.getElementById('btn-enviar');
  botao.disabled = true;
  botao.textContent = 'Enviando…';

  try {
    const arquivoFoto = document.getElementById('vendedor-foto').files[0];
    let urlFoto = '';
    if (arquivoFoto) urlFoto = (await uploadToCloudinary(arquivoFoto)) || '';

    const dados = {
      nome:     document.getElementById('vendedor-nome').value.trim(),
      email:    document.getElementById('vendedor-email').value.trim(),
      celular:  document.getElementById('vendedor-celular').value.trim(),
      cidade:   document.getElementById('vendedor-cidade').value.trim(),
      endereco: document.getElementById('vendedor-endereco').value.trim(),
      foto:     urlFoto,
    };

    // Sempre salva localmente (garante que aparece no admin)
    salvarCandidatoLocal(dados);

    // Tenta salvar na API também (opcional, não bloqueia)
    fetch(URL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    }).catch(() => {});

    document.getElementById('vendedor-form').closest('.contato-form-card').classList.add('hidden');
    document.querySelector('.vendedor-beneficios').classList.add('hidden');

    const msgSucesso = document.getElementById('vendedor-sucesso');
    msgSucesso.classList.remove('hidden');
    msgSucesso.appendChild(el('p', { classes: ['vendedor-sucesso__icon'], text: '✓' }));
    msgSucesso.appendChild(el('h2', { classes: ['vendedor-sucesso__titulo'], text: 'Candidatura enviada!' }));
    msgSucesso.appendChild(el('p', {
      classes: ['vendedor-sucesso__msg'],
      text: `Obrigada, ${dados.nome.split(' ')[0]}! Recebemos sua candidatura e entraremos em contato pelo e-mail ${dados.email} em breve.`,
    }));
    msgSucesso.appendChild(el('a', {
      classes: ['btn', 'btn-primary'],
      text: 'Voltar ao catálogo',
      attrs: { href: 'index.html' },
    }));

  } catch {
    showToast('Erro ao enviar. Tente novamente.', 'error');
    botao.disabled = false;
    botao.textContent = 'Enviar candidatura';
  }
}
