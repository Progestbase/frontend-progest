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
                    :idModalInsertUP="'#addUPUnidade '"
                    :label="'NOVO'"
                    :titleModal="titleModal"
                    :varsModalData="varsModalData"
                  >
                  </LinkModal01>

                  <!-- Filtros -->
                  <div class="row mt-4">
                    <div class="col-md-3">
                      <select
                        class="form-select"
                        v-model="filtroStatus"
                        @change="aplicarFiltros"
                      >
                        <option value="">Todos os Status</option>
                        <option value="A">Ativo</option>
                        <option value="I">Inativo</option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <select
                        class="form-select"
                        v-model="filtroTipo"
                        @change="aplicarFiltros"
                      >
                        <option value="">Todos os Tipos</option>
                        <option value="Material">Material</option>
                        <option value="Medicamento">Medicamento</option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <select
                        class="form-select"
                        v-model="filtroEstoque"
                        @change="aplicarFiltros"
                      >
                        <option value="">Controle de Estoque</option>
                        <option value="true">Com Controle</option>
                        <option value="false">Sem Controle</option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <select
                        class="form-select"
                        v-model="filtroPolo"
                        @change="aplicarFiltros"
                      >
                        <option value="">Todos os Polos</option>
                        <option
                          v-for="p in polosList"
                          :key="p.id"
                          :value="p.id"
                        >
                          {{ p.nome }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Grid de Unidades -->
                  <div
                    class="row g-3 mt-3"
                    v-if="unidadesFiltradas && unidadesFiltradas.length > 0"
                  >
                    <div
                      v-for="unidade in unidadesFiltradas"
                      :key="unidade.id"
                      class="col-12 col-sm-6 col-md-4 col-lg-3"
                    >
                      <div
                        class="card unidade-card position-relative"
                        @click="
                          $router.push(`/unidade/${unidade.id}?tab=overview`)
                        "
                      >
                        <!-- Status dot (top-left) -->
                        <span
                          class="status-dot"
                          :class="
                            unidade.status === 'A'
                              ? 'bg-success'
                              : 'bg-secondary'
                          "
                        ></span>
                        <!-- Menu de ações -->
                        <div class="position-absolute top-0 end-0 p-2">
                          <div class="dropdown">
                            <button
                              class="btn btn-link btn-sm text-muted"
                              type="button"
                              data-bs-toggle="dropdown"
                              @click.stop
                            >
                              <i class="mdi mdi-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu">
                              <li>
                                <a
                                  class="dropdown-item"
                                  href="#"
                                  @click.prevent.stop="editarUnidade(unidade)"
                                >
                                  <i class="mdi mdi-pencil me-2"></i>Editar
                                </a>
                              </li>
                              <li>
                                <a
                                  class="dropdown-item text-danger"
                                  href="#"
                                  @click.prevent.stop="
                                    confirmarExclusao(unidade)
                                  "
                                >
                                  <i class="mdi mdi-delete me-2"></i>Excluir
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div
                          class="card-body text-center d-flex flex-column align-items-center justify-content-center"
                        >
                          <!-- código_unidade removido (campo excluído no backend) -->

                          <!-- Nome -->
                          <h5 class="card-title mb-3">{{ unidade.nome }}</h5>

                          <!-- Infos -->
                          <div class="d-flex flex-column gap-2">
                            <!-- Polo badge: usa objeto `polo` quando disponível, senão busca por `polo_id` -->
                            <span
                              v-if="
                                (unidade.polo && unidade.polo.nome) ||
                                unidade.polo_id
                              "
                              class="badge bg-secondary"
                            >
                              {{
                                unidade.polo && unidade.polo.nome
                                  ? unidade.polo.nome
                                  : (
                                      polosList.find(
                                        (p) => p.id == unidade.polo_id
                                      ) || {}
                                    ).nome
                              }}
                            </span>
                            <!-- textual status removed; using status dot in top-left -->

                            <!-- Tipo -->
                            <span
                              class="badge"
                              :class="
                                unidade.tipo === 'Medicamento'
                                  ? 'bg-info'
                                  : 'bg-primary'
                              "
                            >
                              {{ unidade.tipo }}
                            </span>

                            <!-- Controle de estoque -->
                            <span
                              class="badge"
                              :class="
                                unidade.estoque
                                  ? 'bg-warning'
                                  : 'bg-light text-dark'
                              "
                            >
                              {{
                                unidade.estoque
                                  ? "Controla Estoque"
                                  : "Sem Controle"
                              }}
                            </span>
                          </div>

                          <!-- Descrição -->
                          <div class="mt-2" v-if="unidade.descricao">
                            <small class="text-muted">{{
                              unidade.descricao
                            }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Mensagem quando não há unidades -->
                  <div v-else-if="!loading" class="text-center mt-5">
                    <div class="d-flex flex-column align-items-center">
                      <i
                        class="mdi mdi-office-building-outline display-4 text-muted mb-3"
                      ></i>
                      <h5>Nenhuma unidade encontrada</h5>
                      <p class="text-muted">
                        Crie sua primeira unidade clicando no botão "Nova
                        Unidade"
                      </p>
                    </div>
                  </div>

                  <!-- Loading -->
                  <div v-if="loading" class="text-center mt-5">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Carregando...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ModalUnidades
              idModal="addUPUnidade"
              :functions="functions"
            ></ModalUnidades>
          </div>
        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script>
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalUnidades from "@/components/cadastros/ModalUnidades.vue";

import functions from "../../functions/cad_unidades.js";

export default {
  name: "UnidadesView",
  components: {
    LinkModal01,
    TemplateAdmin,
    ModalUnidades,
  },
  data() {
    return {
      functions: functions,
      titleModal: "Cadastro de Unidades",
      varsModalData: {
        status: "A",
        nome: "",
        descricao: "",
        // deixar null para que os selects mostrem a opção placeholder
        estoque: null,
        tipo: null,
        polo_id: "",
      },
      loading: false,
      filtroPolo: "",
      filtroStatus: "",
      filtroTipo: "",
      filtroEstoque: "",
      unidades: [],
    };
  },
  computed: {
    polosList() {
      const storePolos = this.$store.state.listPolos || {};
      return Array.isArray(storePolos.data) ? storePolos.data : [];
    },
    unidadesFiltradas() {
      // Buscar lista centralizada no Vuex (pode ser paginada em .data)
      const storeList = this.$store.state.listUnidadesGerais || {};
      const arr = Array.isArray(storeList.data) ? storeList.data : [];

      return arr.filter((unidade) => {
        const statusMatch =
          !this.filtroStatus || unidade.status === this.filtroStatus;
        const tipoMatch = !this.filtroTipo || unidade.tipo === this.filtroTipo;
        const estoqueMatch =
          !this.filtroEstoque ||
          (this.filtroEstoque === "true") === unidade.estoque;
        const poloMatch =
          !this.filtroPolo ||
          (unidade.polo && unidade.polo.id == this.filtroPolo) ||
          (unidade.polo_id && unidade.polo_id == this.filtroPolo);

        return statusMatch && tipoMatch && estoqueMatch && poloMatch;
      });
    },
  },
  methods: {
    carregarUnidades() {
      console.log("=== carregarUnidades iniciado ===");
      this.loading = true;
      // Delegar para a função compartilhada que popula o Vuex
      try {
        this.functions.listAll(this);
      } catch (e) {
        console.error("Erro ao chamar functions.listAll:", e);
      }

      // O loading é controlado por isSearching no store; aqui apenas limpamos
      this.loading = false;
    },

    showNotification(message, type = "success") {
      if (this.$toastr) {
        if (type === "success") {
          this.$toastr.success(message);
        } else {
          this.$toastr.error(message);
        }
      } else {
        alert(message);
      }
    },

    aplicarFiltros() {
      // Os filtros são aplicados automaticamente via computed property
    },

    editarUnidade(unidade) {
      this.$store.commit("SET_MODAL_DATA", {
        modalTitle: "Editar Unidade",
        modalData: { ...unidade },
        modalFunction: "UP",
      });

      // Abrir modal
      const modal = new bootstrap.Modal(
        document.getElementById("addUPUnidade")
      );
      modal.show();
    },

    async confirmarExclusao(unidade) {
      if (
        confirm(`Tem certeza que deseja excluir a unidade "${unidade.nome}"?`)
      ) {
        try {
          const result = await functions.deleteUnidade(this, unidade.id);
          if (result && result.success) {
            this.$toastr.success("Unidade excluída com sucesso!");
            // Garantir atualização da lista
            this.carregarUnidades();
          } else {
            this.$toastr.error(result.message || "Erro ao excluir unidade");
            if (result && result.references) console.log(result.references);
          }
        } catch (error) {
          console.error("Erro ao excluir unidade:", error);
          this.$toastr.error("Erro ao excluir unidade");
        }
      }
    },
  },
  // created() override removed: avoid infinite recursion by not replacing functions.listAll
  mounted() {
    this.carregarUnidades();
  },
};
</script>

<style scoped>
.unidade-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unidade-card:hover {
  transform: scale(1.03);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.badge {
  font-size: 0.75rem;
}

.dropdown-toggle::after {
  display: none;
}

/* Status dot on unit card */
.status-dot {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white; /* separação do card */
  z-index: 10;
}
</style>
