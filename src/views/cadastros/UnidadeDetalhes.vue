<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <!-- Loading -->
              <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Carregando...</span>
                </div>
              </div>

              <!-- Conteúdo -->
              <div v-else-if="unidade.id" class="card">
                <div class="card-body">
                  <!-- Tabs Navigation -->
                  <ul
                    class="nav nav-tabs nav-tabs-custom nav-justified"
                    role="tablist"
                  >
                    <li class="nav-item">
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'overview' }"
                        @click="changeTab('overview')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="fas fa-info-circle"></i
                        ></span>
                        <span class="d-none d-sm-block">Overview</span>
                      </a>
                    </li>
                    <li class="nav-item">
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'setores' }"
                        @click="changeTab('setores')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="fas fa-building"></i
                        ></span>
                        <span class="d-none d-sm-block">Setores</span>
                      </a>
                    </li>
                    <li class="nav-item">
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'estoque' }"
                        @click="changeTab('estoque')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="fas fa-boxes"></i
                        ></span>
                        <span class="d-none d-sm-block">Estoque</span>
                      </a>
                    </li>
                  </ul>

                  <!-- Tab Content -->
                  <div class="tab-content p-3 text-muted">
                    <!-- Overview Tab -->
                    <div v-show="activeTab === 'overview'">
                      <div class="row">
                        <div class="col-md-8">
                          <div class="card border">
                            <div class="card-header">
                              <h5 class="card-title mb-0">
                                <i class="mdi mdi-information-outline me-2"></i>
                                Informações da Unidade
                              </h5>
                            </div>
                            <div class="card-body">
                              <div class="row">
                                <div class="col-md-6">
                                  <div class="mb-3">
                                    <label class="form-label">Nome:</label>
                                    <p class="form-control-plaintext">
                                      {{ unidade.nome }}
                                    </p>
                                  </div>
                                </div>
                                <div class="col-md-6">
                                  <div class="mb-3">
                                    <label class="form-label">Código:</label>
                                    <p class="form-control-plaintext">
                                      {{ unidade.codigo_unidade }}
                                    </p>
                                  </div>
                                </div>
                                <div class="col-md-6">
                                  <div class="mb-3">
                                    <label class="form-label">Tipo:</label>
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
                                  </div>
                                </div>
                                <div class="col-md-6">
                                  <div class="mb-3">
                                    <label class="form-label">Status:</label>
                                    <span
                                      class="badge"
                                      :class="
                                        unidade.status === 'A'
                                          ? 'bg-success'
                                          : 'bg-secondary'
                                      "
                                    >
                                      {{
                                        unidade.status === "A"
                                          ? "Ativo"
                                          : "Inativo"
                                      }}
                                    </span>
                                  </div>
                                </div>
                                <div class="col-md-6">
                                  <div class="mb-3">
                                    <label class="form-label"
                                      >Controla Estoque:</label
                                    >
                                    <span
                                      class="badge"
                                      :class="
                                        unidade.estoque
                                          ? 'bg-warning'
                                          : 'bg-light text-dark'
                                      "
                                    >
                                      {{ unidade.estoque ? "Sim" : "Não" }}
                                    </span>
                                  </div>
                                </div>
                                <div class="col-12" v-if="unidade.descricao">
                                  <div class="mb-3">
                                    <label class="form-label">Descrição:</label>
                                    <p class="form-control-plaintext">
                                      {{ unidade.descricao }}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-4">
                          <div class="card border">
                            <div class="card-header">
                              <h5 class="card-title mb-0">
                                <i class="mdi mdi-cog-outline me-2"></i>
                                Ações
                              </h5>
                            </div>
                            <div class="card-body">
                              <div class="d-grid gap-2">
                                <button
                                  class="btn btn-primary"
                                  @click="editarUnidade"
                                >
                                  <i class="mdi mdi-pencil me-2"></i>
                                  Editar Unidade
                                </button>
                                <button
                                  class="btn btn-danger"
                                  @click="confirmarExclusao"
                                >
                                  <i class="mdi mdi-delete me-2"></i>
                                  Excluir Unidade
                                </button>
                              </div>
                            </div>
                          </div>

                          <!-- Informações adicionais -->
                          <div class="card border mt-3">
                            <div class="card-header">
                              <h5 class="card-title mb-0">
                                <i class="mdi mdi-calendar-outline me-2"></i>
                                Datas
                              </h5>
                            </div>
                            <div class="card-body">
                              <div class="mb-2">
                                <small class="text-muted">Criado em:</small>
                                <p class="mb-1">
                                  {{ formatarData(unidade.created_at) }}
                                </p>
                              </div>
                              <div class="mb-0">
                                <small class="text-muted">Atualizado em:</small>
                                <p class="mb-0">
                                  {{ formatarData(unidade.updated_at) }}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Setores Tab -->
                    <div v-show="activeTab === 'setores'">
                      <div class="text-center py-5">
                        <i class="mdi mdi-wrench display-4 text-muted mb-3"></i>
                        <h5>Setores da Unidade</h5>
                        <p class="text-muted">
                          Esta funcionalidade será implementada em breve.
                        </p>
                      </div>
                    </div>

                    <!-- Estoque Tab -->
                    <div v-show="activeTab === 'estoque'">
                      <div class="text-center py-5">
                        <i class="mdi mdi-wrench display-4 text-muted mb-3"></i>
                        <h5>Estoque da Unidade</h5>
                        <p class="text-muted">
                          Esta funcionalidade será implementada em breve.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Erro -->
              <div v-else class="text-center py-5">
                <i
                  class="mdi mdi-alert-circle-outline display-4 text-danger mb-3"
                ></i>
                <h5>Unidade não encontrada</h5>
                <p class="text-muted">
                  A unidade solicitada não foi encontrada.
                </p>
                <router-link to="/unidades" class="btn btn-primary">
                  <i class="mdi mdi-arrow-left me-2"></i>
                  Voltar para Unidades
                </router-link>
              </div>
            </div>
          </div>

          <!-- Modal de Edição -->
          <ModalUnidades
            idModal="editUnidade"
            :functions="functions"
          ></ModalUnidades>
        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script>
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalUnidades from "@/components/cadastros/ModalUnidades.vue";
import functions from "../../functions/cad_unidades.js";
import * as bootstrap from "bootstrap";

export default {
  name: "UnidadeDetalhes",
  components: {
    TemplateAdmin,
    ModalUnidades,
  },
  props: ["id"],
  data() {
    return {
      unidade: {},
      loading: false,
      activeTab: "overview",
      functions: functions,
    };
  },
  watch: {
    "$route.query.tab": {
      handler(newTab) {
        if (newTab && ["overview", "setores", "estoque"].includes(newTab)) {
          this.activeTab = newTab;
        } else {
          this.activeTab = "overview";
        }
      },
      immediate: true,
    },
  },
  methods: {
    async carregarUnidade() {
      this.loading = true;
      try {
        const result = await functions.buscarUnidadePorId(this.id);
        if (result.success) {
          this.unidade = result.data;
          // Atualizar no store para o header
          this.$store.commit("setUnidadeAtual", result.data);
        } else {
          this.showNotification(
            result.message || "Erro ao carregar unidade",
            "error"
          );
        }
      } catch (error) {
        console.error("Erro ao carregar unidade:", error);
        this.showNotification("Erro ao carregar unidade", "error");
      } finally {
        this.loading = false;
      }
    },

    changeTab(tab) {
      this.activeTab = tab;
      this.$router.push({
        path: `/unidade/${this.id}`,
        query: { tab },
      });
    },

    editarUnidade() {
      console.log("=== EDITANDO UNIDADE ===");
      console.log("Dados da unidade:", this.unidade);

      this.$store.commit("SET_MODAL_DATA", {
        modalTitle: "Editar Unidade",
        modalData: { ...this.unidade },
        modalFunction: "UP",
      });

      console.log("Dados salvos no store:", this.$store.state.modalData);

      const modalElement = document.getElementById("editUnidade");
      console.log("Elemento modal encontrado:", modalElement);

      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        console.log("Modal criado:", modal);
        modal.show();
      } else {
        console.error("Modal editUnidade não encontrado!");
      }
    },

    confirmarExclusao() {
      if (
        confirm(
          `Tem certeza que deseja excluir a unidade "${this.unidade.nome}"?`
        )
      ) {
        // Usar a nova função que segue o padrão do sistema
        functions.deleteUnidade(this, this.unidade.id);
      }
    },

    formatarData(dataString) {
      if (!dataString) return "-";
      const data = new Date(dataString);
      return (
        data.toLocaleDateString("pt-BR") +
        " às " +
        data.toLocaleTimeString("pt-BR")
      );
    },

    showNotification(message, type) {
      if (this.$toastr) {
        if (type === "success") {
          this.$toastr.success(message);
        } else {
          this.$toastr.error(message);
        }
      } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message);
      }
    },
  },
  created() {
    // Configurar função personalizada para o modal
    this.functions.ADD_UP = async (content, modalFunction) => {
      try {
        const result = await functions.atualizarUnidade(content.modalData);

        if (result.success) {
          this.showNotification("Unidade atualizada com sucesso!", "success");

          // Fechar modal
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("editUnidade")
          );
          modal.hide();

          // Recarregar dados da unidade
          this.carregarUnidade();
        } else {
          if (result.errors) {
            return result;
          } else {
            this.showNotification(
              result.message || "Erro ao atualizar unidade",
              "error"
            );
          }
        }
      } catch (error) {
        console.error("Erro ao atualizar unidade:", error);
        this.showNotification("Erro ao atualizar unidade", "error");
      }
    };
  },
  mounted() {
    this.carregarUnidade();
  },
};
</script>

<style scoped>
.nav-tabs-custom .nav-link {
  position: relative;
  border: none;
  border-bottom: 2px solid transparent;
}

.nav-tabs-custom .nav-link.active {
  background-color: transparent;
  border-bottom-color: #007bff;
  color: #007bff;
}

.form-control-plaintext {
  padding-left: 0;
  font-weight: 500;
}

.card-title {
  font-size: 1.1rem;
}

.badge {
  font-size: 0.8rem;
}
</style>
