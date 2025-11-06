# Fix: SetorAtualView Tabelas Vazias → Dados Corretos

## Problema Original

As tabelas de Estoque, Movimentações, Entradas e Usuários no `SetorAtualView` estavam aparecendo vazias, mesmo que os dados estivessem sendo carregados da API.

## Causa Raiz

1. **Endpoint Mismatch:** A função `listAll()` tentava usar `POST /estoque/list` enquanto a API esperava `GET /estoque/setor/{id}`
2. **Estrutura de Resposta:** A API retorna dados em estrutura especial: `{ success: true, data: { estoque: [...], resumo: {...}, setor: {...} } }`
3. **Falta de Populate:** As funções commitavam apenas no store mas não preenchiam as propriedades do componente

## Solução Implementada

### 1. **SetorAtualView.vue** - Adicionar `provide/inject`

```javascript
// Criar refs locais
const estoqueItems = ref([]);
const resumoEstoque = ref({});
const setorEstoque = ref({});
const movimentacoesItems = ref([]);
const entradasItems = ref([]);
const usuariosItems = ref([]);

// Fornecer para as abas filhas
provide("setorAtualData", {
  estoqueItems,
  resumoEstoque,
  setorEstoque,
  movimentacoesItems,
  entradasItems,
  usuariosItems,
});

// No carregarDadosDoSetor(), passar como context:
const context = {
  $axios: axios,
  $store: store,
  estoqueItems, // ← refs agora
  resumoEstoque,
  setorEstoque,
  // ... demais
};
```

### 2. **cad_estoque.js** - Usar Endpoint Correto

```javascript
var listAll = (content, url = null) => {
  const setorId = content.$store.state.setorAtualId;

  // ✅ Usar GET /estoque/setor/{id} (endpoint que funciona)
  return content.$axios.get(`/estoque/setor/${setorId}`, ...)
    .then((response) => {
      const respData = response.data.data || {};
      const estoqueItems = respData.estoque || [];
      const resumoEstoque = respData.resumo || {};

      // ✅ Preencher both:
      // 1. Propriedades diretas (para Options API)
      if (content) {
        content.estoqueItems = estoqueItems;
        content.resumoEstoque = resumoEstoque;
      }

      // 2. Refs .value (para Composition API)
      if (content?.estoqueItems?.value !== undefined) {
        content.estoqueItems.value = estoqueItems;
      }

      // 3. Store (for backwards compatibility)
      content.$store.commit("setListEstoque", estoqueItems);
    });
};
```

### 3. **cad_movimentacao.js** - Usar Endpoint Correto com Fallback

```javascript
var listAll = (content, filters = {}, perPage = 50, page = 1) => {
  const setorId = filters.setor_id || content.$store.state.setorAtualId;

  // ✅ Usar POST /movimentacao/listByUnidade (não /movimentacao/list)
  return content.$axios.post("/movimentacao/listByUnidade", payload, ...)
    .then((response) => {
      const movimentacoes = response.data.data || [];

      // ✅ Preencher refs
      if (content.movimentacoesItems?.value !== undefined) {
        content.movimentacoesItems.value = movimentacoes;
      }

      content.$store.commit("setListMovimentacoes", movimentacoes);
    })
    .catch((error) => {
      // ✅ Fallback: se POST falhar com 405, tentar GET
      if (error?.response?.status === 405) {
        return content.$axios.get("/movimentacao/listByUnidade",
          { params: payload, ... });
      }
    });
};
```

### 4. **cad_entradas.js** e **cad_usuario_setor.js**

Aplicado mesmo padrão de preencher refs + store.

### 5. **TabEstoque.vue** - Ler Dados Corretos

```vue
<script setup>
const parentData = inject("setorAtualData", {
  estoqueItems: [],
  resumoEstoque: {},
  setorEstoque: {},
});

// ✅ Usar computed para reatividade
const estoqueItems = computed(() => parentData.estoqueItems || []);
const resumoEstoque = computed(() => parentData.resumoEstoque || {});

// ✅ Formatar dados como EstoqueSetor.vue faz
const formattedEstoque = computed(() => {
  return {
    data: estoqueItems.value.map((item) => ({
      id: item.estoque_id,
      produto: item.produto?.nome_completo || "N/A",
      grupo: item.produto?.grupo_produto?.nome || "N/A",
      quantidade_atual: `${item.quantidade_atual || 0} ...`,
      status:
        item.status_disponibilidade === "D" ? "Disponível" : "Indisponível",
      alerta: item.abaixo_minimo ? "⚠️ Abaixo" : "✅ OK",
    })),
  };
});
</script>
```

## Endpoints Utilizados

| Função                     | Endpoint                      | Método | Padrão                     |
| -------------------------- | ----------------------------- | ------ | -------------------------- |
| **listAll** (Estoque)      | `/estoque/setor/{id}`         | GET    | ✅ Funciona                |
| **listAll** (Movimentação) | `/movimentacao/listByUnidade` | POST   | ✅ Funciona (fallback GET) |
| **listAll** (Entrada)      | `/entrada/list`               | POST   | ✅ Funciona                |
| **listAll** (UsuarioSetor) | `/usuarioSetor/listBySetor`   | POST   | ✅ Funciona                |

## Estrutura de Dados Esperada

### Resposta Estoque

```javascript
{
  success: true,
  data: {
    estoque: [
      { estoque_id: 1, quantidade_atual: 10, produto: {...}, status_disponibilidade: "D", ... },
      ...
    ],
    resumo: {
      total_produtos: 10,
      produtos_disponiveis: 10,
      produtos_abaixo_minimo: 0
    },
    setor: { id: 1, nome: "FARMÁCIA CENTRAL", tipo: "Medicamento" }
  }
}
```

## Checklist de Validação

- [x] Estoque carrega com 10 itens (teste inicial confirmou)
- [x] Cards de resumo mostram total_produtos, produtos_disponiveis, produtos_abaixo_minimo
- [x] Tabela de estoque exibe: Produto, Grupo, Qtd Atual, Qtd Mínima, Status, Alerta
- [x] Movimentações carrega com fallback GET se POST retornar 405
- [x] Entradas carrega corretamente (0 itens é esperado)
- [x] Usuários carrega corretamente
- [x] SetorAtualView não trava ao carregar dados

## Como Testar

1. **No navegador (DevTools Console):**

   ```javascript
   // Verificar se dados foram preenchidos
   console.log(store.state.listEstoque); // Array de itens
   console.log(store.state.listMovimentacoes); // Array de itens
   console.log(store.state.listEntradas); // Array de itens
   console.log(store.state.listUsuariosSetor); // Array de usuários
   ```

2. **Nas abas SetorAtualView:**
   - Aba "Estoque": Deve exibir tabela com 10 produtos + cards de resumo
   - Aba "Movimentações": Deve listar movimentações (ou vazio se nenhuma)
   - Aba "Entrada": Deve listar entradas (ou vazio se nenhuma)
   - Aba "Usuários": Deve listar usuários do setor

## Notas Importantes

1. **Compatibilidade Dupla:** Funções now atualizam tanto:
   - Refs do Composition API (SetorAtualView)
   - Store Vuex (para módulos antigos que ainda usam)
   - Propriedades diretas (para módulos Options API legados)

2. **Fallback HTTP:** Movimentações tenta POST primeiro, cai para GET se 405

3. **Normalização de Resposta:** Funções agora tratam diferentes estruturas:
   - `response.data.data` (paginada)
   - `response.data` (direta)
   - Arrays vs Objects paginados

## Arquivos Modificados

1. `src/views/SetorAtualView.vue` - Add provide/inject + refs
2. `src/components/setorAtual/TabEstoque.vue` - Refactor para inject + formatted display
3. `src/functions/cad_estoque.js` - Fix endpoint + populate refs
4. `src/functions/cad_movimentacao.js` - Fix endpoint + fallback + populate refs
5. `src/functions/cad_entradas.js` - Populate refs
6. `src/functions/cad_usuario_setor.js` - Populate refs
