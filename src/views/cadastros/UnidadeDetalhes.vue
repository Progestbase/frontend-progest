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
                    <li class="nav-item" v-if="unidade.estoque">
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
                    <li class="nav-item">
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'movimentacoes' }"
                        @click="changeTab('movimentacoes')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="mdi mdi-swap-horizontal"></i
                        ></span>
                        <span class="d-none d-sm-block">Movimentações</span>
                      </a>
                    </li>
                    <li class="nav-item">
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'entrada' }"
                        @click="changeTab('entrada')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="mdi mdi-tray-arrow-down"></i
                        ></span>
                        <span class="d-none d-sm-block">Entrada</span>
                      </a>
                    </li>
                    <li class="nav-item">
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'usuarios' }"
                        @click="changeTab('usuarios')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="mdi mdi-account-multiple"></i
                        ></span>
                        <span class="d-none d-sm-block">Usuários</span>
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

                    <!-- Estoque Tab -->
                    <div v-show="activeTab === 'estoque'">
                      <EstoqueUnidade
                        v-if="unidade.id"
                        :unidadeId="unidade.id"
                        :key="unidade.id"
                      />
                    </div>

                    <!-- Movimentações Tab -->
                    <div v-show="activeTab === 'movimentacoes'">
                      <div
                        class="alert alert-warning d-flex align-items-center"
                        role="alert"
                      >
                        <i class="mdi mdi-progress-clock me-2"></i>
                        <span>Módulo de movimentações em desenvolvimento.</span>
                      </div>
                    </div>

                    <!-- Entrada Tab -->
                    <div v-show="activeTab === 'entrada'">
                      <div
                        class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3"
                      >
                        <div>
                          <h5 class="mb-1">
                            <i class="mdi mdi-tray-arrow-down me-2"></i>
                            Entradas de Estoque
                          </h5>
                          <p class="text-muted mb-0">
                            Registros de entradas já lançadas para esta unidade.
                          </p>
                        </div>
                        <button
                          class="btn btn-success"
                          @click="abrirModalEntrada"
                          :disabled="!unidade.id"
                        >
                          <i class="mdi mdi-plus me-2"></i>
                          Registrar Entrada
                        </button>
                      </div>

                      <div
                        v-if="entradasTabela.length > 0"
                        class="table-responsive"
                      >
                        <table class="table table-striped align-middle mb-0">
                          <thead>
                            <tr>
                              <th class="text-start">ID</th>
                              <th class="text-start">Lançada em</th>
                              <th class="text-start">Nota Fiscal</th>
                              <th class="text-center">Itens diferentes</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="entrada in entradasTabela"
                              :key="entrada.id"
                            >
                              <td class="text-start">{{ entrada.id }}</td>
                              <td class="text-start">{{ entrada.data }}</td>
                              <td class="text-start">
                                {{ entrada.notaFiscal }}
                              </td>
                              <td class="text-center">
                                {{ entrada.itensDiferentes }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div v-else class="text-center py-5">
                        <div class="d-flex flex-column align-items-center">
                          <i
                            class="mdi mdi-tray-arrow-down-outline display-4 text-muted mb-3"
                          ></i>
                          <h5>Nenhuma entrada registrada</h5>
                          <p class="text-muted mb-0">
                            Ainda não há registros de entrada para esta unidade.
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Usuários Tab -->
                    <div v-show="activeTab === 'usuarios'">
                      <div
                        class="alert alert-warning d-flex align-items-center"
                        role="alert"
                      >
                        <i class="mdi mdi-progress-clock me-2"></i>
                        <span
                          >Gestão de usuários da unidade em
                          desenvolvimento.</span
                        >
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
          <ModalEntradaEstoque
            idModal="modalRegistrarEntrada"
            :unidade="unidade"
            @registrado="handleEntradaRegistrada"
          />
        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script>
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalUnidades from "@/components/cadastros/ModalUnidades.vue";
import ModalEntradaEstoque from "@/components/cadastros/ModalEntradaEstoque.vue";
import EstoqueUnidade from "./EstoqueUnidade.vue";
import functions from "../../functions/cad_unidades.js";
import * as bootstrap from "bootstrap";

export default {
  name: "UnidadeDetalhes",
  components: {
    TemplateAdmin,
    ModalUnidades,
    ModalEntradaEstoque,
    EstoqueUnidade,
  },
  props: ["id"],
  data() {
    return {
      unidade: {},
      loading: false,
      activeTab: "overview",
      validTabs: [
        "overview",
        "estoque",
        "movimentacoes",
        "entrada",
        "usuarios",
      ],
      entradasMock: [
        {
          id: "ENT-0001",
          unidade_id: 1,
          created_at: "2025-10-02T10:30:00Z",
          nota_fiscal: "NF-2025/001",
          itens: [
            {
              produto_id: 101,
              produto_nome: "Dipirona 500mg",
              quantidade: 20,
            },
            {
              produto_id: 202,
              produto_nome: "Soro 0,9% 500ml",
              quantidade: 10,
            },
          ],
        },
        {
          id: "ENT-0002",
          unidade_id: 1,
          created_at: "2025-10-05T14:05:00Z",
          nota_fiscal: null,
          itens: [
            {
              produto_id: 303,
              produto_nome: "Luvas Cirúrgicas M",
              quantidade: 50,
            },
          ],
        },
      ],
      functions: functions,
    };
  },
  computed: {
    entradasTabela() {
      const unidadeId = this.unidade?.id;
      const entradas = unidadeId
        ? this.entradasMock.filter(
            (entrada) => entrada.unidade_id === unidadeId
          )
        : this.entradasMock;

      return entradas.map((entrada) => ({
        id: entrada.id,
        data: this.formatarData(entrada.created_at),
        notaFiscal: entrada.nota_fiscal || "-",
        itensDiferentes: this.contarItensDiferentes(entrada),
      }));
    },
  },
  watch: {
    "$route.query.tab": {
      handler(newTab) {
        if (newTab && this.validTabs.includes(newTab)) {
          if (newTab === "estoque" && !this.unidade.estoque) {
            this.activeTab = "overview";
          } else {
            this.activeTab = newTab;
          }
        } else {
          this.activeTab = "overview";
        }
      },
      immediate: true,
    },
    "unidade.estoque": {
      handler() {
        // Reprocessar aba ativa quando dados da unidade carregarem
        const currentTab = this.$route.query.tab;
        if (currentTab === "estoque" && !this.unidade.estoque) {
          this.changeTab("overview");
        }
      },
    },
  },
  methods: {
    async carregarUnidade() {
      this.loading = true;
      try {
        const result = await functions.buscarUnidadePorId(this.id);
        if (result.success) {
          this.unidade = result.data;
          // Atualizar no store para o header se existir
          if (this.$store.commit) {
            this.$store.commit("setUnidadeAtual", result.data);
          }
        } else {
          console.error("Erro:", result.message || "Erro ao carregar unidade");
        }
      } catch (error) {
        console.error("Erro ao carregar unidade:", error);
      } finally {
        this.loading = false;
      }
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

    changeTab(tab) {
      let targetTab = this.validTabs.includes(tab) ? tab : "overview";
      if (targetTab === "estoque" && !this.unidade.estoque) {
        targetTab = "overview";
      }

      this.activeTab = targetTab;
      // Atualizar URL para manter estado após refresh
      this.$router.push({
        path: this.$route.path,
        query: { ...this.$route.query, tab: targetTab },
      });
    },

    contarItensDiferentes(entrada) {
      if (!entrada || !Array.isArray(entrada.itens)) {
        return 0;
      }

      const chaves = entrada.itens.map(
        (item, index) =>
          item.produto_id ??
          item.produto_nome ??
          item.nome ??
          item.descricao ??
          index
      );

      return new Set(chaves).size;
    },

    abrirModalEntrada() {
      const modalEl = document.getElementById("modalRegistrarEntrada");
      if (!modalEl) {
        this.showNotification(
          "Não foi possível localizar o modal de entrada.",
          "error"
        );
        return;
      }

      try {
        const instance =
          bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        instance.show();
      } catch (error) {
        console.error("Erro ao abrir modal de entrada:", error);
        this.showNotification(
          "Não foi possível abrir o modal de entrada. Atualize a página e tente novamente.",
          "error"
        );
      }
    },

    handleEntradaRegistrada(payload) {
      const unidadeId = payload?.unidadeId || this.unidade?.id || null;
      const timestamp = new Date().toISOString();
      const novoId = `ENT-${(this.entradasMock.length + 1)
        .toString()
        .padStart(4, "0")}`;

      const novaEntrada = {
        id: novoId,
        unidade_id: unidadeId,
        created_at: timestamp,
        nota_fiscal: payload?.notaFiscal || null,
        fornecedor_id: payload?.fornecedorId || null,
        itens: (payload?.itens || []).map((item) => ({
          produto_id: item.produtoId,
          quantidade: item.quantidade,
        })),
      };

      this.entradasMock = [...this.entradasMock, novaEntrada];
      this.showNotification("Entrada registrada localmente.", "success");
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
          try {
            const modalEl = document.getElementById("editUnidade");
            if (
              modalEl &&
              window &&
              window.bootstrap &&
              window.bootstrap.Modal
            ) {
              const modal = window.bootstrap.Modal.getInstance(modalEl);
              if (modal) modal.hide();
            }
          } catch (e) {
            console.warn(
              "Não foi possível fechar editUnidade automaticamente:",
              e
            );
          }

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
