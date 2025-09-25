<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <LinkModal01
                    :idModalInsertUP="'#addUPUnidadesMedida'"
                    :label="'NOVO'"
                    :titleModal="titleModal"
                    :varsModalData="varsModalData"
                  >
                  </LinkModal01>
                  <div class="mt-5">
                    <!-- Loading -->
                    <div
                      v-if="$store.state.isSearching"
                      class="text-center mt-5"
                    >
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                      </div>
                      <p class="mt-2">Carregando unidades de medida...</p>
                    </div>

                    <!-- Tabela com dados -->
                    <TBLBASE01
                      v-else-if="
                        listUnidadesMedida && listUnidadesMedida.length > 0
                      "
                      :list="formattedUnidadesMedida"
                      :titles="['#', 'Nome', 'Qtd. Mín.', 'Status']"
                      :align="[
                        'text-center',
                        'text-left',
                        'text-center',
                        'text-center',
                      ]"
                      :indexLink="1"
                      :idModalUP="'#addUPUnidadesMedida'"
                      :functions="functions"
                      classColTable="12"
                      deleteRoute="/unidadeMedida/delete"
                    />

                    <!-- Mensagem quando não há unidades de medida -->
                    <div
                      v-else-if="!$store.state.isSearching"
                      class="text-center mt-5"
                    >
                      <div class="d-flex flex-column align-items-center">
                        <i class="mdi mdi-ruler display-4 text-muted mb-3"></i>
                        <h5>Nenhuma unidade de medida encontrada</h5>
                        <p class="text-muted">
                          Crie sua primeira unidade de medida clicando no botão
                          "NOVO"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ModalUnidadesMedida
              idModal="addUPUnidadesMedida"
              :functions="functions"
            ></ModalUnidadesMedida>
          </div>
        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script>
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalUnidadesMedida from "@/components/cadastros/ModalUnidadesMedida.vue";
import TBLBASE01 from "@/components/layouts/TableBase01.vue";

import functions from "../../functions/cad_unidades_medida.js";

export default {
  name: "UnidadesMedidaView",
  components: {
    LinkModal01,
    TemplateAdmin,
    ModalUnidadesMedida,
    TBLBASE01,
  },
  data() {
    return {
      functions: functions,
      titleModal: "Unidades de Medida",
      varsModalData: {
        status: "A",
        nome: "",
        quantidade_unidade_minima: 1,
      },
    };
  },
  methods: {
    openCreateUnidadesMedidaModal() {
      this.isCreateUnidadesMedidaModalOpen = true;
    },
    listAllUnidadesMedida() {
      functions.listAll(this);
    },
  },
  computed: {
    listUnidadesMedida() {
      return this.$store.state.listUnidadesMedida?.data || [];
    },
    formattedUnidadesMedida() {
      return this.listUnidadesMedida.map((unidade) => ({
        id: unidade.id,
        nome: unidade.nome,
        quantidade_unidade_minima: unidade.quantidade_unidade_minima,
        status: unidade.status === "A" ? "Ativo" : "Inativo",
      }));
    },
  },
  created() {
    this.listAllUnidadesMedida();
  },
  mounted() {
    this.listAllUnidadesMedida();
  },
};
</script>

<style>
.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4a4a4a;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.form-control {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  padding: 0.5rem;
}

.btn-primary {
  background-color: var(--dark);
  border-color: var(--dark);
  font-size: 1rem;
  font-weight: bold;
  border-radius: 0.25rem;
}
</style>
