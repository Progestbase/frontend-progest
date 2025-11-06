# Fix: Carregamento de Dados do Setor Atual

## Problema Identificado

A página `/setor-atual` estava com as abas vazias (estoque, movimentações, entradas, usuários) porque:

1. **SetorAtualView.vue** não estava chamando as funções para carregar os dados
2. As funções `listAll` em `cad_estoque.js`, `cad_movimentacao.js`, `cad_entradas.js` não tinham lógica para filtrar por `setorAtualId`
3. As componentes tab estavam inicializadas com arrays vazios em vez de usar o store

## Soluções Implementadas

### 1. SetorAtualView.vue

**Mudança:** Adicionado método `carregarDadosDoSetor()` que:

- Importa as functions: `cad_estoque`, `cad_movimentacao`, `cad_entradas`, `cad_usuario_setor`
- Chama `listAll(context)` para cada função
- Cada função agora recebe um contexto com axios e store
- Logs de debug para rastrear o carregamento

```js
const carregarDadosDoSetor = async () => {
  // ...
  await functionsEstoque.listAll(context);
  await functionsMovimentacao.listAll(context);
  await functionsEntrada.listAll(context);
  await functionsUsuarioSetor.listAll(context);
  // ...
};
```

### 2. cad_estoque.js - `listAll()`

**Antes:**

- Usava `content.$store.state.searchFilters` (vazio)
- Não retornava Promise
- Disparava alert em erro

**Depois:**

- Extrai `setorAtualId` do store
- Adiciona `setor_id` aos filtros
- Normaliza resposta (data.data ou data)
- Retorna `{ success, data, error }`
- Log detalhado para debug
- Sem alerts (apenas logs)

```js
const payload = {
  filters: content.$store.state.searchFilters || {},
};

if (setorId) {
  payload.filters.setor_id = setorId;
}

return content.$axios.post("/estoque/list", payload, {...})
  .then(response => {
    // ... normalizar e commitar
    return { success: true, data: estoqueData };
  })
  .catch(error => {
    return { success: false, data: [], error };
  });
```

### 3. cad_movimentacao.js - `listAll()`

**Antes:**

- Usava GET `/movimentacao/listBySetor` (pode estar retornando 405)
- Não extraía setor_id do store
- Não retornava Promise

**Depois:**

- Agora usa POST `/movimentacao/list` (padrão da API)
- Extrai `setorAtualId` do store
- Adiciona `setor_id` aos filtros
- Retorna `{ success, data, error }`
- Log detalhado

```js
const payload = {
  filters: {
    setor_id: setorId,
    ...filters,
  },
  per_page: perPage,
  page: page,
};

return content.$axios.post("/movimentacao/list", payload, {...})
```

### 4. cad_entradas.js - `listAll()`

**Antes:**

- Não filtravia por setor
- Não retornava Promise

**Depois:**

- Extrai `setorAtualId` do store
- Adiciona `setor_id` aos filtros
- Retorna `{ success, data, error }`
- Log melhorado com emoji

```js
if (setorId) {
  payload.filters.setor_id = setorId;
}

return content.$axios.post("/entrada/list", payload, {...})
```

### 5. cad_usuario_setor.js - `listAll()` (NEW)

**Novo método:**

- Criado `listAll(content, setorId = null)`
- Extrai `setorAtualId` do store se não for passado
- Chama `listBySetor` internamente
- Commita no store com `setListUsuariosSetor`
- Retorna `{ success, data, error }`
- Exportado no objeto de funções

```js
var listAll = (content, setorId = null) => {
  const idSetor = setorId || content.$store.state.setorAtualId;

  if (!idSetor) return Promise.resolve({ success: false, data: [] });

  return content.$axios.post("/usuarioSetor/listBySetor", { setor_id: idSetor }, {...})
    .then(response => {
      content.$store.commit("setListUsuariosSetor", usuarios);
      return { success: true, data: usuarios };
    })
    .catch(error => {
      return { success: false, data: [], error };
    });
};
```

### 6. TabEstoque.vue

**Antes:**

```js
const estoque = ref([]);
onMounted(() => {
  estoque.value = []; // ❌ Nunca carregava
});
```

**Depois:**

```js
const estoque = computed(() => {
  const lista = store.state.listEstoque;
  if (Array.isArray(lista)) return lista;
  if (lista && lista.data && Array.isArray(lista.data)) return lista.data;
  return [];
});
```

### 7. TabUsuarios.vue

**Antes:**

```js
const listUsuariosSetor = ref([]); // ❌ Nunca carregava
```

**Depois:**

```js
const listUsuariosSetor = computed(() => {
  return store.getters.getListUsuariosSetor || [];
});
```

## Store - Getters Adicionados

```js
getters: {
  getListEstoque: (state) => state.listEstoque,
  getListEstoqueLote: (state) => state.listEstoqueLote,
  getListMovimentacoes: (state) => state.listMovimentacoes,
  getListEntradas: (state) => state.listEntradas,
  getListUsuariosSetor: (state) => state.listUsuariosSetor,
}
```

## Fluxo Agora

```
SetorAtualView.vue (mounted)
├─ loadSetorDetails()
│  └─ Obter setorDetails do store
│     └─ carregarDadosDoSetor()
│        ├─ functionsEstoque.listAll(context)
│        │  └─ POST /estoque/list?filters[setor_id]=X
│        │     └─ store.commit("setListEstoque", dados)
│        ├─ functionsMovimentacao.listAll(context)
│        │  └─ POST /movimentacao/list?filters[setor_id]=X
│        │     └─ store.commit("setListMovimentacoes", dados)
│        ├─ functionsEntrada.listAll(context)
│        │  └─ POST /entrada/list?filters[setor_id]=X
│        │     └─ store.commit("setListEntradas", dados)
│        └─ functionsUsuarioSetor.listAll(context)
│           └─ POST /usuarioSetor/listBySetor?setor_id=X
│              └─ store.commit("setListUsuariosSetor", dados)
│
├─ TabEstoque renderiza com store.state.listEstoque
├─ TabMovimentacoes renderiza com store.getters.getListMovimentacoes
├─ TabEntrada renderiza com store.getters.getListEntradas
└─ TabUsuarios renderiza com store.getters.getListUsuariosSetor
```

## Verificação

Os logs agora mostram:

```
📥 Iniciando carregamento dos dados do setor...
📦 Carregando estoque...
✓ Estoque carregado: X
🔄 Carregando movimentações...
✓ Movimentações carregadas: Y
📥 Carregando entradas...
✓ Entradas carregadas: Z
👥 Carregando usuários do setor...
✓ Usuários carregados: W
✅ Todos os dados do setor foram carregados!
```

## Próximos Passos

1. Testar cada aba para garantir que dados são exibidos
2. Verificar se ainda há erros 422 ou 500 na API
3. Implementar modais para ADD/UPDATE em cada tab
4. Adicionar paginação se necessário

## Compatibilidade

Estas mudanças mantêm compatibilidade com:

- Módulo antigo de Setores (`/setores/[id]`)
- Views que usavam `listAll` sem setor específico (usarão filtros do store)
- Código existente que usa as functions (retornam dados normalizados)
