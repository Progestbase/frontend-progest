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
                    :idModalInsertUP="'#addFornecedores'"
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
                      <p class="mt-2">Carregando fornecedores...</p>
                    </div>

                    <TBLBASE01
                      v-else-if="
                        formattedFornecedores &&
                        formattedFornecedores.length > 0
                      "
                      :list="formattedFornecedores"
                      :titles="['#', 'CPF/CNPJ', 'Razão Social', 'Status']"
                      :align="[
                        'text-center',
                        'text-left',
                        'text-left',
                        'text-left',
                      ]"
                      :indexLink="1"
                      :idModalUP="'#addFornecedores'"
                      :functions="functions"
                      classColTable="12"
                    />

                    <!-- Mensagem quando não há fornecedores -->
                    <div
                      v-else-if="!$store.state.isSearching"
                      class="text-center mt-5"
                    >
                      <div class="d-flex flex-column align-items-center">
                        <i class="mdi mdi-store display-4 text-muted mb-3"></i>
                        <h5>Nenhum fornecedor encontrado</h5>
                        <p class="text-muted">
                          Crie seu primeiro fornecedor clicando no botão "NOVO"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ModalFornecedores
            idModal="addFornecedores"
            :functions="functions"
          ></ModalFornecedores>
        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script>
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import TBLBASE01 from "@/components/layouts/TableBase01.vue";

import functions from "../../functions/cad_fornecedores.js";
import ModalFornecedores from "../../components/cadastros/ModalFornecedores.vue";

export default {
  name: "FornecedoresView",
  components: {
    LinkModal01,
    TemplateAdmin,
    ModalFornecedores,
    TBLBASE01,
  },
  data() {
    return {
      functions: functions,
      titleModal: "Cadastro de Fornecedor",
      varsModalData: {
        status: "A",
        // codigo removido conforme solicitação
        cnpj: "",
        razao_social_nome: "",
        tipo_pessoa: "J",
      },
    };
  },
  methods: {
    openCreateFornecedorModal() {
      // prepara modal para ADD
      this.$store.commit("setModalFunction", "ADD");
      this.$store.commit("setModalData", this.varsModalData);
    },
    closeCreateFornecedorModal() {
      // apenas fecha modal via bootstrap (o componente ModalBase lida com isso)
    },
    createFornecedor(fornecedorData) {
      console.log("Fornecedor criado:", fornecedorData);
      alert("Fornecedor cadastrado com sucesso!");
      this.closeCreateFornecedorModal();
    },
    listAllFornecedores() {
      functions.listAll(this);
    },
  },
  computed: {
    listFornecedores() {
      const lf = this.$store.state.listFornecedores;
      if (!lf) return [];
      if (Array.isArray(lf)) return lf;
      if (lf.data && Array.isArray(lf.data)) return lf.data;
      return [];
    },
    formattedFornecedores() {
      return this.listFornecedores.map((f) => ({
        id: f.id,
        // campo 'codigo' removido do frontend para Fornecedores
        cnpj: f.cnpj || f.cpf || "",
        razao_social: f.razao_social_nome || f.razao_social || f.nome || "",
        status: f.statusFormatted || (f.status === "A" ? "Ativo" : "Inativo"),
      }));
    },
  },
  created() {
    this.listAllFornecedores();
  },
  mounted() {
    this.listAllFornecedores();
  },
};
</script>

<style scoped>
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
