<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>Estoque - {{ unidade.nome }}</h2>
            <div>
              <button class="btn btn-primary me-2">Solicitar Item</button>
              <button class="btn btn-success">Fazer Entrada</button>
            </div>
          </div>

          <!-- Tabela de Itens -->
          <TBLBASE01
            :list="{ data: itens }"
            :titles="['#', 'Produto', 'Quantidade', 'Lote', 'Val. Unitário', 'Data Fabricação', 'Data Vencimento']"
            :align="['text-center','text-left','text-center','text-center','text-center','text-center','text-center']"
            :indexLink="0"
          />
        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script>
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import TBLBASE01 from "@/components/layouts/TableBase01.vue";

export default {
  name: "EstoqueUnidade",
  components: { TemplateAdmin, TBLBASE01 },
  data() {
    return {
      unidade: { id: this.$route.params.id, nome: "Unidade A" },
      itens: [
        {
          id: 1,
          produto: "Arroz 5kg",
          quantidade: 100,
          lote: "L001",
          valor_unitario: "25,00",
          data_fabricacao: "2024-05-01",
          data_vencimento: "2025-05-01",
        },
        {
          id: 2,
          produto: "Feijão 1kg",
          quantidade: 50,
          lote: "L002",
          valor_unitario: "7,50",
          data_fabricacao: "2024-06-01",
          data_vencimento: "2025-06-01",
        },
      ],
    };
  },
};
</script>
