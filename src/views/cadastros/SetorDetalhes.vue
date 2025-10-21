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
              <div v-else-if="setor.id" class="card">
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
                    <li class="nav-item" v-if="setor.estoque">
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
                                Informações do Setor
                              </h5>
                            </div>
                            <div class="card-body">
                              <div class="row">
                                <div class="col-md-6">
                                  <div class="mb-3">
                                    <label class="form-label">Nome:</label>
                                    <p class="form-control-plaintext">
                                      {{ setor.nome }}
                                    </p>
                                  </div>
                                </div>
                                <div class="col-md-6">
                                  <div class="mb-3">
                                    <label class="form-label">Tipo:</label>
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
                                  </div>
                                </div>
                                <div class="col-md-6">
                                  <div class="mb-3">
                                    <label class="form-label">Status:</label>
                                    <span
                                      class="badge"
                                      :class="
                                        setor.status === 'A'
                                          ? 'bg-success'
                                          : 'bg-secondary'
                                      "
                                    >
                                      {{
                                        setor.status === "A"
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
                                        setor.estoque
                                          ? 'bg-warning'
                                          : 'bg-light text-dark'
                                      "
                                    >
                                      {{ setor.estoque ? "Sim" : "Não" }}
                                    </span>
                                  </div>
                                </div>
                                <div class="col-12" v-if="setor.descricao">
                                  <div class="mb-3">
                                    <label class="form-label">Descrição:</label>
                                    <p class="form-control-plaintext">
                                      {{ setor.descricao }}
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
                                  @click="editarSetor"
                                >
                                  <i class="mdi mdi-pencil me-2"></i>
                                  Editar Setor
                                </button>
                                <button
                                  class="btn btn-danger"
                                  @click="confirmarExclusao"
                                >
                                  <i class="mdi mdi-delete me-2"></i>
                                  Excluir Setor
                                </button>
                              </div>
                            </div>
                          </div>

                          <!-- Informações adicionais -->
                          <!-- Fornecedores relacionados (novo card) -->
                          <div
                            v-if="
                              setor.fornecedores_relacionados &&
                              setor.fornecedores_relacionados.length > 0
                            "
                            class="card border mt-3"
                          >
                            <div class="card-header">
                              <h5 class="card-title mb-0">
                                <i
                                  class="mdi mdi-truck-delivery-outline me-2"
                                ></i>
                                Fornecedores Relacionados
                              </h5>
                            </div>
                            <div class="card-body">
                              <div
                                v-for="rel of setor.fornecedores_relacionados"
                                :key="rel.id"
                                class="mb-3 border rounded p-2"
                              >
                                <div
                                  class="d-flex justify-content-between align-items-start"
                                >
                                  <div>
                                    <div class="fw-bold">
                                      {{
                                        rel.fornecedor?.nome ||
                                        rel.fornecedor?.razao_social_nome ||
                                        rel.fornecedor?.razao_social ||
                                        "Fornecedor desconhecido"
                                      }}
                                    </div>
                                    <div class="text-muted small">
                                      {{ rel.fornecedor?.descricao || "" }}
                                    </div>
                                  </div>
                                  <div class="text-end">
                                    <span
                                      class="badge"
                                      :class="
                                        rel.tipo_produto === 'Medicamento'
                                          ? 'bg-info'
                                          : 'bg-primary'
                                      "
                                    >
                                      {{
                                        rel.tipo_produto ||
                                        rel.fornecedor?.tipo ||
                                        "-"
                                      }}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

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
                                  {{ formatarData(setor.created_at) }}
                                </p>
                              </div>
                              <div class="mb-0">
                                <small class="text-muted">Atualizado em:</small>
                                <p class="mb-0">
                                  {{ formatarData(setor.updated_at) }}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Estoque Tab -->
                    <div v-show="activeTab === 'estoque'">
                      <EstoqueSetor
                        v-if="setor.id"
                        :setorId="setor.id"
                        :key="setor.id"
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
                            Registros de entradas já lançadas para este setor.
                          </p>
                        </div>
                        <button
                          class="btn btn-success"
                          @click="abrirModalEntrada"
                          :disabled="!setor.id"
                        >
                          <i class="mdi mdi-plus me-2"></i>
                          Registrar Entrada
                        </button>
                      </div>

                      <div
                        v-if="listEntradas.length > 0"
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
                              v-for="entrada in listEntradas"
                              :key="entrada.id"
                              @click="visualizarEntrada(entrada)"
                              style="cursor: pointer"
                              class="hover-row"
                            >
                              <td class="text-start">{{ entrada.id }}</td>
                              <td class="text-start">
                                {{ formatarData(entrada.created_at) }}
                              </td>
                              <td class="text-start">
                                {{ entrada.nota_fiscal }}
                              </td>
                              <td class="text-center">
                                {{ entrada.itens?.length || 0 }}
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
                <h5>Setor n</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Entrada de Estoque -->
    <ModalEntradaEstoque idModal="modalEntradaEstoque" :unidade="setor" />

    <!-- Modal de Visualização de Entrada -->
    <ModalVisualizarEntrada
      idModal="modalVisualizarEntrada"
      :entrada="entradaSelecionada"
    />
    <!-- Modal de Edição/Cadastro de Setor (instância local para este view) -->
    <ModalSetor idModal="addUPSetor" :functions="functions" />
  </TemplateAdmin>
</template>

<script>
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import EstoqueSetor from "./EstoqueSetor.vue";
import ModalEntradaEstoque from "@/components/cadastros/ModalEntradaEstoque.vue";
import ModalVisualizarEntrada from "@/components/cadastros/ModalVisualizarEntrada.vue";
import ModalSetor from "@/components/cadastros/ModalSetor.vue";
import functions from "@/functions/cad_setores.js";
import * as bootstrap from "bootstrap";
import functionsEntradas from "@/functions/cad_entradas.js";

export default {
  name: "SetorDetalhesView",
  components: {
    TemplateAdmin,
    EstoqueSetor,
    ModalEntradaEstoque,
    ModalVisualizarEntrada,
    ModalSetor,
  },
  data() {
    return {
      setor: {},
      loading: true,
      error: null,
      activeTab: "overview",
      entradaSelecionada: null,
      functions: functions,
    };
  },
  computed: {
    setorNomeAtual() {
      return this.setor?.nome || "Carregando...";
    },
    listEntradas() {
      const entradas = this.$store.getters.getListEntradas;
      console.log("listEntradas computed:", entradas);
      return entradas;
    },
  },
  mounted() {
    this.initTabFromRoute();
    // Observar mudanças na query 'tab' (back/forward do browser)
    this.$watch(
      () => this.$route.query.tab,
      (newTab) => {
        const tab = this.normalizeTab(newTab);
        this.activeTab = tab;
      }
    );

    this.carregarSetor();
  },
  methods: {
    async carregarSetor() {
      try {
        this.loading = true;
        const setorId = this.$route.params.id;
        const response = await this.$axios.post(
          `/setores/listData`,
          {
            id: setorId,
          },
          {
            headers: {
              Authorization: "Bearer " + this.$store.getters.getUserToken,
            },
          }
        );
        this.setor = response.data.data;
        // DEBUG: inspeciona o payload retornado do backend para este setor
        console.log("carregarSetor response.data:", response.data);
        console.log("carregarSetor setor (data):", this.setor);
        // se existir fornecedores relacionados no payload, logar especificamente
        if (this.setor.fornecedores_relacionados) {
          console.log(
            "fornecedores_relacionados:",
            this.setor.fornecedores_relacionados
          );
        }
        if (this.setor.fornecedores) {
          console.log("fornecedores:", this.setor.fornecedores);
        }
        this.$store.commit("setSetorAtual", this.setor);

        // Carregar entradas do setor
        await this.carregarEntradas();
      } catch (error) {
        console.error("Erro ao carregar setor:", error);
        this.error = "Erro ao carregar dados do setor";
      } finally {
        this.loading = false;
      }
    },
    abrirModalEntrada() {
      // Abrir modal de entrada de estoque
      const modal = new bootstrap.Modal(
        document.getElementById("modalEntradaEstoque")
      );
      modal.show();
    },
    async carregarEntradas() {
      if (this.setor?.id) {
        await functionsEntradas.listByUnidade(this, this.setor.id);
      }
    },
    visualizarEntrada(entrada) {
      console.log("Visualizar entrada:", entrada);
      this.entradaSelecionada = entrada;
      // Abrir modal de visualização
      const modal = new bootstrap.Modal(
        document.getElementById("modalVisualizarEntrada")
      );
      modal.show();
    },
    formatarData(data) {
      if (!data) return null;

      // Se o backend retornar um timestamp com 'T', pegar apenas a parte da data
      let dataStr = String(data);
      if (dataStr.includes("T")) {
        dataStr = dataStr.split("T")[0];
      }

      const parts = dataStr.split("-");
      if (parts.length < 3) return null;
      const [ano, mes, dia] = parts;
      // Retornar no formato dd/mm/yyyy
      return `${dia}/${mes}/${ano}`;
    },
    changeTab(tab) {
      const normalized = this.normalizeTab(tab);
      this.activeTab = normalized;

      // Atualizar URL mantendo outros query params
      try {
        const newQuery = Object.assign({}, this.$route.query || {});
        newQuery.tab = normalized;
        // usar replace para não poluir histórico quando a mudança for automática
        this.$router
          .push({ path: this.$route.path, query: newQuery })
          .catch(() => {});
      } catch (e) {
        console.warn("Não foi possível atualizar a URL com a tab:", e);
      }
    },
    // Garante valores válidos e fallback para 'overview'
    normalizeTab(tab) {
      const allowed = [
        "overview",
        "estoque",
        "movimentacoes",
        "entrada",
        "usuarios",
      ];
      if (!tab || typeof tab !== "string") return "overview";
      return allowed.includes(tab) ? tab : "overview";
    },
    initTabFromRoute() {
      const queryTab = this.$route.query?.tab;
      this.activeTab = this.normalizeTab(queryTab);
      // garantir que a URL contenha o param (substitui sem adicionar entrada no histórico)
      try {
        const newQuery = Object.assign({}, this.$route.query || {});
        newQuery.tab = this.activeTab;
        this.$router
          .replace({ path: this.$route.path, query: newQuery })
          .catch(() => {});
      } catch (e) {
        /* ignore */
      }
    },
    editarSetor() {
      // Prepara e abre o modal de edição do setor atual
      this.$store.commit("SET_MODAL_DATA", {
        modalTitle: "Editar Setor",
        modalData: { ...this.setor },
        modalFunction: "UP",
      });

      // Mostrar o modal (id usado pelo componente ModalSetor)
      const modalEl = document.getElementById("addUPSetor");
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      } else {
        console.warn("Modal addUPSetor não encontrado no DOM");
      }
    },
  },
};
</script>
