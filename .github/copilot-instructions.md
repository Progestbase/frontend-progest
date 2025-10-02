# Copilot Instructions - ProGest Frontend

## Visão Geral do Projeto

**ProGest** é um sistema de gestão de estoque hospitalar/farmacêutico construído com **Vue 3 + Vite + Bootstrap 5**. O frontend comunica-se com uma API Laravel em `http://localhost:8000/api` e implementa um padrão arquitetural específico com separação clara entre funções de API, componentes e views.

## Arquitetura em 3 Camadas

### 1. Camada de Funções (`src/functions/`)

**Padrão Crítico**: Todos os módulos CRUD seguem este template:

```javascript
// Pattern: cad_*.js (cad_produtos.js, cad_estoque.js, etc.)
var ADD_UP = (content, funcao) => {
  // funcao: "ADD" | "UP"
  // content: referência ao componente Vue (this)
  content.$axios.post(
    funcao == "ADD" ? "/api/endpoint/add" : "/api/endpoint/update",
    { resource: content.modalData },
    {
      headers: {
        Authorization: "Bearer " + content.$store.getters.getUserToken,
      },
    }
  );
  // Atualiza Vuex store, exibe toastr, e fecha modal Bootstrap
};

var listAll = (content, url = null) => {
  /* GET list com filtros */
};
var listData = (content) => {
  /* GET single record by ID */
};
```

**Regras Importantes**:

- Use `content.$toastr.s()` / `.e()` com fallback para `alert()` quando toastr não estiver disponível
- Sempre inclua header `Authorization: Bearer ${token}` obtido via `$store.getters.getUserToken`
- Após sucesso em ADD/UP, chame `listAll(content)` para refresh
- Erros de validação vêm em `response.data.erros` (objeto com arrays por campo)
- Commit de erros no Vuex: `content.$store.commit("setModalErrors", response.data.erros)`

### 2. Camada de Componentes

#### Modais (`src/components/cadastros/Modal*.vue`)

- **Base**: `ModalBase01.vue` - wrapper Bootstrap 5 com slots
- **Pattern**: Cada modal gerencia seu estado através de `computed` que mapeia `$store.state.modalData`
- **Inline Forms**: Suporte para criação rápida de recursos relacionados (ex: criar grupo_produto dentro de ModalProdutos)
- **Validação**: Exibe erros inline com `modalErrors` do Vuex

```vue
<!-- Exemplo de bind com validação -->
<input v-model="modalData.nome" :class="{ 'is-invalid': modalErrors.nome }" />
<div
  v-if="modalErrors.nome"
  class="invalid-feedback"
>{{ modalErrors.nome[0] }}</div>
```

#### Templates Reutilizáveis (`src/components/layouts/`)

- `TableBase01.vue` - Tabela padronizada
- `TopoCadastro01.vue` - Header de páginas cadastrais
- `LinkModal01.vue` - Botões de ação (+, editar, excluir)

### 3. Camada de Views (`src/views/`)

**Estrutura por Roles**:

- `roleAdmin/` - Interface administrativa (Sidebar + Header layout)
- `roleSolicitante/` - Interface de solicitações/pedidos
- `cadastros/` - CRUDs genéricos

**Pattern de Views CRUD**:

```vue
<script>
import functions from "@/functions/cad_produtos.js";

export default {
  data() {
    return { functions };
  },
  computed: {
    // Map Vuex getters for reactive lists
    listData() {
      return this.$store.state.listProdutos;
    },
  },
  mounted() {
    functions.listAll(this); // Load initial data
  },
};
</script>
```

## Vuex Store (`src/vuex/store.js`)

**State Global Crítico**:

- `userToken` - Token JWT (sincronizado com localStorage)
- `modalData` - Estado compartilhado de formulários modais
- `modalErrors` - Erros de validação da API
- `list*` - Listas de recursos (listProdutos, listUnidades, etc.)
- `unidadeAtual` - Contexto de unidade selecionada

**Mutations Chave**:

```javascript
setModalData(state, payload); // Merge parcial
SET_MODAL_DATA(state, payload); // Substituição completa
setModalErrors(state, errors);
setList[Resource](state, data);
```

## Autenticação & API

- **Base URL**: Configurada em `src/config.js` e `src/main.js` (`axios.defaults.baseURL`)
- **Token Storage**: `localStorage.getItem("token")`
- **Route Guards**: `router.beforeEach` verifica `meta.requiresAuth`
- **Logout**: Redireciona para `/login` e limpa token via `store.commit("clearUserToken")`

## Padrões de UI

### Icons & Styling

- **Icons**: Material Design Icons (`@mdi/font`) - use classes `mdi mdi-*`
- **Framework**: Bootstrap 5 + Tailwind CSS (híbrido)
- **Cores Custom** (Tailwind):
  - `azul-eclipse` (#313169)
  - `off-white` (#F8F8F8)

### Feedback Visual

```vue
<!-- Loading State -->
<div v-if="loading" class="spinner-border text-primary"></div>

<!-- Status Badge -->
<span class="badge" :class="status === 'A' ? 'bg-success' : 'bg-secondary'">
  {{ status === 'A' ? 'Ativo' : 'Inativo' }}
</span>
```

## Convenções de Código

1. **Uppercase Inputs**: Use `class="text-uppercase"` em inputs de nomes/códigos
2. **Campo Status**: Sempre valores "A" (Ativo) ou "I" (Inativo)
3. **IDs Relacionais**: Use `*_id` para foreign keys (ex: `grupo_produto_id`)
4. **Formatação de Data**: Backend retorna ISO 8601, converter para `dd/mm/yyyy` na exibição
5. **Quantities**: Exibir com unidade de medida: `${quantidade} ${unidade_medida.nome}`

## Workflows Comuns

### Adicionar Novo CRUD

1. Criar `src/functions/cad_novo.js` seguindo pattern `ADD_UP` / `listAll` / `listData`
2. Criar `src/components/cadastros/ModalNovo.vue` extendendo `ModalBase01`
3. Criar `src/views/cadastros/Novo.vue` com tabela e botão de adicionar
4. Adicionar mutation `setListNovo` no Vuex store
5. Registrar rota em `src/router/index.js`

### Debug de Erros API

1. Verificar console do navegador para `response.data`
2. Confirmar token válido: `localStorage.getItem("token")`
3. Validar estrutura do payload conforme documentação da API
4. Usar fallback de dados mockados apenas em `catch` de erro 500 (ver `cad_estoque.js` linha 140+)

### Desenvolvimento Local

```powershell
npm install          # Instalar dependências
npm run dev          # Dev server (porta padrão Vite)
npm run build        # Build produção
```

## Pontos de Atenção

- **Bootstrap Modal Lifecycle**: Sempre use `window.bootstrap.Modal.getInstance()` antes de `.hide()`
- **Reactive Issues**: Listas do Vuex devem ser atualizadas por mutation, não diretamente
- **API Response Structure**:
  ```javascript
  { status: true/false, data: {...}, erros: {...}, validacao: true/false }
  ```
- **Edição Inline**: Campos editáveis na tabela (ex: `quantidade_minima` em EstoqueUnidade) usam estado local + salvamento via API

## Recursos Especiais

### Estoque por Unidade (`EstoqueUnidade.vue`)

- Props: `unidadeId` (reactive)
- Watch automático para recarregar ao mudar unidade
- Formatação computada com status de disponibilidade e alertas de estoque mínimo
- Edição inline de `quantidade_minima` com botões de salvar/cancelar

### Inline Resource Creation

Componentes como `ModalProdutos` permitem criar `grupo_produto` sem sair do modal:

```vue
<button @click="toggleGrupoForm">Novo Grupo</button>
<div v-if="showGrupoForm">
  <!-- Form inline -->
  <button @click="salvarGrupoInline">Salvar</button>
</div>
```

## Arquivos de Referência

- **CRUD Completo**: `src/functions/cad_produtos.js` + `src/views/cadastros/Produtos.vue`
- **Modal Avançado**: `src/components/cadastros/ModalProdutos.vue`
- **Edição Inline**: `src/views/cadastros/EstoqueUnidade.vue` (linhas 127-172)
- **Auth Flow**: `src/views/Login.vue` + `src/router/index.js` (beforeEach guard)
