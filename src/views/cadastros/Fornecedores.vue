<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <button class="btn btn-success">
                    <LinkModal01
                      :idModalInsertUP="'#addFornecedores'"
                      :label="'NOVO'"
                      :titleModal="titleModal"
                      :varsModalData="varsModalData"
                    >
                    </LinkModal01>
                  </button>

                  <div class="mt-5">
                    <TBLBASE01
                      v-if="
                        listFornecedores &&
                        listFornecedores.data &&
                        listFornecedores.data.length > 0
                      "
                      :list="listFornecedores"
                      :titles="[
                        '#',
                        'Código',
                        'CNPJ',
                        'Razão Social',
                        'Status',
                      ]"
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
      isCreateFornecedorModalOpen: false,
      fornecedor_data: null,
      functions: functions,
      choice_filters: null,
      titleModal: "Cadastro de Fornecedor",
      varsModalData: {
        status: "A",
        codigo: "",
        cnpj: "",
        razao_social: "",
      },
    };
  },
  methods: {
    openCreateFornecedorModal() {
      this.isCreateFornecedorModalOpen = true;
    },
    closeCreateFornecedorModal() {
      this.isCreateFornecedorModalOpen = false;
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
      // Retorna o objeto original, pois TBLBASE01 espera array de objetos
      return this.$store.state.listFornecedores;
    },
  },
  created() {},
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
