/**
 * api.js — Camada de serviço para a API base-back
 * Base URL: https://base-back-dwpz.onrender.com
 *
 * Todos os métodos retornam { data, error }
 * Nunca lançam exceção — o chamador verifica `error`.
 */

const API_BASE = 'https://base-back-dwpz.onrender.com';

const PRODUTOS_FIXOS = [
  {
    id: 1,
    nome: 'Calcinha Renda',
    descricao: 'Calcinha em renda delicada com acabamento de microfibra. Confortável para o dia a dia com toque suave na pele.',
    preco: 39.90,
    categoria: 'Calcinhas',
    imagem: 'img/calcinha.svg',
  },
  {
    id: 2,
    nome: 'Sutiã Push Up',
    descricao: 'Sutiã push up com bojo removível e alças reguláveis. Modelagem que valoriza o decote com muito conforto.',
    preco: 89.90,
    categoria: 'Sutiãs',
    imagem: 'img/sutia.svg',
  },
  {
    id: 3,
    nome: 'Body Strappy',
    descricao: 'Body estilo strappy com tiras cruzadas nas costas. Peça versátil que combina sensualidade e elegância.',
    preco: 119.90,
    categoria: 'Bodies',
    imagem: 'img/body.svg',
  },
  {
    id: 4,
    nome: 'Camisola Seda',
    descricao: 'Camisola em cetim acetinado com renda no decote. Leveza e sofisticação para noites especiais.',
    preco: 149.90,
    categoria: 'Camisolas',
    imagem: 'img/camisola.svg',
  },
  {
    id: 5,
    nome: 'Conjunto Rendado',
    descricao: 'Conjunto de calcinha e sutiã em renda floral. Coordenado elegante com detalhes em laço acetinado.',
    preco: 129.90,
    categoria: 'Conjuntos',
    imagem: 'img/conjunto.svg',
  },
  {
    id: 6,
    nome: 'Meia-Calça Fio 15',
    descricao: 'Meia-calça ultra fina fio 15 com efeito natural na pele. Resistente, confortável e discreta para qualquer ocasião.',
    preco: 29.90,
    categoria: 'Meias',
    imagem: 'img/meia-calca.svg',
  },
];

const produtosLocal = {
  KEY: 'encanto_produtos',

  listar() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  adicionar(produto) {
    const list = this.listar();
    const novoId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1;
    const novo = { ...produto, id: novoId };
    this._salvar([...list, novo]);
    return novo;
  },

  atualizar(id, dados) {
    const list = this.listar().map(p => p.id === id ? { ...p, ...dados } : p);
    this._salvar(list);
  },

  excluir(id) {
    this._salvar(this.listar().filter(p => p.id !== id));
  },

  _salvar(list) {
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },
};

/**
 * Faz uma requisição genérica à API.
 * @param {string} path  - Caminho relativo, ex: '/produtos'
 * @param {RequestInit} options - Opções do fetch
 * @returns {Promise<{data: any, error: string|null}>}
 */
async function request(path, options = {}) {
  const token = auth.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    // Sem corpo (204 No Content)
    if (response.status === 204) {
      return { data: null, error: null };
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        payload?.message ??
        payload?.error ??
        `Erro ${response.status}: ${response.statusText}`;
      return { data: null, error: message };
    }

    return { data: payload, error: null };
  } catch (err) {
    const message =
      err instanceof TypeError
        ? 'Sem conexão com o servidor. Verifique sua internet.'
        : err.message ?? 'Erro desconhecido.';
    return { data: null, error: message };
  }
}

/* =============================================
   Autenticação
   ============================================= */

const auth = {
  TOKEN_KEY: 'limpa_ja_token',
  USER_KEY:  'limpa_ja_user',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    try { return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  },

  isLoggedIn() {
    return Boolean(this.getToken());
  },

  save(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },
};

/* =============================================
   Endpoints de Autenticação
   ============================================= */

const usuariosLocal = {
  KEY: 'encanto_usuarios',

  listar() {
    try {
      const raw = localStorage.getItem(this.KEY);
      const base = [{ id: 0, nome: 'Administrador', email: 'admin@gmail.com', papel: 'administrador' }];
      return raw ? [...base, ...JSON.parse(raw)] : base;
    } catch { return []; }
  },

  adicionar(usuario) {
    const list = this.listar().filter(u => u.id !== 0);
    const novoId = list.length > 0 ? Math.max(...list.map(u => u.id)) + 1 : 1;
    const novo = { id: novoId, ...usuario };
    localStorage.setItem(this.KEY, JSON.stringify([...list, novo]));
    return novo;
  },

  excluir(id) {
    const list = this.listar().filter(u => u.id !== 0 && u.id !== id);
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },
};

const authApi = {
  /**
   * POST /cadastrar
   * @param {{ nome: string, email: string, senha: string }} body
   */
  async cadastrar(body) {
    const result = await request('/cadastrar', {
      method: 'POST',
      body: JSON.stringify({ papel: 'editor', ...body }),
    });
    usuariosLocal.adicionar({ nome: body.nome, email: body.email, papel: 'editor', _k: btoa(body.senha) });
    return result;
  },

  /**
   * POST /entrar
   * @param {{ email: string, senha: string }} body
   * @returns token e dados do usuário em data.token / data.usuario
   */
  async entrar(body) {
    if (body.email === 'admin@gmail.com' && body.senha === '123') {
      const usuario = { id: 0, nome: 'Administrador', email: 'admin@gmail.com', papel: 'administrador' };
      auth.save('admin-local-token', usuario);
      return { data: { token: 'admin-local-token', usuario }, error: null };
    }

    const result = await request('/entrar', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!result.error && result.data) {
      const token   = result.data.token ?? result.data.access_token ?? result.data.accessToken;
      const usuario = result.data.usuario ?? result.data.user ?? result.data;
      if (token) { auth.save(token, usuario); return result; }
    }

    // Fallback local: verifica usuário cadastrado neste dispositivo
    const local = usuariosLocal.listar().find(
      u => u.email === body.email && u._k && u._k === btoa(body.senha)
    );
    if (local) {
      const { _k, ...userData } = local;
      auth.save(`local-token-${local.id}`, userData);
      return { data: { token: `local-token-${local.id}`, usuario: userData }, error: null };
    }

    return result.error
      ? result
      : { data: null, error: 'E-mail ou senha incorretos.' };
  },

  /** GET /perfil */
  async perfil() {
    return request('/perfil');
  },

  sair() {
    auth.clear();
  },
};

/* =============================================
   Endpoints de Catálogo (público)
   ============================================= */

const catalogoApi = {
  /**
   * GET /produtos
   * @param {{ categoria?: string, busca?: string }} filtros
   */
  async listarProdutos(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.categoria) params.set('categoria', filtros.categoria);
    if (filtros.busca)     params.set('busca', filtros.busca);
    const qs = params.toString();
    return request(`/produtos${qs ? `?${qs}` : ''}`);
  },

  /**
   * GET /produtos/{id}
   * @param {string|number} id
   */
  async detalharProduto(id) {
    return request(`/produtos/${id}`);
  },

  /** GET /categorias */
  async listarCategorias() {
    return request('/categorias');
  },
};

/* =============================================
   Endpoints Admin — Produtos
   ============================================= */

const produtosAdminApi = {
  /**
   * POST /produtos
   * @param {object} body
   */
  async criar(body) {
    return request('/produtos', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /**
   * PATCH /produtos/{id}
   * @param {string|number} id
   * @param {object} body - campos parciais
   */
  async atualizar(id, body) {
    return request(`/produtos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  /**
   * PUT /produtos/{id}
   * @param {string|number} id
   * @param {object} body - substitui completo
   */
  async substituir(id, body) {
    return request(`/produtos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  /**
   * DELETE /produtos/{id}
   * @param {string|number} id
   */
  async excluir(id) {
    return request(`/produtos/${id}`, { method: 'DELETE' });
  },
};

/* =============================================
   Endpoints Admin — Usuários
   ============================================= */

const usuariosAdminApi = {
  async listar() {
    return request('/usuarios');
  },

  async criar(body) {
    return request('/usuarios', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async detalhar(id) {
    return request(`/usuarios/${id}`);
  },

  async atualizar(id, body) {
    return request(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  async substituir(id, body) {
    return request(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async excluir(id) {
    return request(`/usuarios/${id}`, { method: 'DELETE' });
  },
};
