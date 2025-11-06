# Copilot Instructions — ProGest Frontend

**ProGest** é um sistema de gestão de estoque construído em **Vue 3 + Vite + Vuex** que consome uma **API Laravel** (baseURL: `http://localhost:8000/api`). Este documento concentra padrões arquiteturais e convenções essenciais para produtividade imediata.

---

## 1. Arquitetura em 3 camadas

```
src/functions/cad_*.js     → Camada de integração REST + lógica Vuex
src/components/            → Modais reutilizáveis (ModalBase01) e componentes de layout
src/views/                 → Views que orquestram functions + store
```

**Fluxo típico:**

1. View chama `functions.listAll(this)` no `mounted()`
2. Função `cad_*.js` faz requisição axios → commita no Vuex → atualiza UI
3. Modais usam `ModalBase01.vue` com slots para formulários de ADD/UPDATE

**Exemplo real** (`src/views/cadastros/Produtos.vue`):

```js
mounted() {
  functions.listAll(this);
  this.carregarGruposProdutos();
  this.carregarUnidadesMedida();
}
```

---

## 2. Contratos de `src/functions/cad_*.js`

Todos os módulos exportam métodos padronizados:

```js
export default {
  ADD_UP(content, "ADD"|"UP"),  // Criar ou atualizar
  listAll(content, filters?),   // Listar com paginação
  listData(content, id?),        // Buscar item específico
  delete?(content, id)           // Exclusão (quando aplicável)
}
```

**Parâmetro `content`** é o `this` do componente, contém:

- `$axios` → Cliente HTTP configurado
- `$store` → Vuex store
- `$toastr` → Notificações (pode ser `undefined`)
- `modalData` → Dados do formulário

**Headers obrigatórios:**

```js
headers: {
  Authorization: "Bearer " + content.$store.getters.getUserToken,
  "Content-Type": "application/json"
}
```

---

## 3. Estrutura de payloads da API

Cada módulo encapsula dados em objetos nomeados:

```js
// src/functions/cad_produtos.js
const produtoData = {
  produto: {
    nome: content.modalData.nome,
    grupo_produto_id: content.modalData.grupo_produto_id,
    unidade_medida_id: content.modalData.unidade_medida_id,
    status: content.modalData.status || "A",
  },
};
```

**Endpoints comuns:**

- `POST /produtos/add` → Criar
- `POST /produtos/update` → Atualizar (incluir `id`)
- `POST /produtos/list` → Listar com `{ filters, per_page, page }`
- `POST /produtos/delete/{id}` → Excluir

---

## 4. Gerenciamento de estado (Vuex)

**Mutations principais** (`src/vuex/store.js`):

```js
setModalData(payload); // Atualizar dados do modal
setModalErrors(errors); // Validações inline (campo → [erros])
setModalTitle(title); // Título do modal
setModalFunction("ADD" | "UP"); // Modo do formulário
setListProdutos(data); // Lista de produtos
setListMovimentacoes(data); // Movimentações de estoque
```

**Getters:**

- `getUserToken` → Token JWT do localStorage
- `getModalData` → Dados atuais do formulário

**Estado de autenticação:**

- Token e user armazenados em `localStorage`
- Router protege rotas via `beforeEach` (redireciona para `/login` se ausente)

---

## 5. Tratamento de erros e notificações

### Validações do backend (422)

```js
// Backend pode retornar 'errors' ou 'erros'
if (response.data.status == false && response.data.validacao) {
  content.$store.commit("setModalErrors", response.data.erros);

  try {
    if (content.$toastr?.e) {
      content.$toastr.e("Erro de validação:\n" + erros);
    } else {
      alert("Erro de validação:\n" + erros);
    }
  } catch (e) {
    alert("Erro de validação:\n" + erros);
  }
}
```

### Padrão defensivo com toastr

**Sempre use fallback** pois `$toastr` pode não estar disponível:

```js
try {
  content.$toastr?.s("Sucesso!") || alert("Sucesso!");
} catch (e) {
  alert("Sucesso!");
}
```

### Métodos toastr suportados

- `.s()` ou `.success()` → Sucesso
- `.e()` ou `.error()` → Erro
- `.i()` ou `.info()` → Informação
- `.w()` ou `.warning()` → Aviso

---

## 6. Padrões de modal (Bootstrap 5)

**ModalBase01.vue** é o componente base:

```vue
<ModalBase01
  idModal="addUPProduto"
  :showFooter="true"
  @closed="handleModalClosed"
>
  <slot><!-- Formulário aqui --></slot>
  <template #footer>
    <button @click="salvar">Salvar</button>
  </template>
</ModalBase01>
```

**Fechamento programático:**

```js
const modal = document.querySelector("#addUPProduto");
const modalInstance = window.bootstrap.Modal.getInstance(modal);
if (modalInstance) modalInstance.hide();
```

**Validação inline:**

```vue
<input v-model="modalData.nome" :class="{ 'is-invalid': modalErrors.nome }" />
<div class="invalid-feedback" v-if="modalErrors.nome">
  {{ modalErrors.nome[0] }}
</div>
```

---

## 7. Edge cases e padrões especiais

### Fallback de métodos HTTP

**Ver `src/functions/cad_movimentacao.js`** — tenta POST, depois GET se retornar 405:

```js
.catch((error) => {
  if (error?.response?.status === 405) {
    return content.$axios.get(url, { params: payload, headers });
  }
});
```

### Respostas paginadas

Normalize antes de commitar:

```js
const data = response.data.data;
const lista = Array.isArray(data) ? data : data.data || [];
content.$store.commit("setListProdutos", lista);
```

### Compatibilidade polos/unidades

**Nota histórica:** `listPolos` e `listUnidades` são sincronizados:

```js
setListPolos(state, polos) {
  state.listPolos = polos;
  state.listUnidades = polos; // Compatibilidade retroativa
}
```

---

## 8. Workflows de desenvolvimento

### Comandos (PowerShell)

```powershell
npm install              # Instalar dependências
npm run dev              # Dev server (localhost:5173)
npm run build            # Build para produção
npm run preview          # Preview do build
```

### Estrutura de dependências principais

- **Vue 3** → Framework reativo
- **Vite** → Build tool e dev server
- **Vuex 4** → Estado global
- **axios** → Cliente HTTP
- **Bootstrap 5** → UI e modais
- **vue-router** → Roteamento SPA
- **vue-the-mask** → Máscaras de input
- **Tailwind CSS** → Utility-first CSS

### Testes

`vitest` está instalado mas sem script configurado. Para adicionar:

```json
// package.json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

---

## 9. Arquivos-chave para referência

| Arquivo                                  | Propósito                                     |
| ---------------------------------------- | --------------------------------------------- |
| `src/config.js`                          | URL base da API                               |
| `src/main.js`                            | Setup axios, Vue plugins                      |
| `src/router/index.js`                    | Rotas + guard de autenticação                 |
| `src/vuex/store.js`                      | Estado global (60+ mutations)                 |
| `src/functions/cad_produtos.js`          | **Template de referência** para novos módulos |
| `src/components/layouts/ModalBase01.vue` | Modal reutilizável base                       |
| `UNIDADES_MEDIDA_IMPLEMENTACAO.md`       | Exemplo de migração mock → API real           |

---

## 10. Regras críticas ao modificar código

1. **Preserve contratos** — Não altere assinaturas de `ADD_UP/listAll/listData` sem atualizar todos os consumidores
2. **Use toastr defensivamente** — Sempre tente/catch com fallback para `alert()`
3. **Normalize respostas paginadas** — Backend pode retornar `data.data` ou `data` diretamente
4. **Mantenha headers de autorização** — Todas requisições precisam do Bearer token
5. **Teste fallbacks HTTP** — Se alterar um `cad_*.js`, verifique se há fallback GET/POST
6. **Valide ambos `errors` e `erros`** — Backend Laravel pode usar qualquer um

---

## Próximos passos sugeridos

Se alguma seção precisa de detalhamento (ex.: fluxo de entrada de estoque, roles de usuário, estrutura de lotes), sinalize para iteração.
