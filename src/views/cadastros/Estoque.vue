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
                        :idModalInsertUP="'#addEstoque'"
                        :label="'NOVO'"
                        :titleModal="titleModal"
                        :varsModalData="varsModalData"
                      >
                      </LinkModal01>
                    </button>
  
                    <div class="mt-5">
                      <TBLBASE01
                        v-if="
                          listEstoque &&
                          listEstoque.data &&
                          listEstoque.data.length > 0
                        "
                        :list="listEstoque"
                        :titles="[
                          '#',
                          'Código',
                          'Nome',
                          'Descrição',
                          'Quantidade',
                          'Unidade de Medida',
                          'Status',
                        ]"
                        :align="[
                          'text-center',
                          'text-left',
                          'text-left',
                          'text-left',
                          'text-left',
                          'text-left',
                        ]"
                        :indexLink="1"
                        :idModalUP="'#addEstoque'"
                        :functions="functions"
                        classColTable="12"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <ModalEstoque
              idModal="addEstoque"
              :functions="functions"
            ></ModalEstoque>
          </div>
        </div>
      </div>
    </TemplateAdmin>
  </template>
    
  <script>
  import LinkModal01 from "@/components/layouts/LinkModal01.vue";
  import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
  import TBLBASE01 from "@/components/layouts/TableBase01.vue";
  
  import functions from "../../functions/cad_estoque.js";
  import ModalEstoque from "../../components/cadastros/ModalEstoque.vue";
  
  export default {
    name: "EstoqueView",
    components: {
      LinkModal01,
      TemplateAdmin,
      ModalEstoque,
      TBLBASE01,
    },
    data() {
      return {
        isCreateEstoqueModalOpen: false,
        estoque_data: null,
        functions: functions,
        choice_filters: null,
        titleModal: "Cadastro de Estoque",
        varsModalData: {
          status: "A",
          codigo: "",
          nome: "",
          descricao: "",
          quantidade: "",
          unidade_medida: "",
          fornecedor: "",
          status: "",
        },
      };
    },
    methods: {
      openCreateEstoqueModal() {
        this.isCreateEstoqueModalOpen = true;
      },
      closeCreateEstoqueModal() {
        this.isCreateEstoqueModalOpen = false;
      },
      createEstoque(estoqueData) {
        console.log("Estoque criado:", estoqueData);
        alert("Estoque cadastrado com sucesso!");
        this.closeCreateEstoqueModal();
      },
      listAllEstoque() {
        functions.listAll(this);
      },
    },
    computed: {
      listEstoque() {
        // Retorna o objeto original, pois TBLBASE01 espera array de objetos
        return this.$store.state.listEstoque;
      },
    },
    created() {},
    mounted() {
      this.listAllEstoque();
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
  