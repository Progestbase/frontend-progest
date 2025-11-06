# Copilot Instructions — ProGest Frontend

**ProGest** é um sistema de gestão de estoque construído em **Vue 3 + Vite + Vuex** que consome uma **API Laravel** (baseURL: `http://localhost:8000/api`).

## Arquitetura em 3 Camadas

```
src/functions/cad_*.js  → Camada de integração REST + commits Vuex
src/components/         → Componentes reutilizáveis (modais, tabelas, layouts)
src/views/              → Views que orquestram functions + store
```

**Fluxo de dados típico:**

1. View chama `functions.listAll(this)` no `mounted()`
2. Função em `cad_*.js` faz requisição axios → commita no Vuex → UI reage
3. Modais usam `ModalBase01.vue` com slots para formulários ADD/UPDATE

## Contrato Padrão dos Módulos `cad_*.js`

Todos exportam estes métodos (veja `src/functions/cad_produtos.js` como referência):

```js
export default {
  ADD_UP(content, "ADD"|"UP"),  // Criar ou atualizar
  listAll(content, filters?),   // Listar com paginação
  listData(content, id?),        // Buscar item específico
  delete?(content, id)           // Exclusão (quando aplicável)
}
```

**Parâmetro `content`** é sempre o `this` do componente Vue, contendo:

- `$axios` → Cliente HTTP (já configurado com baseURL)
- `$store` → Vuex store
- `$toastr` → Notificações (pode ser `undefined` — sempre use defensivamente)
- `modalData` → Dados do formulário

**Headers obrigatórios em toda requisição:**

```js
headers: {
  Authorization: "Bearer " + content.$store.getters.getUserToken,
  "Content-Type": "application/json"
}
```

**IMPORTANTE:** Interceptor global em `src/main.js` adiciona `Authorization` automaticamente se token existe, mas módulos `cad_*.js` ainda definem explicitamente por compatibilidade.

## Estrutura de Payloads da API

Backend Laravel espera objetos encapsulados por tipo de entidade:

```js
// Exemplo: src/functions/cad_produtos.js
const produtoData = {
  produto: {
    // ← Chave baseada no tipo de entidade
    nome: content.modalData.nome,
    grupo_produto_id: content.modalData.grupo_produto_id,
    unidade_medida_id: content.modalData.unidade_medida_id,
    status: content.modalData.status || "A",
  },
};
```

**Endpoints padrão por módulo:**

- `POST /{recurso}/add` → Criar
- `POST /{recurso}/update` → Atualizar (incluir `id` no payload)
- `POST /{recurso}/list` → Listar com `{ filters, per_page, page }`
- `POST /{recurso}/listData` → Buscar por ID: `{ id: X }`
- `POST /{recurso}/delete/{id}` → Excluir

## Gerenciamento de Estado (Vuex)

**Mutations críticas** (`src/vuex/store.js`):

```js
setModalData(payload); // Atualizar dados do formulário
setModalErrors(errors); // Validações inline (campo → array de erros)
setModalTitle(title); // Título do modal
setModalFunction("ADD" | "UP"); // Modo do formulário
setListProdutos(data); // Listas específicas por módulo
```

**Estado de autenticação:**

- `userToken` e `user` persistidos em `localStorage`
- `router.beforeEach` redireciona para `/login` se `requiresAuth: true` e sem token
- Interceptor axios anexa `Authorization` header automaticamente

## Tratamento de Erros e Notificações

**Validações do backend (status 422):**

```js
if (response.data.status == false && response.data.validacao) {
  content.$store.commit("setModalErrors", response.data.erros);
  // Backend pode usar 'erros' ou 'errors' — normalizar se necessário
}
```

**Padrão defensivo OBRIGATÓRIO para toastr:**

```js
try {
  if (content.$toastr?.s) {
    content.$toastr.s("Sucesso!");
  } else {
    alert("Sucesso!");
  }
} catch (e) {
  alert("Sucesso!");
}
```

**Métodos toastr:** `.s()` (success), `.e()` (error), `.i()` (info), `.w()` (warning)

## Modais Bootstrap 5

**Estrutura base (`ModalBase01.vue`):**

```vue
<ModalBase01
  idModal="addUPProduto"
  :showFooter="true"
  @closed="handleModalClosed"
>
  <slot><!-- Formulário --></slot>
  <template #footer>
    <button @click="salvar">Salvar</button>
  </template>
</ModalBase01>
```

**Validação inline:**

```vue
<input v-model="modalData.nome" :class="{ 'is-invalid': modalErrors.nome }" />
<div class="invalid-feedback" v-if="modalErrors.nome">
  {{ modalErrors.nome[0] }}
</div>
```

**Fechar modal programaticamente:**

```js
const modal = document.querySelector("#addUPProduto");
const modalInstance = window.bootstrap.Modal.getInstance(modal);
if (modalInstance) modalInstance.hide();
```

## Edge Cases Importantes

### Fallback de Métodos HTTP

Ver `src/functions/cad_movimentacao.js` — tenta POST, depois GET se retornar 405:

```js
.catch((error) => {
  if (error?.response?.status === 405) {
    return content.$axios.get(url, { params: payload, headers });
  }
});
```

### Normalização de Respostas Paginadas

Backend pode retornar `data.data` ou `data` diretamente — sempre normalize:

```js
const data = response.data.data;
const lista = Array.isArray(data) ? data : data.data || [];
content.$store.commit("setListProdutos", lista);
```

### Compatibilidade Polos/Unidades

`setListPolos` também atualiza `listUnidades` para retrocompatibilidade:

```js
setListPolos(state, polos) {
  state.listPolos = polos;
  state.listUnidades = polos;  // Compatibilidade retroativa
}
```

## Comandos de Desenvolvimento (PowerShell)

```powershell
npm install    # Instalar dependências
npm run dev    # Dev server → http://localhost:5173
npm run build  # Build para produção
npm run preview # Preview do build de produção
```

**Nota:** Vitest configurado mas sem script. Para adicionar:

```json
"scripts": { "test": "vitest", "test:ui": "vitest --ui" }
```

## Arquivos-Chave para Referência

| Arquivo                                  | Propósito                                      |
| ---------------------------------------- | ---------------------------------------------- |
| `src/config.js`                          | URL base da API                                |
| `src/main.js`                            | Setup axios + interceptor global + plugins Vue |
| `src/router/index.js`                    | Rotas + guard de autenticação                  |
| `src/vuex/store.js`                      | Estado global (60+ mutations)                  |
| `src/functions/cad_produtos.js`          | **Template de referência** para novos módulos  |
| `src/components/layouts/ModalBase01.vue` | Modal reutilizável base                        |
| `src/components/layouts/TableBase01.vue` | Tabela base com paginação                      |
| `UNIDADES_MEDIDA_IMPLEMENTACAO.md`       | Exemplo de migração mock → API real            |

## Regras Críticas ao Modificar Código

1. **Preserve contratos** — Não altere assinaturas de `ADD_UP/listAll/listData` sem atualizar consumidores
2. **Use toastr defensivamente** — Sempre try/catch com fallback para `alert()`
3. **Normalize respostas paginadas** — Backend retorna estruturas variadas
4. **Mantenha headers de autorização** — Mesmo com interceptor, defina explicitamente em `cad_*.js`
5. **Teste fallbacks HTTP** — Alguns endpoints podem retornar 405 e precisar de GET
6. **Valide `errors` e `erros`** — Backend Laravel usa ambas as chaves em diferentes contextos
7. **Status sempre "A" ou "I"** — Ativo/Inativo, nunca booleanos
8. **Use `text-uppercase` em inputs** — Padrão do sistema para consistência de dados

## Stack Tecnológico

- **Vue 3.5** + **Vite 6** — Framework reativo + build tool
- **Vuex 4** — Gerenciamento de estado global
- **Vue Router 4** — Roteamento SPA
- **Axios** — Cliente HTTP (com interceptor global)
- **Bootstrap 5.3** — UI, modais, grid system
- **Tailwind CSS 3** — Utility-first CSS (uso complementar)
- **vue-the-mask** — Máscaras de input (CPF, telefone, etc.)
- **@mdi/font** — Material Design Icons

## Criando Novos Módulos CRUD

Use `src/functions/cad_produtos.js` como template:

1. **Crie `src/functions/cad_novomodulo.js`** seguindo o contrato padrão
2. **Adicione mutation** em `src/vuex/store.js`: `setListNovoModulo(state, data)`
3. **Crie view** em `src/views/cadastros/NovoModulo.vue`
4. **Crie modal** em `src/components/cadastros/ModalNovoModulo.vue`
5. **Registre rota** em `src/router/index.js` com `meta: { requiresAuth: true }`
6. **Implemente validação inline** nos inputs do modal
7. **Teste fallbacks** de erro (toastr → alert)

**Exemplo de payload:**

```js
const novoModuloData = {
  novoModulo: {
    // ← Chave no singular
    nome: content.modalData.nome,
    status: content.modalData.status || "A",
  },
};
```
