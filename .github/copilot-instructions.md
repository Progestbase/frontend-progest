# Copilot Instructions - ProGest Frontend

## Visão Geral do Projeto

**ProGest** é um sistema de gestão de estoque hospitalar/farmacêutico construído com **Vue 3 + Vite + Bootstrap 5**. O frontend comunica-se com uma API Laravel em `http://localhost:8000/api` e implementa um padrão arquitetural específico com separação clara entre funções de API, componentes e views.

## Arquitetura em 3 Camadas

````instructions
# Copilot Instructions — ProGest Frontend (resumo prático)

ProGest é um frontend Vue 3 + Vite que fala com uma API Laravel (base URL em `src/config.js` / `src/main.js`). Concentre-se em três áreas:

- Camada de funções: `src/functions/cad_*.js` — padrão único para CRUDs: exporta funções como ADD_UP(content, "ADD"|"UP"), listAll(content[, url]), listData(content).
  - Ex.: `cad_produtos.js` usa `content.$axios.post(..., { resource: content.modalData }, { headers: { Authorization: 'Bearer '+content.$store.getters.getUserToken }})`.
  - Erros de validação vêm em `response.data.erros`; escreva-os em Vuex com `content.$store.commit('setModalErrors', erros)`.

- Componentes de UI: modais seguem `ModalBase01.vue` (slots). Modais em `src/components/cadastros/` usam `computed` que lê `this.$store.state.modalData` e `modalErrors`.
  - Exibição de erro: `<input v-model="modalData.nome" :class="{ 'is-invalid': modalErrors.nome }" />` e mostrar `modalErrors.nome[0]`.

- Views & Vuex: views importam o módulo de funções e chamam `functions.listAll(this)` no mounted. Estado crítico em `src/vuex/store.js`: `userToken`, `modalData`, `modalErrors`, `list*`, `unidadeAtual`.
  - Token JWT no localStorage e getter `getUserToken` usado nos headers.

Padrões operacionais rápidos

- Autenticação/API: sempre enviar header `Authorization: Bearer ${token}`; baseURL configurada em `src/config.js`.
- Modais: após sucesso em ADD/UP, chamar `listAll(content)` e fechar modal com `window.bootstrap.Modal.getInstance(el).hide()`.
- Mutations comuns: `setModalData` (merge), `SET_MODAL_DATA` (replace), `setModalErrors`, `setList<Recurso>`.

Comandos de desenvolvimento (Windows / PowerShell):

```powershell
npm install
npm run dev   # start Vite dev server
npm run build # build produção
```

Arquivos-prioridade para leitura ao trabalhar com features/bugs

- `src/functions/*` — implementar chamadas API seguindo o padrão ADD_UP/listAll/listData
- `src/components/cadastros/Modal*.vue` e `src/components/layouts/ModalBase01.vue` — como modais ligam-se ao Vuex
- `src/vuex/store.js` — formatos de state/mutations/getters (token, modalData, modalErrors)
- `src/config.js`, `src/main.js` — axios baseURL e plugins globais
- `src/router/index.js` — proteção de rotas (beforeEach)

Notas específicas (não genéricas)

- Use `content.$toastr.s()` / `.e()` quando disponível; fallback: `alert()`.
- Erros de validação são arrays por campo: ex: `modalErrors.nome[0]`.
- Campos de status usam `'A'` / `'I'` (Ativo/Inativo).

Se algo não estiver claro, diga qual arquivo/fluxo quer que eu estude (ex.: `cad_estoque.js` ou `ModalProdutos.vue`) que eu atualizo este guia com exemplos adicionais.
````
