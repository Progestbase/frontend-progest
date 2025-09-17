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
                    :idModalInsertUP="'#addUPSetor '"
                    :label="'NOVO'"
                    :titleModal="titleModal"
                    :varsModalData="varsModalData"
                  >
                  </LinkModal01>
                  <div class="mt-5">
                    <TBLBASE01
                      v-if="listSetores"
                      :list="listSetores"
                      :titles="[
                        'Código',
                        'Nome',
                        'Descrição',
                        'Status',
                      ]"
                      :align="['text-center', 'text-left']"
                      :indexLink="1"
                      :idModalUP="'#addUPSetor'"
                      :functions="functions"
                      classColTable="12"
                      deleteRoute="/setores/delete"
                    />
                  </div>
                </div>
              </div>
            </div>

            <ModalSetores
              idModal="addUPSetor"
              :functions="functions"
            ></ModalSetores>
          </div>
        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script>
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalSetores from "@/components/cadastros/ModalSetores.vue";
import TBLBASE01 from "@/components/layouts/TableBase01.vue";

import functions from "../../functions/cad_setores.js";

export default {
  name: "SetoresView",
  components: {
    LinkModal01,
    TemplateAdmin,
    ModalSetores,
    TBLBASE01,
  },
  data() {
    return {
      isCreateModalSetorOpen: false,
      setor_data: null,
      functions: functions,
      choice_filters: null,
      titleModal: "Cadastro de Setores",
      varsModalData: {
        status: "A",
        nome: "",
        descricao: "",
      },
    };
  },
  methods: {
    openCreateSetorModal() {
      this.isCreateSetorModalOpen = true;
    },
    listAllSetores() {
      functions.listAll(this);
    },
  },
  computed: {
    listSetores() {
      return this.$store.state.listSetores;
    },
  },
  created() {},
  mounted() {
    this.listAllSetores();
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
