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

                  <!-- Grid de Setores -->
                  <div
                    class="row g-3 mt-3"
                    v-if="setoresFiltradas && setoresFiltradas.length > 0"
                  >
                    <div
                      v-for="setor in setoresFiltradas"
                      :key="setor.id"
                      class="col-12 col-sm-6 col-md-4 col-lg-3"
                    >
                      <div
                        class="card setor-card position-relative"
                        @click="$router.push(`/setor/${setor.id}?tab=overview`)"
                      >
                        <!-- Status dot (top-left) -->
                        <span
                          class="status-dot"
                          :class="
                            setor.status === 'A' ? 'bg-success' : 'bg-secondary'
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
                                  @click.prevent.stop="editarSetor(setor)"
                                >
                                  <i class="mdi mdi-pencil me-2"></i>Editar
                                </a>
                              </li>
                              <li>
                                <a
                                  class="dropdown-item text-danger"
                                  href="#"
                                  @click.prevent.stop="confirmarExclusao(setor)"
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
                          <!-- código_setor removido (campo excluído no backend) -->

                          <!-- Nome -->
                          <h5 class="card-title mb-3">{{ setor.nome }}</h5>

                          <!-- Infos -->
                          <div class="d-flex flex-column gap-2">
                            <!-- Polo badge: usa objeto `polo` quando disponível, senão busca por `polo_id` -->
                            <span
                              v-if="
                                (setor.polo && setor.polo.nome) || setor.polo_id
                              "
                              class="badge bg-secondary"
                            >
                              {{
                                setor.polo && setor.polo.nome
                                  ? setor.polo.nome
                                  : (
                                      polosList.find(
                                        (p) => p.id == setor.polo_id
                                      ) || {}
                                    ).nome
                              }}
                            </span>
                            <!-- textual status removed; using status dot in top-left -->

                            <!-- Tipo -->
                            <span
                              class="badge"
                              :class="
                                setor.tipo === 'Medicamento'
                                  ? 'bg-info'
                                  : 'bg-primary'
                              "
                            >
                              {{ setor.tipo }}
                            </span>

                            <!-- Controle de estoque -->
                            <span
                              class="badge"
                              :class="
                                setor.estoque
                                  ? 'bg-warning'
                                  : 'bg-light text-dark'
                              "
                            >
                              {{
                                setor.estoque
                                  ? "Controla Estoque"
                                  : "Sem Controle"
                              }}
                            </span>
                          </div>

                          <!-- Descrição -->
                          <div class="mt-2" v-if="setor.descricao">
                            <small class="text-muted">{{
                              setor.descricao
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
                      <h5>Nenhum setor encontrado</h5>
                      <p class="text-muted">
                        Crie seu primeiro setor clicando no botão "Novo Setor"
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

            <ModalSetor
              idModal="addUPSetor"
              :functions="functions"
            ></ModalSetor>
          </div>
        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script>
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalSetor from "@/components/cadastros/ModalSetor.vue";

import functions from "../../functions/cad_setores.js";

export default {
  name: "SetoresView",
  components: {
    LinkModal01,
    TemplateAdmin,
    ModalSetor,
  },
  data() {
    return {
      functions: functions,
      titleModal: "Cadastro de Setores",
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
      setores: [],
    };
  },
  computed: {
    polosList() {
      const storePolos = this.$store.state.listPolos || {};
      return Array.isArray(storePolos.data) ? storePolos.data : [];
    },
    setoresFiltradas() {
      // Buscar lista centralizada no Vuex (pode ser paginada em .data)
      const storeList = this.$store.state.listSetoresGerais || {};
      const arr = Array.isArray(storeList.data) ? storeList.data : [];

      return arr.filter((setor) => {
        const statusMatch =
          !this.filtroStatus || setor.status === this.filtroStatus;
        const tipoMatch = !this.filtroTipo || setor.tipo === this.filtroTipo;
        const estoqueMatch =
          !this.filtroEstoque ||
          (this.filtroEstoque === "true") === setor.estoque;
        const poloMatch =
          !this.filtroPolo ||
          (setor.polo && setor.polo.id == this.filtroPolo) ||
          (setor.polo_id && setor.polo_id == this.filtroPolo);

        return statusMatch && tipoMatch && estoqueMatch && poloMatch;
      });
    },
  },
  methods: {
    carregarSetores() {
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

    editarSetor(setor) {
      this.$store.commit("SET_MODAL_DATA", {
        modalTitle: "Editar Setor",
        modalData: { ...setor },
        modalFunction: "UP",
      });

      // Abrir modal
      const modal = new bootstrap.Modal(document.getElementById("addUPSetor"));
      modal.show();
    },

    async confirmarExclusao(setor) {
      if (confirm(`Tem certeza que deseja excluir o setor "${setor.nome}"?`)) {
        try {
          const result = await functions.deleteSetor(this, setor.id);
          if (result && result.success) {
            this.$toastr.success("Setor excluído com sucesso!");
            // Garantir atualização da lista
            this.carregarSetores();
          } else {
            this.$toastr.error(result.message || "Erro ao excluir setor");
            if (result && result.references) console.log(result.references);
          }
        } catch (error) {
          console.error("Erro ao excluir setor:", error);
          this.$toastr.error("Erro ao excluir setor");
        }
      }
    },
  },
  // created() override removed: avoid infinite recursion by not replacing functions.listAll
  mounted() {
    this.carregarSetores();
  },
};
</script>

<style scoped>
.setor-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.setor-card:hover {
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
