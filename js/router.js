/* router.js — carrega o JS da página com base em ?page= */

(function () {
  // Limpa produtos padrão antigos do localStorage
  if (!localStorage.getItem('encanto_reset_v2')) {
    localStorage.removeItem('encanto_produtos');
    localStorage.setItem('encanto_reset_v2', '1');
  }

  const page = new URLSearchParams(window.location.search).get('page') || 'catalog';
  const allowed = ['catalog', 'login', 'cadastro', 'produto', 'admin', 'contatos'];
  const name = allowed.includes(page) ? page : 'catalog';

  const script = document.createElement('script');
  script.src = `js/${name}.js?v=${Date.now()}`;
  document.body.appendChild(script);
})();
