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
                    :idModalInsertUP="'#addUPPolo'"
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
                      <p class="mt-2">Carregando polos...</p>
                    </div>

                    <!-- Tabela com dados -->
                    <TBLBASE01
                      v-else-if="listPolos && listPolos.length > 0"
                      :list="formattedPolos"
                      :titles="['#', 'Nome', 'Status']"
                      :align="['text-center', 'text-left', 'text-center']"
                      :indexLink="1"
                      :idModalUP="'#addUPPolo'"
                      :functions="functions"
                      classColTable="12"
                      deleteRoute="/polo/delete"
                    />

                    <!-- Mensagem quando não há polos -->
                    <div
                      v-else-if="!$store.state.isSearching"
                      class="text-center mt-5"
                    >
                      <div class="d-flex flex-column align-items-center">
                        <i
                          class="mdi mdi-map-marker-multiple display-4 text-muted mb-3"
                        ></i>
                        <h5>Nenhum polo encontrado</h5>
                        <p class="text-muted">
                          Crie seu primeiro polo clicando no botão "NOVO"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ModalPolos idModal="addUPPolo" :functions="functions"></ModalPolos>
          </div>
        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script>
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalPolos from "@/components/cadastros/ModalPolos.vue";
import TBLBASE01 from "@/components/layouts/TableBase01.vue";

import functions from "../../functions/cad_polos.js";

export default {
  name: "PolosView",
  components: {
    LinkModal01,
    TemplateAdmin,
    ModalPolos,
    TBLBASE01,
  },
  data() {
    return {
      functions: functions,
      titleModal: "Polos",
      varsModalData: {
        status: "A",
        nome: "",
      },
    };
  },
  methods: {
    listAll() {
      functions.listAll(this);
    },
  },
  computed: {
    listPolos() {
      return this.$store.state.listPolos?.data || [];
    },
    formattedPolos() {
      if (!this.listPolos || this.listPolos.length === 0) return [];

      return this.listPolos.map((polo) => ({
        id: polo.id,
        nome: polo.nome,
        status: polo.status === "A" ? "Ativo" : "Inativo",
      }));
    },
  },
  mounted() {
    this.listAll();
  },
};
</script>

<style scoped>
/* Estilos consistentes com outras páginas do sistema */
</style>
