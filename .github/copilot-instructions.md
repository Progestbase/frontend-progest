# Copilot Instructions — ProGest Frontend

Breve e prático: ProGest é um frontend Vue 3 + Vite que consome uma API Laravel (base URL: http://localhost:8000/api). Este arquivo documenta os padrões que agentes automáticos e novos desenvolvedores precisam conhecer rápido para serem produtivos.

1) Panorama arquitetural (o "porquê")
- Projeto organizado em 3 camadas claras:
  - Camada de funções REST em `src/functions/` (módulos `cad_*`): encapsulam chamadas axios e a lógica de manipular o Vuex após resposta. Ex.: `src/functions/cad_produtos.js`, `src/functions/cad_movimentacao.js`.
  - Componentes/Modais em `src/components/cadastros/` e `src/components/layouts/` (ex.: `ModalBase01.vue`) fornecem slots e eventos padrão para CRUDs.
  - Views em `src/views/` chamam os módulos de função (geralmente `functions.listAll(this)` no mounted) e usam o `store` para estado compartilhado.

2) Convenções e contratos (curtos e acionáveis)
- Funções em `src/functions/cad_*.js` exportam um objeto com métodos comuns: ADD_UP(content, "ADD"|"UP"), listAll(content[, url|filters]), listData(content). Presuma que `content` é o `this` do componente (contém `$axios`, `$store`, `$toastr`, `modalData`).
- Requisições enviam token via header: Authorization: Bearer ${content.$store.getters.getUserToken}. BaseURL configurada em `src/config.js` e também setada em `src/main.js` (axios.defaults.baseURL).
- Erros de validação do backend chegam como arrays por campo (ex.: `response.data.erros` ou `response.data.errors`). Padrão: commit `setModalErrors` com o objeto de erros para exibição inline.

3) Padrões de UI e fluxo de modal
- `ModalBase01.vue` fornece slots e emite `closed`. Fechamento programático costuma usar `window.bootstrap.Modal.getInstance(el).hide()`; o componente já expõe um método `handleInternalClose` e escuta `hidden.bs.modal`.
- Inputs mostram validação com `:class="{ 'is-invalid': modalErrors.campo }"` e a view exibe `modalErrors.campo[0]` quando presente.

4) Fluxos e exemplos concretos
- Exemplo de ADD/UP (ver `src/functions/cad_produtos.js`):
  - Gera payload específico, chama `content.$axios.post('/produtos/add'|'/produtos/update', payload, { headers })`.
  - Em sucesso: chama `listAll(content)`, limpa `setModalErrors`, atualiza `setModalTitle` e altera `setModalFunction` para 'UP'.
  - Em validação: commit `setModalErrors(response.data.erros)` e exibe toastr (`content.$toastr.e`) ou `alert()` como fallback.
- Observação: alguns módulos implementam fallbacks (ex.: `cad_movimentacao.js` tenta GET se POST retorna 405, e usa endpoints alternativos). Preserve esse comportamento ao refatorar.

5) Arquivos-chave para revisão rápida
- Axios / baseURL: `src/config.js`, `src/main.js`
- Vuex: `src/vuex/store.js` (mutations: `setModalData`, `SET_MODAL_DATA`, `setModalErrors`, `setListProdutos`, `setListMovimentacoes`, getters: `getUserToken`)
- Funções REST: `src/functions/*` (comece por `cad_produtos.js`, `cad_movimentacao.js`, `cad_entradas.js`)
- Modais/Layouts: `src/components/layouts/ModalBase01.vue`, `src/components/cadastros/ModalProdutos.vue` (padrões de slot/props)
- Router: `src/router/index.js` (proteção de rotas via token em localStorage)

6) Comandos e scripts (Windows / PowerShell)
```powershell
npm install
npm run dev    # Vite dev server (live reload)
npm run build  # build para produção
npm run preview # preview do build
```
Nota: `vitest` está presente nas devDependencies; não existe script `test` no package.json por padrão — adicione se precisar rodar testes automatizados.

7) Convenções de tratamento de erros e notificações
- Preferir `content.$toastr.s()` e `.e()` quando disponível; código deve tolerar ausência do toastr e usar `alert()` como fallback.
- Validations: backend pode retornar `422` e `response.data.errors` ou `response.data.erros` (consumir ambos). Commitar erros com `setModalErrors`.

8) Boas práticas específicas ao projeto
- Não execute reformatções maciças: preserve estilo existente. Quando modificar um `cad_*`, mantenha os contratos (ADD_UP/listAll/listData) para compatibilidade com as views.
- Testes rápidos: crie pequenos testes unitários ou mocks para funções de `src/functions` se for alterar regras de payload.

9) Edge cases recorrentes (a vigiar)
- Endpoints que mudam método (POST vs GET) — alguns módulos já tratam fallback; reusar esse padrão.
- Respostas paginadas: `listAll` costuma receber `{ data: [...], pagination }` ou somente `data` — normalize antes de commitar no store.

Se quiser, eu faço uma iteração: atualizar exemplos inline em `src/functions/cad_produtos.js` ou gerar snippets de testes para `cad_movimentacao.js`. Feedback rápido sobre quais seções estão incompletas e eu atualizo.
