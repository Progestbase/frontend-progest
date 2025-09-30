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
                    :idModalInsertUP="'#addUPProduto'"
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
                      <p class="mt-2">Carregando produtos...</p>
                    </div>

                    <!-- Tabela com dados -->
                    <TBLBASE01
                      v-else-if="listProdutos && listProdutos.length > 0"
                      :list="formattedProdutos"
                      :titles="[
                        '#',
                        'Nome',
                        'Marca',
                        'Grupo',
                        'Unidade',
                        'Status',
                      ]"
                      :align="[
                        'text-center',
                        'text-left',
                        'text-left',
                        'text-left',
                        'text-center',
                        'text-center',
                      ]"
                      :indexLink="1"
                      :idModalUP="'#addUPProduto'"
                      :functions="functions"
                      classColTable="12"
                    />

                    <!-- Mensagem quando não há produtos -->
                    <div
                      v-else-if="!$store.state.isSearching"
                      class="text-center mt-5"
                    >
                      <div class="d-flex flex-column align-items-center">
                        <i
                          class="mdi mdi-package-variant display-4 text-muted mb-3"
                        ></i>
                        <h5>Nenhum produto encontrado</h5>
                        <p class="text-muted">
                          Crie seu primeiro produto clicando no botão "NOVO"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ModalProdutos
              idModal="addUPProduto"
              :functions="functions"
            ></ModalProdutos>
          </div>
        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script>
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalProdutos from "@/components/cadastros/ModalProdutos.vue";
import TBLBASE01 from "@/components/layouts/TableBase01.vue";

import functions from "../../functions/cad_produtos.js";

export default {
  name: "ProdutosView",
  components: {
    LinkModal01,
    TemplateAdmin,
    ModalProdutos,
    TBLBASE01,
  },
  data() {
    return {
      isCreateModalProdutoOpen: false,
      produto_data: null,
      functions: functions,
      choice_filters: null,
      titleModal: "Cadastro de Produtos",
      varsModalData: {
        status: "A",
        nome: "",
        marca: "",
        codigo_simpras: "",
        codigo_barras: "",
        grupo_produto_id: "",
        unidade_medida_id: "",
      },
    };
  },
  methods: {
    openCreateProdutoModal() {
      this.isCreateProdutoModalOpen = true;
    },
    listAllProdutos() {
      functions.listAll(this);
    },
    carregarDadosAuxiliares() {
      // Garantir que dados auxiliares estejam carregados para uso no modal
      const gruposExistentes =
        this.$store.state.listGrupoProdutos?.data ||
        this.$store.state.listGrupoProdutos ||
        [];
      const unidadesExistentes =
        this.$store.state.listUnidadesMedida?.data ||
        this.$store.state.listUnidadesMedida ||
        [];

      // Se não existirem dados no store, carregar
      if (gruposExistentes.length === 0) {
        this.carregarGruposProdutos();
      }

      if (unidadesExistentes.length === 0) {
        this.carregarUnidadesMedida();
      }
    },
    carregarGruposProdutos() {
      this.$axios
        .post(
          "/grupoProduto/list",
          {
            filters: [{}],
            per_page: 100,
          },
          {
            headers: {
              Authorization: "Bearer " + this.$store.getters.getUserToken,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.data && response.data.status && response.data.data) {
            const grupos = response.data.data.data || response.data.data;
            this.$store.commit("setListGrupoProdutos", response.data.data);
          }
        })
        .catch((error) => {
          console.warn("Não foi possível carregar grupos de produtos:", error);
        });
    },
    carregarUnidadesMedida() {
      this.$axios
        .post(
          "/unidadeMedida/list",
          {
            filters: [{}],
            per_page: 100,
          },
          {
            headers: {
              Authorization: "Bearer " + this.$store.getters.getUserToken,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.data && response.data.status && response.data.data) {
            this.$store.commit("setListUnidadesMedida", response.data.data);
          }
        })
        .catch((error) => {
          console.warn("Não foi possível carregar unidades de medida:", error);
        });
    },
  },
  computed: {
    listProdutos() {
      return this.$store.state.listProdutos?.data || [];
    },
    formattedProdutos() {
      return this.listProdutos.map((produto) => ({
        id: produto.id,
        nome: produto.nome,
        marca: produto.marca || "N/A",
        grupo_produto: produto.grupo_produto?.nome || "N/A",
        unidade_medida:
          produto.unidade_medida?.sigla ||
          produto.unidade_medida?.nome ||
          "N/A",
        status: produto.status === "A" ? "Ativo" : "Inativo",
      }));
    },
  },
  created() {
    this.listAllProdutos();
    this.carregarDadosAuxiliares();
  },
  mounted() {
    this.listAllProdutos();
    this.carregarDadosAuxiliares();
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
