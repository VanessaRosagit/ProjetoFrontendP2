# Encanto Íntimo — Lingerie & Moda Íntima

Projeto Frontend desenvolvido para a disciplina **P2 de Frontend** — FATEC São Roque.

---

## Objetivo

Desenvolver uma aplicação web de e-commerce para uma loja de lingerie, consumindo a API REST publicada no Render. A aplicação permite ao usuário navegar pelo catálogo de produtos, visualizar detalhes, criar conta, fazer login para cliente e para administradores, gerenciar produtos e usuários.

---

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript puro (Vanilla JS) — sem frameworks
- API REST: https://base-back-dwpz.onrender.com
- Cloudinary (upload de imagens)

---

## Funcionalidades implementadas

- Catálogo de produtos com busca e filtro por categoria
- Página de detalhe do produto
- Cadastro de usuário (consome `POST /cadastrar`)
- Login com autenticação JWT (consome `POST /entrar`)
- Logout
- Painel administrativo (acesso restrito):
  - CRUD de produtos (criar, editar, excluir)
  - Upload de imagem via Cloudinary
  - Listagem de usuários
- Responsividade para mobile e desktop
- Navegação por roteamento via `?page=` (SPA sem framework)

---

## Como executar localmente

1. Clone o repositório:

   ```bash
   git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   ```

2. Abra o arquivo `index.html` na raiz do projeto em um navegador
3. Ou use a extensão **Live Server** no VS Code para servir localmente

> Não é necessário instalar dependências — o projeto usa apenas HTML, CSS e JavaScript puro.
> Para entrar no admin coloque o login admin@gmail.com senha 123

---

## Link do deploy

[GitHub Pages — Encanto Íntimo](https://SEU_USUARIO.github.io/SEU_REPOSITORIO)

---

## Link do vídeo pitch

[Assistir no YouTube / Drive](LINK_DO_VIDEO)

---

## Estrutura do projeto

```text
├── index.html              # Redireciona para pages/index.html
├── pages/
│   └── index.html          # Shell único — todas as páginas passam por aqui
├── css/
│   └── styles.css          # Todo o CSS do projeto em um único arquivo
├── js/
│   ├── api.js              # Chamadas à API REST + localStorage fallback
│   ├── ui.js               # Helpers de DOM, header, footer, modal, toast
│   ├── router.js           # Roteamento via ?page= (carrega o JS da página)
│   ├── cloudinary.js       # Upload de imagens para o Cloudinary
│   ├── catalog.js          # Página do catálogo
│   ├── login.js            # Página de login
│   ├── cadastro.js         # Página de cadastro
│   ├── produto.js          # Página de detalhe do produto
│   └── admin.js            # Painel administrativo
└── pages/img/              # Imagens SVG dos produtos
```

---

## Decisões técnicas relevantes

- **Zero innerHTML**: todo o DOM é construído via `document.createElement` usando a função helper `el(tag, opts)`, garantindo segurança contra XSS.
- **CSS em arquivo único**: todos os estilos consolidados em `css/styles.css`, carregado diretamente pelo HTML.
- **Roteamento SPA**: um único `pages/index.html` serve todas as páginas. O `router.js` lê o parâmetro `?page=` da URL e carrega dinamicamente o script correto.
- **Fallback local**: quando a API está indisponível, os dados são mantidos no `localStorage` para garantir funcionamento contínuo.
- **Upload de imagens**: integração com Cloudinary via upload não-assinado (unsigned preset), sem necessidade de backend próprio.

---

## Autor

**Vanessa AP Rosa da Silva**  
FATEC São Roque — P2 Frontend
